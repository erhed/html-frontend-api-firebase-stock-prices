const apiKey = ALPHA_API_KEY;
const apiURL = "https://www.alphavantage.co/query?";

const stockName = document.getElementById('stock-name');
const stockSymbol = document.getElementById('stock-symbol');
const stockPrice = document.getElementById('stock-price');

// Status cards

const fromApiCard = document.getElementById('from-api');
const addedToCacheCard = document.getElementById('added-to-cache');
const fromCacheCard = document.getElementById('from-cache');
const deleteCacheCard = document.getElementById('delete-cache');

deleteCacheCard.addEventListener('click', () => {
  deleteDataFromFirebase(stockSymbol.innerText);
  deleteCacheCard.style.display = 'none';
});

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

// Get data on asset select, check cache first

async function searchItemClicked(symbol, name) {
  stockName.innerText = name;
  stockSymbol.innerText = symbol;

  hideAllStatusCards();
  getDataFromFirebase(symbol);
  hideSearchResults();
}

// Get asset data from API

function getAssetDataFromAPI(symbol) {
  const url = `${apiURL}function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
  fetch(url)
    .then(resp => {
      return resp.json();
    }).then(json => {
      showData(json, true);
      setDataToFirebase(json, symbol);
      showStatusCard(fromApiCard);
    })
    .catch(error => {
      console.log("ERROR (fetching asset data from API):" + error);
    });
}

// Get relevant values from API/Firebase data

function getPrices(data, isFromAPI) {
  let allDailyPrices = Object.values(data)[1];
  //let latestDate = Object.keys(allDailyPrices)[0];

  let indexLatest = isFromAPI ? 0 : Object.keys(allDailyPrices).length - 1; // Array was reversed when saved to Firebase
  let latestDailyOCHLPrices = Object.values(allDailyPrices)[indexLatest];
  let latestDailyClosePrice = Object.values(latestDailyOCHLPrices)[3];

  // Get up to 100 data points
  let chartDates = [];
  let chartDailyCloseData = [];
  let chartDailyHighData = [];
  let chartDailyLowData = [];
  for (let i = 0; i < 100; i++) {
    let dailyOCHLPrices = Object.values(allDailyPrices)[i];
    if (dailyOCHLPrices != undefined) {
      let date = Object.keys(allDailyPrices)[i];
      chartDates.push(date);
      let dailyClosePrice = Object.values(dailyOCHLPrices)[3];
      chartDailyCloseData.push(parseFloat(dailyClosePrice));
      let dailyHighPrice = Object.values(dailyOCHLPrices)[1];
      chartDailyHighData.push(parseFloat(dailyHighPrice));
      let dailyLowPrice = Object.values(dailyOCHLPrices)[2];
      chartDailyLowData.push(parseFloat(dailyLowPrice));
    } else {
      break;
    }
  }

  return {
    latest: latestDailyClosePrice.slice(0, 6),
    chartData: {
      chartDates: isFromAPI ? chartDates.reverse() : chartDates,
      dailyCloseData: isFromAPI ? chartDailyCloseData.reverse() : chartDailyCloseData,
      dailyHighData: isFromAPI ? chartDailyHighData.reverse() : chartDailyHighData,
      dailyLowData: isFromAPI ? chartDailyLowData.reverse() : chartDailyLowData
    }
  };
}

// Show data

function showData(data, isFromAPI) {
  let prices = getPrices(data, isFromAPI);
  stockPrice.innerText = prices.latest;
  updateChart(prices.chartData);
  chartContainer.style.display = "block";
  console.log(stockSymbol.innerText);
}

// Show status cards

function showStatusCard(card) {
  card.style.display = 'inline-block';
}

// Hide all cards

function hideAllStatusCards() {
  fromApiCard.style.display = 'none';
  addedToCacheCard.style.display = 'none';
  fromCacheCard.style.display = 'none';
  deleteCacheCard.style.display = 'none';
}

// Error handling

function showError(error) {

}
