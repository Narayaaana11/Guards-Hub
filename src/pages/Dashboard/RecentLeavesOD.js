import React from "react";
import { Card, CardBody, Badge, Table } from "reactstrap";
import { Link } from "react-router-dom";

const RecentLeavesOD = ({ leaves = [], ods = [] }) => {
  const combined = [
    ...leaves.map((l) => ({ ...l, type: "Leave", category: l.leaveType || "Casual Leave" })),
    ...ods.map((o) => ({ ...o, type: "On-Duty", category: o.odType || "Official Duty" })),
  ].slice(0, 5);

  return (
    <Card className="shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0">Recent Leaves & OD Requests</h4>
          <Link to="/LeaveOdManagement" className="btn btn-sm btn-outline-primary">
            Manage
          </Link>
        </div>

        <div className="table-responsive">
          <Table className="table align-middle table-nowrap table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Guard</th>
                <th>Request Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {combined.map((item, idx) => (
                <tr key={item._id || idx}>
                  <td>
                    <span className="fw-semibold">{item.empName}</span>
                    <br />
                    <small className="text-muted">ID: {item.empId}</small>
                  </td>
                  <td>
                    <Badge color={item.type === "Leave" ? "warning" : "info"} className="me-1">
                      {item.type}
                    </Badge>
                    <small className="d-block text-muted">{item.category}</small>
                  </td>
                  <td>
                    <small>
                      {item.fromDate} <br /> to {item.toDate}
                    </small>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: "160px" }}>
                    <small title={item.reason}>{item.reason}</small>
                  </td>
                  <td>
                    <Badge
                      color={
                        item.status === "Approved"
                          ? "success"
                          : item.status === "Rejected"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {item.status || "Pending"}
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

export default RecentLeavesOD;
