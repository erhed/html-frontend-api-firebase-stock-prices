// Chart

const chartContainer = document.getElementById('chart-container');
const ctx = document.getElementById('chart').getContext("2d");

const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
gradientFill.addColorStop(0, "rgba(60, 120, 216, 0.0)");
gradientFill.addColorStop(1, "rgba(60, 120, 216, 0.5)");

var chartConfig = {
  type: 'line',
  options: {
    responsive: false,
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 2,
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

let chart = new Chart(ctx, chartConfig);

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