import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;
              
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sawari_db';

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB (sawari_db)'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Single Location Document per Ride (no unnecessary history)
const rideLocationSchema = new mongoose.Schema(
  {
    rideId: { type: String, required: true, unique: true, index: true },
    driverId: { type: String, required: true },
    driverName: { type: String, default: 'Driver' },
    passengerIds: { type: [String], default: [] },
    isSharing: { type: Boolean, default: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: 0 },
    speed: { type: Number, default: null },
    heading: { type: Number, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const RideLocation = mongoose.model('RideLocation', rideLocationSchema);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SAWARI Location Tracking API' });
});

/**
 * 1. Authorize passenger for a ride
 */
app.post('/api/location/authorize-passenger', async (req, res) => {
  try {
    const { rideId, passengerId, driverId } = req.body;
    if (!rideId || !passengerId) {
      return res.status(400).json({ error: 'rideId and passengerId are required.' });
    }

    let record = await RideLocation.findOne({ rideId });
    if (!record) {
      // Pre-initialize record with authorized passenger
      record = new RideLocation({
        rideId,
        driverId: driverId || 'unassigned',
        passengerIds: [passengerId],
        isSharing: false,
        latitude: 0,
        longitude: 0,
      });
    } else {
      if (!record.passengerIds.includes(passengerId)) {
        record.passengerIds.push(passengerId);
      }
    }
    await record.save();
    return res.json({ success: true, authorizedPassengers: record.passengerIds });
  } catch (err) {
    console.error('Error authorizing passenger:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * 2. Driver Location Update API
 * - Only the authorized driver can update the ride location
 * - Updates latest GPS coordinates
 */
app.post('/api/location/update', async (req, res) => {
  try {
    const {
      rideId,
      userId,
      driverName,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      isSharing,
      passengerIds,
    } = req.body;

    if (!rideId || !userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: rideId, userId, latitude, longitude',
      });
    }

    let record = await RideLocation.findOne({ rideId });

    if (record) {
      // Verify authorization: only the assigned driver can update location
      if (record.driverId && record.driverId !== 'unassigned' && record.driverId !== userId) {
        return res.status(403).json({
          error: 'Forbidden: Only the authorized driver can update this ride location.',
        });
      }

      // Update location
      record.driverId = userId;
      if (driverName) record.driverName = driverName;
      record.latitude = Number(latitude);
      record.longitude = Number(longitude);
      record.accuracy = accuracy ? Number(accuracy) : 0;
      record.speed = speed !== undefined ? speed : null;
      record.heading = heading !== undefined ? heading : null;
      record.isSharing = isSharing !== undefined ? Boolean(isSharing) : true;
      record.updatedAt = new Date();

      if (Array.isArray(passengerIds)) {
        passengerIds.forEach((pid) => {
          if (!record.passengerIds.includes(pid)) {
            record.passengerIds.push(pid);
          }
        });
      }
    } else {
      // Create new active location session
      record = new RideLocation({
        rideId,
        driverId: userId,
        driverName: driverName || 'Driver',
        passengerIds: Array.isArray(passengerIds) ? passengerIds : [],
        isSharing: isSharing !== undefined ? Boolean(isSharing) : true,
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy ? Number(accuracy) : 0,
        speed: speed !== undefined ? speed : null,
        heading: heading !== undefined ? heading : null,
        updatedAt: new Date(),
      });
    }

    await record.save();

    return res.json({
      success: true,
      rideId: record.rideId,
      isSharing: record.isSharing,
      updatedAt: record.updatedAt,
    });
  } catch (err) {
    console.error('Error updating location:', err);
    return res.status(500).json({ error: 'Server error updating location' });
  }
});

/**
 * 3. Driver Stop Trip API
 * - Only authorized driver can stop location sharing
 * - Sets isSharing to false
 */
app.post('/api/location/stop', async (req, res) => {
  try {
    const { rideId, userId } = req.body;

    if (!rideId || !userId) {
      return res.status(400).json({ error: 'Missing rideId or userId' });
    }

    const record = await RideLocation.findOne({ rideId });
    if (!record) {
      return res.status(404).json({ error: 'Ride location session not found' });
    }

    if (record.driverId !== userId) {
      return res.status(403).json({
        error: 'Forbidden: Only the driver can stop location sharing for this ride.',
      });
    }

    record.isSharing = false;
    record.updatedAt = new Date();
    await record.save();

    return res.json({
      success: true,
      message: 'Trip sharing stopped successfully.',
      isSharing: false,
    });
  } catch (err) {
    console.error('Error stopping location sharing:', err);
    return res.status(500).json({ error: 'Server error stopping location' });
  }
});

/**
 * 4. Location Retrieval API
 * - Only the authorized driver or confirmed booked passengers can view location
 * - Does not expose location to unrelated users
 */
app.get('/api/location/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized: User ID must be provided to access live location.',
      });
    }

    const record = await RideLocation.findOne({ rideId });
    if (!record) {
      return res.status(404).json({
        error: 'No live tracking session has been created for this ride yet.',
        isSharing: false,
      });
    }

    // Authorization check
    const isDriver = record.driverId === userId;
    const isPassenger = record.passengerIds.includes(userId);

    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        error: 'Forbidden: You are not authorized to view this cab live location.',
        isAuthorized: false,
      });
    }

    // If sharing has stopped
    if (!record.isSharing) {
      return res.json({
        isSharing: false,
        rideId: record.rideId,
        message: 'Trip sharing is inactive or has been ended by the driver.',
        updatedAt: record.updatedAt,
      });
    }

    // Return live coordinates to authorized viewer
    return res.json({
      isSharing: true,
      rideId: record.rideId,
      driverName: record.driverName,
      latitude: record.latitude,
      longitude: record.longitude,
      accuracy: record.accuracy,
      speed: record.speed,
      heading: record.heading,
      updatedAt: record.updatedAt,
    });
  } catch (err) {
    console.error('Error retrieving location:', err);
    return res.status(500).json({ error: 'Server error retrieving location' });
  }
});

app.listen(PORT,"0.0.0.0", () => {
  console.log(`SAWARI Live Location Express Server running on port ${PORT}`);
});
