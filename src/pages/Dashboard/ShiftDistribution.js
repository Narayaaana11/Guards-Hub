import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import ReactApexChart from "react-apexcharts";

const ShiftDistribution = ({ shiftCounts }) => {
  const morning = shiftCounts?.Morning || 4;
  const evening = shiftCounts?.Evening || 2;
  const night = shiftCounts?.Night || 2;
  const general = shiftCounts?.General || 2;

  const series = [morning, evening, night, general];

  const options = {
    labels: ["Morning Shift", "Evening Shift", "Night Shift", "General Shift"],
    colors: ["#7a6fbe", "#28bbe3", "#29bbe3", "#ffbb44"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Guards",
              formatter: () => morning + evening + night + general,
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Guards`,
      },
    },
  };

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <h4 className="card-title mb-4">Shift Distribution</h4>
        <Row className="text-center mb-3">
          <Col xs="6" className="mb-2">
            <h5 className="font-size-18 text-primary mb-1">{morning}</h5>
            <p className="text-muted mb-0 font-size-12">Morning (06-14)</p>
          </Col>
          <Col xs="6" className="mb-2">
            <h5 className="font-size-18 text-info mb-1">{evening}</h5>
            <p className="text-muted mb-0 font-size-12">Evening (14-22)</p>
          </Col>
          <Col xs="6">
            <h5 className="font-size-18 text-dark mb-1">{night}</h5>
            <p className="text-muted mb-0 font-size-12">Night (22-06)</p>
          </Col>
          <Col xs="6">
            <h5 className="font-size-18 text-warning mb-1">{general}</h5>
            <p className="text-muted mb-0 font-size-12">General (09-18)</p>
          </Col>
        </Row>
        <div dir="ltr" className="mt-2">
          <ReactApexChart options={options} series={series} type="donut" height="230" />
        </div>
      </CardBody>
    </Card>
  );
};

export default ShiftDistribution;
