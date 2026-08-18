const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../data/db');

// --- LEAVE ROUTES ---

// GET leaves
router.get('/leave/leaves', (req, res) => {
  try {
    const db = readDB();
    const { fromDate, toDate } = req.query;
    let leaves = db.leaves || [];

    if (fromDate && toDate) {
      leaves = leaves.filter((l) => l.fromDate >= fromDate && l.toDate <= toDate);
    }

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST apply leave
router.post('/leave/apply', (req, res) => {
  try {
    const db = readDB();
    const body = req.body;

    const newLeave = {
      _id: `leave_${Date.now()}`,
      empId: String(body.empId),
      empName: body.empName || body.name || 'Employee',
      leaveType: body.leaveType || 'Casual Leave',
      fromDate: body.fromDate,
      toDate: body.toDate,
      reason: body.reason || '',
      status: body.status || 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    db.leaves = db.leaves || [];
    db.leaves.push(newLeave);
    writeDB(db);

    res.status(201).json({ message: 'Leave application submitted successfully', data: newLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update leave
router.put('/leave/update/:id', (req, res) => {
  try {
    const db = readDB();
    const id = String(req.params.id);
    db.leaves = db.leaves || [];
    const index = db.leaves.findIndex((l) => String(l._id) === id || String(l.id) === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    db.leaves[index] = { ...db.leaves[index], ...req.body, _id: db.leaves[index]._id };
    writeDB(db);

    res.json({ message: 'Leave updated successfully', data: db.leaves[index] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE leave
router.delete('/leave/delete/:id', (req, res) => {
  try {
    const db = readDB();
    const id = String(req.params.id);
    db.leaves = (db.leaves || []).filter((l) => String(l._id) !== id && String(l.id) !== id);
    writeDB(db);
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET remaining CLs for employee
router.get('/leaves/remaining-cl/:empId', (req, res) => {
  try {
    const db = readDB();
    const empId = String(req.params.empId);
    const approvedLeaves = (db.leaves || []).filter(
      (l) => String(l.empId) === empId && l.leaveType === 'Casual Leave' && l.status === 'Approved'
    );

    const usedCL = approvedLeaves.length;
    const totalCL = 12;
    const remainingCL = Math.max(0, totalCL - usedCL);

    res.json({ remainingCL, totalCL, usedCL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ON-DUTY (OD) ROUTES ---

// GET ODs
router.get('/od/ods', (req, res) => {
  try {
    const db = readDB();
    const { fromDate, toDate } = req.query;
    let ods = db.ods || [];

    if (fromDate && toDate) {
      ods = ods.filter((o) => o.fromDate >= fromDate && o.toDate <= toDate);
    }

    res.json(ods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST apply OD
router.post('/od/apply', (req, res) => {
  try {
    const db = readDB();
    const body = req.body;

    const newOd = {
      _id: `od_${Date.now()}`,
      empId: String(body.empId),
      empName: body.empName || body.name || 'Employee',
      odType: body.odType || 'Official Duty',
      fromDate: body.fromDate,
      toDate: body.toDate,
      reason: body.reason || '',
      status: body.status || 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    db.ods = db.ods || [];
    db.ods.push(newOd);
    writeDB(db);

    res.status(201).json({ message: 'OD application submitted successfully', data: newOd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update OD
router.put('/od/update/:id', (req, res) => {
  try {
    const db = readDB();
    const id = String(req.params.id);
    db.ods = db.ods || [];
    const index = db.ods.findIndex((o) => String(o._id) === id || String(o.id) === id);

    if (index === -1) {
      return res.status(404).json({ message: 'OD record not found' });
    }

    db.ods[index] = { ...db.ods[index], ...req.body, _id: db.ods[index]._id };
    writeDB(db);

    res.json({ message: 'OD updated successfully', data: db.ods[index] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE OD
router.delete('/od/delete/:id', (req, res) => {
  try {
    const db = readDB();
    const id = String(req.params.id);
    db.ods = (db.ods || []).filter((o) => String(o._id) !== id && String(o.id) !== id);
    writeDB(db);
    res.json({ message: 'OD deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
