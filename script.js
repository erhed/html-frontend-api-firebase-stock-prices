const apiKey = ALPHA_API_KEY;
const apiURL = "https://www.alphavantage.co/query?";

const resultContainer = document.getElementById('result-container');
const stockName = document.getElementById('stock-name');
const stockSymbol = document.getElementById('stock-symbol');
const stockPrice = document.getElementById('stock-price');

const errors = document.getElementById('errors');
const OK = "OK";
const ERROR = "ERROR";

const spinner = document.getElementById('spinner');

// showError("Det finns inga bananer i pyjamas!");
// showError("Jo...");

// Status cards

const fromApiCard = document.getElementById('from-api');
const addedToCacheCard = document.getElementById('added-to-cache');
const fromCacheCard = document.getElementById('from-cache');
const deleteCacheCard = document.getElementById('delete-cache');

deleteCacheCard.addEventListener('click', () => {
  deleteDataFromFirebase(stockSymbol.innerText);
  deleteCacheCard.style.display = 'none';
});

// Chart

const chartContainer = document.getElementById('chart-container');
const ctx = document.getElementById('chart').getContext("2d");

const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
gradientFill.addColorStop(0, "rgba(60, 120, 216, 0.0)");
gradientFill.addColorStop(1, "rgba(60, 120, 216, 0.7)");

const chart = new Chart(ctx, chartConfig);

// Search

const searchContainer = document.getElementById('search-container');
const searchResults = document.getElementById('search-results');
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', e => {
  if (searchInput.value != "") {
    //searchContainer.style.display = "block";
    getSearchResults(searchInput.value);
  } else {
    removeAllErrors();
    //searchContainer.style.display = "none";
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
      showError("Could not get search results from server. ERROR: " + error);
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
  // Reset UI
  hideResults();
  removeAllErrors();
  showLoader();
  hideSearchResults();
  hideAllStatusCards();
  chartContainer.style.display = "none";

  // Cache
  let FBResp = await getDataFromFirebase(symbol);
  if (FBResp !== undefined && FBResp.status === OK && FBResp.json.date === getDate()) {
    showResultInfo(name, symbol);
    showStatusCard(fromCacheCard);
    showStatusCard(deleteCacheCard);
    showData(FBResp.json.data);
  } else {
    // API
    let APIResp = await getDataFromAPI(symbol);
    if (APIResp !== undefined && APIResp.status === OK) {
      showResultInfo(name, symbol);
      showStatusCard(fromApiCard);
      showData(APIResp.json, true);
      // Save to cache
      let cacheData = await saveDataToFirebase(APIResp.json, symbol);
      if (cacheData.status === OK) {
        showStatusCard(addedToCacheCard);
      } else {
        showError(cacheData.error);
      }
    } else {
      showError(APIResp.error);
    }
  }
}

function showResultInfo(name, symbol) {
  showResults();
  stockName.innerText = name;
  stockSymbol.innerText = symbol;
}

function hideResults() {
  resultContainer.style.display = "none";
}

function showResults() {
  resultContainer.style.display = "block";
}

// Get asset data from API

async function getDataFromAPI(symbol) {
  const url = `${apiURL}function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
  try {
    let resp = await fetch(url);
    let json = await resp.json();
    return {
      json: json,
      status: OK
    }
  } catch (error) {
    return {
      error: "Could not fetch data from API. ERROR: " + error,
      status: ERROR
    }
  }
}

// Get relevant values from API/Firebase data

function getPrices(data, isFromAPI) {
  if (data.Note) {
    return {
      status: ERROR
    };
  }

  let allDailyPrices = Object.values(data)[1];
  //let latestDate = Object.keys(allDailyPrices)[0];

  let indexLatest = isFromAPI ? 0 : Object.keys(allDailyPrices).length - 1; // Array was reversed when saved to Firebase
  let latestDailyOCHLPrices = Object.values(allDailyPrices)[indexLatest];
  let latestDailyClosePrice = Object.values(latestDailyOCHLPrices)[3];

  // Get prices for up to 100 days
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
    status: OK,
    latest: latestDailyClosePrice,
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
  hideLoader();
  let prices = getPrices(data, isFromAPI);
  if (prices.status === OK) {
    stockPrice.innerText = prices.latest;
    updateChart(prices.chartData);
    chartContainer.style.display = "block";
  } else {
    hideResults();
    hideAllStatusCards();
    showError("Error extracting price data from server response. API limit probably reached.");
  }
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
  errors.innerHTML += `
    <div class="error-container">
      <img class="error-icon" src="error-icon.png">
      <p class="error-msg">${error}</p>
    </div>
  `;
}

function removeAllErrors() {
  errors.innerHTML = "";
}

// Loader

function showLoader() {
  spinner.style.display = "block";
}

function hideLoader() {
  spinner.style.display = "none";
}