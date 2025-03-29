// 1. Basic Configuration
const API_KEY = '9a3cca925dmsha133c7c1b3afc32p16c631jsn210637e396df'; // Replace with your actual key

// 2. DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');

// 3. Simple Search Function
async function searchMovies(title) {
    try {
        // Show loading state
        resultsDiv.innerHTML = '<p>Searching...</p>';
        
        // Make API request
        const response = await fetch(
            `https://streaming-availability.p.rapidapi.com/search/title?title=${encodeURIComponent(title)}&country=us&show_type=all`, 
            {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': API_KEY,
                    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
                }
            }
        );
        
        // Handle response
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        showResults(data.result);
        
    } catch (error) {
        resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        console.error('Search error:', error);
    }
}

// 4. Display Results
function showResults(movies) {
    if (!movies || movies.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }
    
    let html = '';
    movies.forEach(movie => {
        html += `
            <div class="movie">
                <h3>${movie.title} (${movie.year || 'N/A'})</h3>
                <p>Type: ${movie.showType || 'Unknown'}</p>
                ${getStreamingInfo(movie.streamingInfo)}
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// 5. Get Streaming Info
function getStreamingInfo(info) {
    if (!info) return '<p>Not available for streaming</p>';
    
    let html = '<p>Available on: ';
    for (const country in info) {
        for (const service in info[country]) {
            html += `${service}, `;
        }
    }
    return html + '</p>';
}

// 6. Event Listener
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    }
});
