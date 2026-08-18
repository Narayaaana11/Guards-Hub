import React from "react";
import { Card, CardBody, Table, Badge } from "reactstrap";
import { Link } from "react-router-dom";

const ActiveGuardsTable = ({ employees = [] }) => {
  const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

  const displayedGuards = employees.slice(0, 6);

  const getShiftBadge = (shift) => {
    switch (shift) {
      case "Morning":
        return "primary";
      case "Evening":
        return "info";
      case "Night":
        return "dark";
      default:
        return "warning";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0">Active Security Guards On Duty</h4>
          <Link to="/profilepage" className="btn btn-sm btn-outline-primary">
            View All ({employees.length})
          </Link>
        </div>

        <div className="table-responsive">
          <Table className="table align-middle table-nowrap table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Guard</th>
                <th>Designation</th>
                <th>Assigned Post</th>
                <th>Shift</th>
                <th>Week Off</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedGuards.map((emp, index) => (
                <tr key={emp.empId || index}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={`${baseURL}/emp/uploads/${emp.empId}.jpg`}
                        onError={(e) => {
                          e.target.src = `${baseURL}/emp/uploads/0000.jpg`;
                        }}
                        alt={emp.empName}
                        className="rounded-circle avatar-xs me-2"
                        style={{ width: "32px", height: "32px", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="font-size-14 mb-0 fw-semibold">{emp.empName}</h6>
                        <small className="text-muted">ID: {emp.empId}</small>
                      </div>
                    </div>
                  </td>
                  <td>{emp.empDesignation}</td>
                  <td>{emp.empDepartment}</td>
                  <td>
                    <Badge color={getShiftBadge(index % 2 === 0 ? "Morning" : "Evening")}>
                      {index % 2 === 0 ? "Morning (06-14)" : "Evening (14-22)"}
                    </Badge>
                  </td>
                  <td>{emp.empWeekOff || "Sunday"}</td>
                  <td>
                    <Badge color="success" className="px-2 py-1">
                      <i className="mdi mdi-check-circle me-1"></i> On Duty
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default ActiveGuardsTable;
