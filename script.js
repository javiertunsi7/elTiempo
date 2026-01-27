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
async function searchCity(cityName) {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=es&format=json`;
    
    try {
        const response = await fetch(geocodingUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error searching city:', error);
        return null;
    }
}
function showCitySelector(cities) {
    let html = '<div class="bg-white/20 p-4 sm:p-5 rounded-2xl mt-4">';
    html += '<p class="mb-4 font-bold text-sm sm:text-base">Se encontraron varias ubicaciones. Selecciona una:</p>';
    
    cities.forEach((city) => {
        const displayName = `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`;
        html += `<button class="locationBtn" onclick="selectCity(${city.latitude}, ${city.longitude}, '${city.name}', '${city.country}', '${city.admin1}')">
            📍 ${displayName}
        </button>`;
    });
    
    html += '</div>';
    document.getElementById('locationStatus').innerHTML = html;
}
function selectCity(lat, lon, name, country, admin1) {
    currentLat = lat;
    currentLon = lon;
    const displayName = `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`;
    document.getElementById('locationName').textContent = displayName;
    document.getElementById('locationStatus').innerHTML = '✅ Ubicación establecida';
    
    addToHistory(lat, lon, name, country, admin1);
    fetchWeatherData(currentLat, currentLon);
}