import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

const QuickSecurityActions = () => {
  const actions = [
    {
      title: "Guard Profiles",
      desc: "Manage & enroll personnel",
      icon: "mdi-account-multiple-plus",
      link: "/profilepage",
      color: "primary",
    },
    {
      title: "Security Roster",
      desc: "Configure weekly shifts",
      icon: "mdi-calendar-sync",
      link: "/security-roaster",
      color: "info",
    },
    {
      title: "Apply Leave / OD",
      desc: "Submit duty or leave request",
      icon: "mdi-file-document-edit",
      link: "/applied-od",
      color: "warning",
    },
    {
      title: "Month-Wise Report",
      desc: "Analyze attendance metrics",
      icon: "mdi-chart-box-outline",
      link: "/month-wise-report",
      color: "success",
    },
  ];

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <h4 className="card-title mb-4">Quick Security Management</h4>
        <Row className="g-3">
          {actions.map((act, idx) => (
            <Col sm={6} key={idx}>
              <Link to={act.link} className="text-decoration-none">
                <div className="p-3 border rounded text-center h-100 hover-shadow transition-all bg-light">
                  <div className={`avatar-sm mx-auto mb-2 text-${act.color}`}>
                    <i className={`mdi ${act.icon} font-size-28`}></i>
                  </div>
                  <h6 className="font-size-14 text-dark mb-1">{act.title}</h6>
                  <p className="text-muted font-size-12 mb-0">{act.desc}</p>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

export default QuickSecurityActions;
