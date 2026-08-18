const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../data/db');

// GET all guards roster
router.get('/guards', (req, res) => {
  try {
    const db = readDB();
    res.json(db.roster || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single guard roster
router.get('/guard/:empId', (req, res) => {
  try {
    const db = readDB();
    const guard = db.roster.find((r) => String(r.empId) === String(req.params.empId) || String(r.id) === String(req.params.empId));
    if (!guard) {
      return res.status(404).json({ message: 'Guard roster not found' });
    }
    res.json(guard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add shift
router.post('/addShift', (req, res) => {
  try {
    const db = readDB();
    const body = req.body;
    const empId = String(body.empId || body.id || Date.now());

    const existingIndex = db.roster.findIndex((r) => String(r.empId) === empId || String(r.id) === empId);

    const shiftData = {
      id: empId,
      empId: empId,
      name: body.name || body.empName || 'Guard',
      department: body.department || 'Security',
      designation: body.designation || 'Security Guard',
      weeklyShifts: body.weeklyShifts || {
        sunday: body.sunday || 'General',
        monday: body.monday || 'General',
        tuesday: body.tuesday || 'General',
        wednesday: body.wednesday || 'General',
        thursday: body.thursday || 'General',
        friday: body.friday || 'General',
        saturday: body.saturday || 'General',
      },
      shiftFromDate: body.shiftFromDate || body.fromDate || '2026-08-01',
      shiftToDate: body.shiftToDate || body.toDate || '2026-08-31',
    };

    if (existingIndex !== -1) {
      db.roster[existingIndex] = { ...db.roster[existingIndex], ...shiftData };
    } else {
      db.roster.push(shiftData);
    }

    writeDB(db);
    res.status(201).json({ message: 'Shift saved successfully', data: shiftData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update shift
router.put('/update/:id', (req, res) => {
  try {
    const db = readDB();
    const id = String(req.params.id);
    const index = db.roster.findIndex((r) => String(r.id) === id || String(r.empId) === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Guard roster not found' });
    }

    db.roster[index] = {
      ...db.roster[index],
      ...req.body,
      id: db.roster[index].id,
      empId: db.roster[index].empId,
    };

    writeDB(db);
    res.json({ message: 'Shift updated successfully', data: db.roster[index] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
