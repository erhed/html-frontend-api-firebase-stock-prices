const apiKey = "8UH3CUJQ74Z7K8N7";
const apiURL = "https://www.alphavantage.co/query?";

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
    optionsList += `<div class="search-result-list-item" onclick="searchItemClicked('${symbol}')">${name}</div>`;
  });
  searchResults.innerHTML = optionsList;
}

function hideSearchResults() {
  searchResults.innerHTML = "";
  searchInput.value = "";
}

// Get data on asset select

function searchItemClicked(symbol) {
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
    })
    .catch(error => {
      console.log("ERROR (fetching asset data from API):" + error);
    });
}

// Get relevant values from API/Firebase data

function formatData(data) {
  let allDailyPrices = Object.values(data)[1];
  let latestDate = Object.keys(allDailyPrices)[0];
  let latestDailyOCHLPrices = Object.values(allDailyPrices)[0];
  let latestDailyClosePrice = Object.values(latestDailyOCHLPrices)[3]
  console.log(latestDate);
  console.log(latestDailyClosePrice);
}

// Show data

function showData(data) {
  formatData(data);
}

// Firebase functions