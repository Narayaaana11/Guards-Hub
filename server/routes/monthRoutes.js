const express = require('express');
const router = express.Router();
const { readDB } = require('../data/db');

// GET month-wise report for employee
router.get('/monthwise-report/:empId', (req, res) => {
  try {
    const db = readDB();
    const empId = String(req.params.empId);
    const { startDate, endDate } = req.query;

    const emp = (db.employees || []).find((e) => String(e.empId) === empId);
    const roster = (db.roster || []).find((r) => String(r.empId) === empId);

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dailyRecords = [];
    let presentCount = 0;
    let weekOffCount = 0;
    let leaveCount = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      const shift = roster?.weeklyShifts?.[dayName] || (emp?.empWeekOff?.toLowerCase() === dayName ? 'WO' : 'General');

      // Check attendance
      const att = (db.attendance || []).find((a) => String(a.empId) === empId && a.date === dateStr);
      // Check leave
      const leave = (db.leaves || []).find(
        (l) => String(l.empId) === empId && l.status === 'Approved' && dateStr >= l.fromDate && dateStr <= l.toDate
      );

      let status = 'Present';
      if (leave) {
        status = leave.leaveType || 'Leave';
        leaveCount++;
      } else if (shift === 'WO' || att?.status === 'Week Off') {
        status = 'Week Off';
        weekOffCount++;
      } else {
        presentCount++;
      }

      dailyRecords.push({
        date: dateStr,
        day: dayName.toUpperCase().slice(0, 3),
        shift: shift,
        inTime: att?.inTime || (status === 'Week Off' ? '00:00' : '09:00'),
        outTime: att?.outTime || (status === 'Week Off' ? '00:00' : '18:00'),
        status: status,
      });
    }

    res.json({
      empId,
      empName: emp?.empName || 'Employee',
      department: emp?.empDepartment || 'Security',
      designation: emp?.empDesignation || 'Security Guard',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalDays: dailyRecords.length,
      presentDays: presentCount,
      weekOffs: weekOffCount,
      leaves: leaveCount,
      records: dailyRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
