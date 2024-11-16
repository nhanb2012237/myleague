//
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const LineChart = (props) => {
  const { chartData, chartOptions } = props;

  return (
    <DynamicChart
      options={chartOptions}
      type="line"
      width="100%"
      height="100%"
      series={chartData}
    />
  );
};

export default LineChart;
