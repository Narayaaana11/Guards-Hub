import React from "react";
import { Card, CardBody } from "reactstrap";

const SecurityActivityFeed = () => {
  const activities = [
    {
      time: "06:00 AM",
      title: "Morning Shift Handover Complete",
      desc: "Head Guard Rajesh Kumar assumed charge at Main Gate. 4 guards logged in.",
      icon: "mdi-shield-check",
      color: "success",
    },
    {
      time: "08:30 AM",
      title: "CCTV Surveillance Sweep",
      desc: "Amit Verma verified all 32 perimeter IP cameras online and recording.",
      icon: "mdi-cctv",
      color: "primary",
    },
    {
      time: "10:15 AM",
      title: "VIP Convoy Escort Dispatched",
      desc: "Armed Officer Vikram Rathore dispatched for Board of Directors escort from Airport.",
      icon: "mdi-car-estate",
      color: "info",
    },
    {
      time: "12:00 PM",
      title: "Emergency Response (QRT) Drill",
      desc: "Deepak Yadav led routine fire exit check and campus alarm test.",
      icon: "mdi-bell-ring-outline",
      color: "warning",
    },
  ];

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <h4 className="card-title mb-4">Security Incident & Log Feed</h4>
        <ol className="activity-feed mb-0 list-unstyled ps-0">
          {activities.map((act, idx) => (
            <li className="feed-item mb-3 d-flex" key={idx}>
              <div className="me-3">
                <span className={`avatar-xs rounded-circle bg-${act.color} text-white d-inline-flex align-items-center justify-content-center`} style={{ width: "32px", height: "32px" }}>
                  <i className={`mdi ${act.icon} font-size-16`}></i>
                </span>
              </div>
              <div>
                <div className="text-muted font-size-11 mb-1">{act.time}</div>
                <h6 className="font-size-14 mb-1">{act.title}</h6>
                <p className="text-muted font-size-12 mb-0">{act.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
};

export default SecurityActivityFeed;
