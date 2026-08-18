import React from "react";
import { Card, CardBody } from "reactstrap";
import ReactApexChart from "react-apexcharts";

const PostDeployment = () => {
  const options = {
    chart: {
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#7a6fbe"],
    xaxis: {
      categories: ["Main Gate", "Exec Block", "CCTV Room", "Patrol", "Cash Vault", "Hostel"],
      labels: {
        rotate: -30,
        style: { fontSize: "11px" },
      },
    },
    yaxis: {
      title: { text: "Guards Assigned" },
    },
    grid: {
      borderColor: "#f8f8fa",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Guards`,
      },
    },
  };

  const series = [
    {
      name: "Guards Deployed",
      data: [2, 2, 1, 2, 1, 2],
    },
  ];

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <h4 className="card-title mb-4">Post & Department Strength</h4>
        <div dir="ltr" className="mt-2">
          <ReactApexChart options={options} series={series} type="bar" height="280" />
        </div>
      </CardBody>
    </Card>
  );
};

export default PostDeployment;
