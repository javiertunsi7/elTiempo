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
async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        // Manejo de errores
    }
}
function displayWeather(data) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    let html = `
        <div class="bg-white/20 backdrop-blur-lg rounded-3xl p-4 sm:p-6 md:p-10 mb-8">
            <div class="flex-1 min-w-[180px] sm:min-w-[200px]">
                <div class="opacity-90 mb-2 text-sm sm:text-base">AHORA</div>
                <div class="text-4xl sm:text-5xl md:text-7xl font-bold">${Math.round(current.temperature_2m)}°C</div>
            </div>
        </div>`;
    
    document.getElementById('weatherContent').innerHTML = html;
}
// Dentro de displayWeather()
html += `
    <div class="bg-white/20 backdrop-blur-lg rounded-3xl p-4 sm:p-6 md:p-10 mb-8 flex justify-between items-center gap-4 sm:gap-5 border border-white/30 animate-fadeIn flex-wrap">
        <div class="flex-1 min-w-[180px] sm:min-w-[200px]">
            <div class="opacity-90 mb-2 text-sm sm:text-base">AHORA</div>
            <div class="text-4xl sm:text-5xl md:text-7xl font-bold drop-shadow-lg">${Math.round(current.temperature_2m)}°C</div>
            <div class="text-lg sm:text-xl md:text-2xl mt-2">${getWeatherDescription(current.weather_code)}</div>
            <div class="mt-4 flex flex-wrap gap-2">
                <span class="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm">💨 Viento ${Math.round(current.wind_speed_10m)} km/h</span>
                <span class="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm">💧 Humedad ${current.relative_humidity_2m}%</span>
            </div>
        </div>
        <div class="text-5xl sm:text-6xl md:text-8xl drop-shadow-lg">${getWeatherIcon(current.weather_code)}</div>
    </div>`;
    html += `
    <div class="bg-white/15 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 mb-6 border border-white/20 animate-slideUp">
        <div class="flex justify-between items-center mb-5 flex-wrap gap-2">
            <span class="text-lg sm:text-xl md:text-2xl font-semibold">⏰ PRÓXIMAS HORAS</span>
            <span class="text-xs sm:text-sm md:text-base opacity-80">Pronóstico 12h</span>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mt-5">`;

for (let i = 0; i < 12; i++) {
    const hourIndex = currentHour + i;
    if (hourIndex < 24) {
        const temp = Math.round(hourly.temperature_2m[hourIndex]);
        const time = `${String(hourIndex).padStart(2, '0')}:00`;
        
        html += `
            <div class="bg-white/20 rounded-2xl p-2 sm:p-3 text-center transition-all hover:-translate-y-1">
                <div class="font-bold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">${time}</div>
                <div class="text-2xl sm:text-3xl md:text-4xl my-1 sm:my-2">${getWeatherIcon(hourly.weather_code[hourIndex])}</div>
                <div class="text-lg sm:text-xl md:text-2xl my-1 sm:my-2">${temp}°</div>
            </div>`;
    }
}

html += `</div></div>`;
html += `
    <div class="bg-white/15 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 animate-slideUpDelay">
        <div class="flex justify-between items-center mb-5 flex-wrap gap-2">
            <span class="text-lg sm:text-xl md:text-2xl font-semibold">📅 PRÓXIMOS DÍAS</span>
            <span class="text-xs sm:text-sm md:text-base opacity-80">Resumen semanal</span>
        </div>`;

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 0 ? 'Hoy' : dayNames[date.getDay()];
    const dayDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    html += `
        <div class="bg-white/20 rounded-2xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 flex justify-between items-center gap-3 sm:gap-4 transition-all hover:translate-x-2">
            <div class="flex-1 min-w-[100px] sm:min-w-[120px]">
                <div class="font-bold text-sm sm:text-base md:text-lg mb-1">${dayName}, ${dayDate}</div>
            </div>
            <div class="text-3xl sm:text-4xl md:text-5xl">${getWeatherIcon(daily.weather_code[i])}</div>
            <div class="flex gap-2 sm:gap-3 md:gap-5 items-center flex-wrap">
                <span class="text-lg sm:text-xl md:text-2xl font-bold">${Math.round(daily.temperature_2m_max[i])}°</span>
                <span class="text-base sm:text-lg md:text-xl opacity-80">${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
        </div>`;
}

html += '</div>';