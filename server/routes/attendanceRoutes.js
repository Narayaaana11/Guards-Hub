const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../data/db');

// GET attendance by date
router.get('/get/byDate/:date', (req, res) => {
  try {
    const db = readDB();
    const date = req.params.date;

    let records = (db.attendance || []).filter((a) => a.date === date);

    // If no records for this date, automatically synthesize default records for existing employees
    if (records.length === 0 && db.employees && db.employees.length > 0) {
      records = db.employees.map((emp) => {
        const rosterEntry = (db.roster || []).find((r) => String(r.empId) === String(emp.empId));
        // Check day of week
        const d = new Date(date);
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = isNaN(d) ? 'monday' : days[d.getDay()];
        const shift = rosterEntry?.weeklyShifts?.[dayName] || 'General';
        const isWO = shift === 'WO';

        return {
          _id: `att_${emp.empId}_${date}`,
          empId: String(emp.empId),
          empName: emp.empName,
          date: date,
          inTime: isWO ? '00:00' : '09:00',
          outTime: isWO ? '00:00' : '18:00',
          shift: shift,
          status: isWO ? 'Week Off' : 'Present',
        };
      });

      // Save synthesized records
      db.attendance = [...(db.attendance || []), ...records];
      writeDB(db);
    }

    res.json({ data: records, status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add attendance
router.post('/add', (req, res) => {
  try {
    const db = readDB();
    const body = req.body;

    const newRecord = {
      _id: `att_${body.empId}_${body.date || new Date().toISOString().split('T')[0]}_${Date.now()}`,
      empId: String(body.empId),
      empName: body.empName || body.name || '',
      date: body.date || new Date().toISOString().split('T')[0],
      inTime: body.inTime || '09:00',
      outTime: body.outTime || '18:00',
      shift: body.shift || 'General',
      status: body.status || 'Present',
    };

    db.attendance = db.attendance || [];
    // Replace existing for same emp and date if exists
    const existingIndex = db.attendance.findIndex((a) => String(a.empId) === newRecord.empId && a.date === newRecord.date);
    if (existingIndex !== -1) {
      db.attendance[existingIndex] = newRecord;
    } else {
      db.attendance.push(newRecord);
    }

    writeDB(db);
    res.status(201).json({ message: 'Attendance recorded successfully', data: newRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update attendance
router.put('/update/:empId', (req, res) => {
  try {
    const db = readDB();
    const empId = String(req.params.empId);
    const body = req.body;
    const date = body.date || new Date().toISOString().split('T')[0];

    db.attendance = db.attendance || [];
    const index = db.attendance.findIndex((a) => String(a.empId) === empId && a.date === date);

    if (index !== -1) {
      db.attendance[index] = { ...db.attendance[index], ...body, empId, date };
    } else {
      const newRec = {
        _id: `att_${empId}_${date}`,
        empId,
        empName: body.empName || '',
        date,
        inTime: body.inTime || '09:00',
        outTime: body.outTime || '18:00',
        shift: body.shift || 'General',
        status: body.status || 'Present',
      };
      db.attendance.push(newRec);
    }

    writeDB(db);
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
