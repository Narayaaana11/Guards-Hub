import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Row, Col } from "reactstrap";
import axios from "axios";

// Dashboard Components
import SecurityKPIs from "./SecurityKPIs";
import ShiftDistribution from "./ShiftDistribution";
import WeeklyAttendanceTrend from "./WeeklyAttendanceTrend";
import PostDeployment from "./PostDeployment";
import ActiveGuardsTable from "./ActiveGuardsTable";
import RecentLeavesOD from "./RecentLeavesOD";
import SecurityActivityFeed from "./SecurityActivityFeed";
import QuickSecurityActions from "./QuickSecurityActions";

// Actions
import { setBreadcrumbItems } from "../../store/actions";

const Dashboard = (props) => {
  document.title = "Security Dashboard | Watch Dogs Guards-Hub";

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [ods, setOds] = useState([]);
  const [stats, setStats] = useState({
    totalGuards: "10",
    onDutyGuards: "8",
    onLeaveCount: "2",
    activePosts: "6",
  });

  const breadcrumbItems = [
    { title: "Watch Dogs", link: "#" },
    { title: "Security Dashboard", link: "#" },
  ];

  useEffect(() => {
    props.setBreadcrumbItems("Dashboard", breadcrumbItems);
  }, []);

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

    const fetchDashboardData = async () => {
      try {
        const [empRes, leaveRes, odRes] = await Promise.allSettled([
          axios.get(`${baseURL}/emp/details`),
          axios.get(`${baseURL}/leave/leaves`),
          axios.get(`${baseURL}/od/ods`),
        ]);

        const empData = empRes.status === "fulfilled" ? empRes.value.data : [];
        const leaveData = leaveRes.status === "fulfilled" ? leaveRes.value.data : [];
        const odData = odRes.status === "fulfilled" ? odRes.value.data : [];

        setEmployees(empData);
        setLeaves(leaveData);
        setOds(odData);

        if (empData.length > 0) {
          const total = empData.length;
          const activeLeaves = leaveData.filter((l) => l.status === "Approved").length;
          const activeOds = odData.filter((o) => o.status === "Approved").length;
          const onLeave = activeLeaves + activeOds;
          const onDuty = Math.max(1, total - onLeave);

          // Unique departments
          const uniqueDepts = new Set(empData.map((e) => e.empDepartment)).size;

          setStats({
            totalGuards: String(total),
            onDutyGuards: String(onDuty),
            onLeaveCount: String(onLeave),
            activePosts: String(Math.max(4, uniqueDepts)),
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <React.Fragment>
      {/* 1. Security KPI Metric Cards */}
      <SecurityKPIs stats={stats} />

      {/* 2. Visual Operations Charts */}
      <Row className="mb-4">
        <Col xl="3" lg="4" className="mb-3 mb-xl-0">
          <ShiftDistribution />
        </Col>
        <Col xl="6" lg="8" className="mb-3 mb-xl-0">
          <WeeklyAttendanceTrend />
        </Col>
        <Col xl="3" lg="12">
          <PostDeployment />
        </Col>
      </Row>

      {/* 3. Operational Active Tables */}
      <Row className="mb-4">
        <Col xl="7" className="mb-3 mb-xl-0">
          <ActiveGuardsTable employees={employees} />
        </Col>
        <Col xl="5">
          <RecentLeavesOD leaves={leaves} ods={ods} />
        </Col>
      </Row>

      {/* 4. Incident Feed & Quick Action Tools */}
      <Row>
        <Col xl="6" className="mb-3 mb-xl-0">
          <SecurityActivityFeed />
        </Col>
        <Col xl="6">
          <QuickSecurityActions />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(Dashboard);