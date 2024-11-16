import { ApexOptions } from 'apexcharts';

export const getBarChartDataTeamStats = (teams, goals, totalcard) => {
  const teamNames = teams.map((team) => team.teamName);
  const teamGoals = teams.map((team) => {
    return goals
      .filter((goal) => goal.teamId === team.id)
      .reduce((sum, goal) => sum + goal.goals, 0);
  });
  const teamYellowCards = teams.map((team) => {
    return totalcard
      .filter(
        (penalty) => penalty.teamId === team.id && penalty.type === 'yellow',
      )
      .reduce((sum, penalty) => sum + 1, 0);
  });
  const teamRedCards = teams.map((team) => {
    return totalcard
      .filter((penalty) => penalty.teamId === team.id && penalty.type === 'red')
      .reduce((sum, penalty) => sum + 1, 0);
  });

  const barChartDataTeamStats = [
    {
      name: 'Goals',
      data: teamGoals,
      color: '#6AD2FF',
    },
    {
      name: 'Yellow Cards',
      data: teamYellowCards,
      color: '#FFD700',
    },
    {
      name: 'Red Cards',
      data: teamRedCards,
      color: '#FF4560',
    },
  ];

  const barChartOptionsTeamStats: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: false, // Bỏ xếp chồng để tách riêng các cột
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
        fontFamily: undefined,
      },
      theme: 'dark',
      onDatasetHover: {
        highlightDataSeries: true,
      },
    },
    xaxis: {
      categories: teamNames,
      labels: {
        show: true,
        style: {
          colors: '#A3AED0',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: '#CBD5E0',
          fontSize: '14px',
        },
      },
      title: {
        text: 'Goals and Cards',
        style: {
          color: '#6AD2FF',
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: 'solid',
      colors: ['#6AD2FF', '#FFD700', '#FF4560'],
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: '40px',
      },
    },
  };

  return { barChartDataTeamStats, barChartOptionsTeamStats };
};
