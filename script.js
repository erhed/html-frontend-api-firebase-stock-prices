const apiKey = "8UH3CUJQ74Z7K8N7";
const apiURL = "https://www.alphavantage.co/query?";

const stockName = document.getElementById('stock-name');
const stockSymbol = document.getElementById('stock-symbol');
const stockPrice = document.getElementById('stock-price');

// Search

const searchResults = document.getElementById('search-results');
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', e => {
  if (searchInput.value != "") {
    getSearchResults(searchInput.value);
  } else {
    hideSearchResults();
  }
});

// searchInput.addEventListener('focusout', () => {
//   hideSearchResults();
// });

function getSearchResults(input) {
  const url = `${apiURL}function=SYMBOL_SEARCH&keywords=${input}&apikey=${apiKey}`;
  fetch(url)
    .then(resp => {
      console.log(resp);
      return resp.json();
    }).then(json => {
      let bestMatches = json.bestMatches;
      if (bestMatches) {
        showBestMatches(bestMatches);
      } else {
        hideSearchResults();
      }
    })
    .catch(error => {
      console.log("ERROR (fetching search results):" + error);
    });
}

function showBestMatches(list) {
  let optionsList = "";
  list.map(asset => {
    let symbol = Object.values(asset)[0];
    let name = Object.values(asset)[1];
    optionsList += `<div class="search-result-list-item" onclick="searchItemClicked('${symbol}','${name}')">${name}</div>`;
  });
  searchResults.innerHTML = optionsList;
}

function hideSearchResults() {
  searchResults.innerHTML = "";
  searchInput.value = "";
}

// Get data on asset select

function searchItemClicked(symbol, name) {
  stockName.innerText = name;
  stockSymbol.innerText = symbol;

  getAssetDataFromAPI(symbol);
  hideSearchResults();
}

// Get asset data from API

function getAssetDataFromAPI(symbol) {
  const url = `${apiURL}function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
  fetch(url)
    .then(resp => {
      return resp.json();
    }).then(json => {
      showData(json);
      setDataToFirebase(json, symbol);
    })
    .catch(error => {
      console.log("ERROR (fetching asset data from API):" + error);
    });
}

// Get relevant values from API/Firebase data

function getPrices(data) {
  let allDailyPrices = Object.values(data)[1];
  //let latestDate = Object.keys(allDailyPrices)[0];
  let latestDailyOCHLPrices = Object.values(allDailyPrices)[0];
  let latestDailyClosePrice = Object.values(latestDailyOCHLPrices)[3];

  // Get up to 100 data points
  let chartData = [];
  for (let i = 0; i < 100; i++) {
    let dailyOCHLPrices = Object.values(allDailyPrices)[i];
    if (dailyOCHLPrices != undefined) {
      let dailyClosePrice = Object.values(dailyOCHLPrices)[3];
      chartData.push(parseFloat(dailyClosePrice));
    } else {
      break;
    }

  }

  return {
    latest: latestDailyClosePrice.slice(0, 6),
    chart: chartData.reverse()
  };
}

// Show data

function showData(data) {
  let prices = getPrices(data);
  stockPrice.innerText = prices.latest;
  setChart(prices.chart);
  chartContainer.style.display = "block";
}

// Chart

const chartContainer = document.getElementById('chart-container');
const ctx = document.getElementById('chart');

function setChart(data) {
  let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data,
      datasets: [{
        data: data,
        fill: true,
        borderColor: "rgba(60, 120, 216, 1)",
        lineTension: 0.01,
        backgroundColor: "rgba(60, 120, 216, 0.2)",
        borderWidth: 1,
      }]
    },
    options: {
      responsive: false,
      legend: {
        display: false
      },
      elements: {
        point: {
          radius: 0
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
            color: "rgba(60, 120, 216, 0.1)"
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
  });
}