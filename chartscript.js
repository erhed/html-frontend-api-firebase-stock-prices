var chartConfig = {
  type: "line",
  options: {
    tooltips: {
      xPadding: 10,
      yPadding: 10,
      titleSpacing: 10,
      bodySpacing: 10,
      backgroundColor: "rgba(20, 80, 176, 1.0)",
      displayColors: false
    },
    responsive: false,
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 2,
        hitRadius: 4
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          display: true,
          fontSize: 10,
          fontColor: "#3c78d8"
        },
        gridLines: {
          color: "rgba(60, 120, 216, 0)"
        }
      }],
      xAxes: [{
        ticks: {
          display: false
        },
        gridLines: {
          color: "rgba(255, 255, 255, 0)"
        }
      }]
    },
    title: {
      display: false
    }
  }
}

function updateChart(data) {
  chart.config.data = {
    labels: data.chartDates,
    datasets: [
      {
        data: data.dailyCloseData,
        fill: true,
        borderColor: "rgba(60, 120, 216, 1)",
        lineTension: 0,
        backgroundColor: gradientFill,
        borderWidth: 1,
        //showLine: false,
        //pointBackgroundColor: "rgba(60, 120, 216, 1)"
      },
      {
        data: data.dailyHighData,
        fill: true,
        borderColor: "rgba(60, 120, 216, 0.5)",
        lineTension: 0,
        backgroundColor: "rgba(60, 120, 216, 0)",
        borderWidth: 1,
        showLine: false,
      },
      {
        data: data.dailyLowData,
        fill: true,
        borderColor: "rgba(60, 120, 216, 0.5)",
        lineTension: 0,
        backgroundColor: "rgba(60, 120, 216, 0)",
        borderWidth: 1,
        showLine: false,
      }
    ]
  }
  chart.update();
}