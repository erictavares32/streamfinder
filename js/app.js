// Configuration
const API_CONFIG = {
  baseUrl: 'https://streaming-availability.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df', // 
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
  }
};

// DOM Elements
const titleSearchForm = document.getElementById('title-search-form');
const filterSearchForm = document.getElementById('filter-search-form');
const resultsContainer = document.getElementById('results');
const newReleasesContainer = document.getElementById('new-releases-results');
const loadingIndicator = document.getElementById('loading');
const modal = document.getElementById('details-modal');
const modalContent = document.getElementById('modal-content');
const closeBtn = document.querySelector('.close-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  await Promise.all([
    populateCountries(),
    populateGenres(),
    loadNewReleases()
  ]);
});

function setupEventListeners() {
  // Search forms
  titleSearchForm.addEventListener('submit', handleTitleSearch);
  filterSearchForm.addEventListener('submit', handleFilterSearch);
  
  // Modal
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  
  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// API Functions
async function searchByTitle(title, type = 'all') {
  try {
    const params = new URLSearchParams({
      title: encodeURIComponent(title),
      series_granularity: 'show',
      show_type: type,
      output_language: 'en'
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/shows/search/title?${params}`, {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return await response.json();
  } catch (error) {
    console.error('Title search error:', error);
    return { error: true, message: error.message };
  }
}

async function searchByFilters(filters) {
  try {
    const params = new URLSearchParams({
      series_granularity: 'show',
      order_direction: 'asc',
      order_by: 'original_title',
      genres_relation: 'and',
      output_language: 'en',
      ...filters
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/shows/search/filters?${params}`, {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return await response.json();
  } catch (error) {
    console.error('Filter search error:', error);
    return { error: true, message: error.message };
  }
}

async function getShowDetails(id) {
  try {
    const params = new URLSearchParams({
      series_granularity: 'episode',
      output_language: 'en'
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/shows/${id}?${params}`, {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return await response.json();
  } catch (error) {
    console.error('Show details error:', error);
    return { error: true, message: error.message };
  }
}

async function getCountries() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/countries?output_language=en`, {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return await response.json();
  } catch (error) {
    console.error('Countries error:', error);
    return { error: true, message: error.message };
  }
}

async function getGenres() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/genres?output_language=en`, {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return await response.json();
  } catch (error) {
    console.error('Genres error:', error);
    return { error: true, message: error.message };
  }
}

async function getChanges() {
  try {
    const params = new URLSearchParams({
      change_type: 'new',
      item_type: 'show',
      output_language: 'en',
      order_direction: 'asc',
      include_unknown_dates: 'false',
      show_type: 'all'
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/changes?${params}`, {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return await response.json();
  } catch (error) {
    console.error('Changes error:', error);
    return { error: true, message: error.message };
  }
}

// Helper Functions
async function populateCountries() {
  const countries = await getCountries();
  const countrySelect = document.getElementById('country-select');
  
  if (countries.error) {
    countrySelect.innerHTML = '<option value="">Error loading countries</option>';
    return;
  }

  countrySelect.innerHTML = '<option value="">All Countries</option>' + 
    countries.map(country => 
      `<option value="${country.code}">${country.name}</option>`
    ).join('');
}

async function populateGenres() {
  const genres = await getGenres();
  const genreSelect = document.getElementById('genre-select');
  
  if (genres.error) {
    genreSelect.innerHTML = '<option value="">Error loading genres</option>';
    return;
  }

  genreSelect.innerHTML = '<option value="">All Genres</option>' + 
    genres.map(genre => 
      `<option value="${genre.id}">${genre.name}</option>`
    ).join('');
}

async function loadNewReleases() {
  showLoading(newReleasesContainer);
  const changes = await getChanges();
  
  if (changes.error) {
    newReleasesContainer.innerHTML = '<div class="error">Failed to load new releases</div>';
    return;
  }

  displayResults(changes.result || changes.results, newReleasesContainer);
}

function showLoading(container) {
  if (container === resultsContainer) {
    loadingIndicator.style.display = 'flex';
    resultsContainer.innerHTML = '';
  } else {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
  }
}

function hideLoading() {
  loadingIndicator.style.display = 'none';
}

function displayResults(results, container = resultsContainer) {
  hideLoading();
  
  if (!results || results.length === 0) {
    container.innerHTML = '<div class="no-results">No results found. Try a different search.</div>';
    return;
  }

  container.innerHTML = results.map(result => `
    <div class="show-card">
      <img src="${result.image || 'https://via.placeholder.com/300x150?text=No+Image'}" alt="${result.title}">
      <div class="card-content">
        <h3>${result.title} (${result.year || 'N/A'})</h3>
        <p>Type: ${result.showType || 'Unknown'}</p>
        ${result.streamingInfo ? renderStreamingInfo(result.streamingInfo) : '<p>Not currently streaming</p>'}
        <button class="details-btn" data-id="${result.id}">View Details</button>
      </div>
    </div>
  `).join('');

  // Add event listeners to detail buttons
  container.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showLoading();
      const details = await getShowDetails(btn.dataset.id);
      showDetailsModal(details);
      hideLoading();
    });
  });
}

function renderStreamingInfo(streamingInfo) {
  let html = '<div class="streaming-options"><h4>Available On:</h4>';
  
  for (const country in streamingInfo) {
    for (const service in streamingInfo[country]) {
      const info = streamingInfo[country][service];
      html += `
        <div class="streaming-service">
          <span class="flag-icon flag-icon-${country.toLowerCase()}"></span>
          ${service} (${info.streamingType || 'unknown'})
          ${info.price ? `- $${info.price.usd || info.price}` : ''}
        </div>
      `;
    }
  }
  
  return html + '</div>';
}

function showDetailsModal(details) {
  if (details.error) {
    modalContent.innerHTML = `<div class="error">${details.message}</div>`;
    modal.style.display = 'block';
    return;
  }

  modalContent.innerHTML = `
    <div class="modal-details">
      <div class="detail-header">
        <img src="${details.image || 'https://via.placeholder.com/500x250?text=No+Image'}" alt="${details.title}">
        <div class="header-info">
          <h2>${details.title} (${details.year || 'N/A'})</h2>
          <p>${details.overview || 'No description available.'}</p>
          <div class="meta-info">
            ${details.runtime ? `<span><i class="fas fa-clock"></i> ${details.runtime} min</span>` : ''}
            ${details.genre ? `<span><i class="fas fa-tag"></i> ${details.genre.join(', ')}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="detail-content">
        <h3>Streaming Availability</h3>
        ${details.streamingInfo ? renderStreamingInfo(details.streamingInfo) : '<p>Not currently available on any streaming platform.</p>'}
        
        ${details.seasons ? `
          <h3>Seasons (${details.seasons.length})</h3>
          <div class="seasons-list">
            ${details.seasons.map(season => `
              <div class="season-card">
                <h4>Season ${season.seasonNumber}</h4>
                <p>${season.episodes.length} episodes</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
}

// Form Handlers
async function handleTitleSearch(e) {
  e.preventDefault();
  const query = document.getElementById('title-search-input').value.trim();
  if (!query) return;
  
  showLoading();
  const results = await searchByTitle(query);
  displayResults(results.result || results.results);
}

async function handleFilterSearch(e) {
  e.preventDefault();
  const formData = new FormData(filterSearchForm);
  const filters = Object.fromEntries(formData.entries());
  
  // Clean up empty values
  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });
  
  showLoading();
  const results = await searchByFilters(filters);
  displayResults(results.result || results.results);
}