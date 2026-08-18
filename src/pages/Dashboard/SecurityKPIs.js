import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";

const SecurityKPIs = ({ stats }) => {
  const reports = [
    {
      title: "Total Guards Enrolled",
      iconClass: "mdi-shield-account",
      total: stats?.totalGuards || "10",
      subText: "100% Verified Force",
      badgecolor: "success",
    },
    {
      title: "Guards On-Duty Today",
      iconClass: "mdi-account-clock",
      total: stats?.onDutyGuards || "8",
      subText: "Across 4 Shifts",
      badgecolor: "info",
    },
    {
      title: "On Leave / Official Duty",
      iconClass: "mdi-calendar-remove",
      total: stats?.onLeaveCount || "2",
      subText: "Authorized Absence",
      badgecolor: "warning",
    },
    {
      title: "Active Security Posts",
      iconClass: "mdi-security",
      total: stats?.activePosts || "6",
      subText: "24x7 Monitored",
      badgecolor: "primary",
    },
  ];

  return (
    <Row>
      {reports.map((report, key) => (
        <Col xl={3} sm={6} key={key}>
          <Card className="mini-stat bg-primary text-white shadow-sm border-0">
            <CardBody className="mini-stat-img p-4">
              <div className="mini-stat-icon">
                <i className={`float-end mdi ${report.iconClass} font-size-36 text-white-50`}></i>
              </div>
              <div>
                <h6 className="text-uppercase mb-2 font-size-13 text-white-50">{report.title}</h6>
                <h2 className="mb-3 text-white fw-bold">{report.total}</h2>
                <span className={`badge bg-${report.badgecolor} font-size-11 px-2 py-1`}>
                  Active
                </span>{" "}
                <span className="ms-2 font-size-12 text-white-50">{report.subText}</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SecurityKPIs;
