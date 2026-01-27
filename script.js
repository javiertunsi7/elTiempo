// Default coordinates (Orihuela, Valencia)
let currentLat = 38.0883;
let currentLon = -0.9439;

// Array to save search history (maximum 5)
let searchHistory = [];
function loadSearchHistory() {
    try {
        const savedHistory = localStorage.getItem('weatherSearchHistory');
        if (savedHistory) {
            searchHistory = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Error loading search history:', error);
        searchHistory = [];
    }
    displaySearchHistory();
}

function saveSearchHistory() {
    try {
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}
function getWeatherIcon(code, isDay = true) {
    const iconMap = {
        0: '☀️',   // Clear sky
        1: '🌤️',  // Mainly clear
        2: '⛅',   // Partly cloudy
        3: '☁️',   // Overcast
        // ... más códigos
    };
    return iconMap[code] || '🌡️';
}