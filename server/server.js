const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const empRoutes = require('./routes/empRoutes');
const rosterRoutes = require('./routes/rosterRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveOdRoutes = require('./routes/leaveOdRoutes');
const monthRoutes = require('./routes/monthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving for employee photos
app.use('/emp/uploads', express.static(uploadsDir));

// Route Mounts
app.use('/emp', empRoutes);
app.use('/roster', rosterRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/', leaveOdRoutes);
app.use('/month', monthRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Guards-Hub API Server',
    status: 'Running',
    version: '1.0.0',
    port: PORT,
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Guards-Hub Backend Server is running at http://localhost:${PORT}`);
});
