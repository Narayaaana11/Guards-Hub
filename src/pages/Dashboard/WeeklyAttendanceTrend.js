import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import ReactApexChart from "react-apexcharts";

const WeeklyAttendanceTrend = () => {
  const options = {
    colors: ["#7a6fbe", "#28bbe3"],
    chart: {
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      borderColor: "#f8f8fa",
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Guards`,
      },
    },
  };

  const series = [
    {
      name: "Scheduled Guards",
      data: [10, 10, 10, 10, 10, 10, 10],
    },
    {
      name: "Guards Present / On Duty",
      data: [9, 8, 9, 8, 9, 8, 7],
    },
  ];

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <h4 className="card-title mb-4">Weekly Guard Turnout & Attendance</h4>
        <Row className="text-center mt-2 mb-3">
          <Col xs="4">
            <h5 className="font-size-18 text-primary mb-1">92.8%</h5>
            <p className="text-muted mb-0 font-size-12">Avg. Turnout</p>
          </Col>
          <Col xs="4">
            <h5 className="font-size-18 text-info mb-1">8.5 / 10</h5>
            <p className="text-muted mb-0 font-size-12">Daily Present</p>
          </Col>
          <Col xs="4">
            <h5 className="font-size-18 text-success mb-1">0 Breach</h5>
            <p className="text-muted mb-0 font-size-12">Shift Security</p>
          </Col>
        </Row>
        <div dir="ltr">
          <ReactApexChart options={options} series={series} type="area" height="250" />
        </div>
      </CardBody>
    </Card>
  );
};

export default WeeklyAttendanceTrend;
