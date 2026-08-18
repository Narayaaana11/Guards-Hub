const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { readDB, writeDB } = require('../data/db');

// Multer configuration for employee photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const empId = req.body.empId || req.params.empId || 'temp';
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${empId}${ext}`);
  },
});

const upload = multer({ storage });

// GET all employees
router.get('/details', (req, res) => {
  try {
    const db = readDB();
    res.json(db.employees || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single employee by ID
router.get('/getemp/:empId', (req, res) => {
  try {
    const db = readDB();
    const emp = db.employees.find((e) => String(e.empId) === String(req.params.empId));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(emp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add employee
router.post('/addemp', upload.single('empImage'), (req, res) => {
  try {
    const db = readDB();
    const body = req.body;
    const empId = String(body.empId || Date.now());

    // Check if employee ID already exists
    const exists = db.employees.some((e) => String(e.empId) === empId);
    if (exists) {
      return res.status(400).json({ message: `Employee with ID ${empId} already exists.` });
    }

    const newEmp = {
      empId,
      empName: body.empName || '',
      empDesignation: body.empDesignation || 'Security Guard',
      empDepartment: body.empDepartment || 'Main Security',
      empMobileNo: body.empMobileNo || '',
      empAadharNo: body.empAadharNo || '',
      empPanNo: body.empPanNo || '',
      empDob: body.empDob || null,
      empDoj: body.empDoj || null,
      bankAccountNo: body.bankAccountNo || '',
      epfNo: body.epfNo || '',
      esiNo: body.esiNo || '',
      empWeekOff: body.empWeekOff || 'Sunday',
      empImage: req.file ? req.file.filename : `${empId}.jpg`,
      address: body.address || '',
    };

    db.employees.push(newEmp);

    // Also create matching roster entry if not existing
    const rosterExists = db.roster.some((r) => String(r.empId) === empId);
    if (!rosterExists) {
      db.roster.push({
        id: empId,
        empId,
        name: newEmp.empName,
        department: newEmp.empDepartment,
        designation: newEmp.empDesignation,
        weeklyShifts: {
          sunday: newEmp.empWeekOff === 'Sunday' ? 'WO' : 'General',
          monday: newEmp.empWeekOff === 'Monday' ? 'WO' : 'General',
          tuesday: newEmp.empWeekOff === 'Tuesday' ? 'WO' : 'General',
          wednesday: newEmp.empWeekOff === 'Wednesday' ? 'WO' : 'General',
          thursday: newEmp.empWeekOff === 'Thursday' ? 'WO' : 'General',
          friday: newEmp.empWeekOff === 'Friday' ? 'WO' : 'General',
          saturday: newEmp.empWeekOff === 'Saturday' ? 'WO' : 'General',
        },
        shiftFromDate: '2026-08-01',
        shiftToDate: '2026-08-31',
      });
    }

    writeDB(db);
    res.status(201).json({ message: 'Employee added successfully', employee: newEmp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update employee
router.put('/update/:empId', upload.single('empImage'), (req, res) => {
  try {
    const db = readDB();
    const empIndex = db.employees.findIndex((e) => String(e.empId) === String(req.params.empId));
    if (empIndex === -1) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const current = db.employees[empIndex];
    const body = req.body;

    db.employees[empIndex] = {
      ...current,
      ...body,
      empId: current.empId, // prevent ID change
      empImage: req.file ? req.file.filename : current.empImage,
    };

    // Update roster if name/department/designation changed
    const rIndex = db.roster.findIndex((r) => String(r.empId) === String(current.empId));
    if (rIndex !== -1) {
      db.roster[rIndex].name = db.employees[empIndex].empName;
      db.roster[rIndex].department = db.employees[empIndex].empDepartment;
      db.roster[rIndex].designation = db.employees[empIndex].empDesignation;
    }

    writeDB(db);
    res.json({ message: 'Employee updated successfully', employee: db.employees[empIndex] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE employee
router.delete('/delete/:empId', (req, res) => {
  try {
    const db = readDB();
    const empId = String(req.params.empId);
    db.employees = db.employees.filter((e) => String(e.empId) !== empId);
    db.roster = db.roster.filter((r) => String(r.empId) !== empId);
    writeDB(db);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
