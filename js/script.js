
let currentLat = 38.0883;
let currentLon = -0.9439;

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


function addToHistory(lat, lon, name, country, admin1) {
    const location = {
        lat: lat,
        lon: lon,
        name: name,
        country: country,
        admin1: admin1,
        displayName: `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`
    };
    
    const existingIndex = searchHistory.findIndex(item => 
        item.lat === lat && item.lon === lon
    );
    
    if (existingIndex !== -1) {
        searchHistory.splice(existingIndex, 1);
    }
    
    searchHistory.unshift(location);
    
    if (searchHistory.length > 5) {
        searchHistory = searchHistory.slice(0, 5);
    }
    
    saveSearchHistory();
    displaySearchHistory();
}


function displaySearchHistory() {
    const historyContainer = document.getElementById('searchHistory');
    
    if (searchHistory.length === 0) {
        historyContainer.innerHTML = '';
        return;
    }
    
    let html = '<div class="mt-5">';
    html += '<div class="text-xs sm:text-sm opacity-80 mb-2 font-bold">📜 Búsquedas recientes:</div>';
    html += '<div class="historyScroll flex gap-2 overflow-x-auto py-2">';
    
    searchHistory.forEach(location => {
        const escapedName = location.name.replace(/'/g, "\\'");
        const escapedCountry = location.country.replace(/'/g, "\\'");
        const escapedAdmin1 = location.admin1.replace(/'/g, "\\'");
        
        html += `
            <div class="bg-white/20 border border-white/30 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 min-w-[120px] sm:min-w-[140px] cursor-pointer transition-all hover:bg-white/35 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 whitespace-nowrap flex flex-col items-center gap-1" onclick="loadFromHistory(${location.lat}, ${location.lon}, '${escapedName}', '${escapedCountry}', '${escapedAdmin1}')">
                <div class="font-bold text-xs sm:text-sm">${location.name}</div>
                <div class="text-[10px] sm:text-xs opacity-80">${location.country}</div>
            </div>
        `;
    });
    
    html += '</div></div>';
    historyContainer.innerHTML = html;
}


function loadFromHistory(lat, lon, name, country, admin1) {
    selectCity(lat, lon, name, country, admin1);
}

function getWeatherIcon(code, isDay = true) {
    const iconMap = {
        0: '☀️',   
        2: '⛅',   
        3: '☁️',   
        45: '🌫️', 
        48: '🌫️', 
        51: '🌦️', 
        53: '🌦️', 
        55: '🌦️', 
        61: '🌧️', 
        63: '🌧️', 
        65: '🌧️', 
        71: '🌨️', 
        73: '🌨️', 
        75: '🌨️', 
        77: '❄️',  
        80: '🌦️',
        81: '⛈️', 
        82: '⛈️', 
        85: '🌨️', 
        86: '🌨️',
        95: '⛈️', 
        96: '⛈️', 
        99: '⛈️'  
    };
    return iconMap[code] || '🌡️';
}


function getWeatherDescription(code) {
    const descriptions = {
        0: 'Despejado',
        1: 'Poco nuboso',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna intensa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia intensa',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve intensa',
        77: 'Granizo',
        80: 'Chubascos ligeros',
        81: 'Chubascos moderados',
        82: 'Chubascos intensos',
        85: 'Chubascos de nieve ligeros',
        86: 'Chubascos de nieve fuertes',
        95: 'Tormenta',
        96: 'Tormenta con granizo ligero',
        99: 'Tormenta con granizo fuerte'
    };
    return descriptions[code] || 'Desconocido';
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
        const country = city.country || '';
        const admin1 = city.admin1 || '';
        const displayName = `${city.name}, ${admin1 ? admin1 + ', ' : ''}${country}`;
        const escapedName = city.name.replace(/'/g, "\\'");
        const escapedCountry = country.replace(/'/g, "\\'");
        const escapedAdmin1 = admin1.replace(/'/g, "\\'");
        
        html += `
            <button 
                class="locationBtn block my-2 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-none py-3 px-4 sm:px-6 rounded-full cursor-pointer text-sm sm:text-base font-medium transition-transform hover:scale-105 active:scale-95"
                onclick="selectCity(${city.latitude}, ${city.longitude}, '${escapedName}', '${escapedCountry}', '${escapedAdmin1}')">
                📍 ${displayName}
            </button>
        `;
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
        document.getElementById('weatherContent').innerHTML = `
            <div class="text-center py-10">
                <p class="text-base sm:text-lg">❌ Error al cargar los datos del clima</p>
                <p class="text-xs sm:text-sm mt-2">Por favor, inténtalo de nuevo más tarde</p>
            </div>
        `;
        console.error('Error fetching weather data:', error);
    }
}


function displayWeather(data) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    const now = new Date();
    const currentHour = now.getHours();

    let html = `
        <div class="bg-white/20 backdrop-blur-lg rounded-3xl p-4 sm:p-6 md:p-10 mb-8 flex justify-between items-center gap-4 sm:gap-5 border border-white/30 animate-fadeIn flex-wrap">
            <div class="flex-1 min-w-[180px] sm:min-w-[200px]">
                <div class="opacity-90 mb-2 text-sm sm:text-base">AHORA</div>
                <div class="text-4xl sm:text-5xl md:text-7xl font-bold drop-shadow-lg">${Math.round(current.temperature_2m)}°C</div>
                <div class="text-lg sm:text-xl md:text-2xl mt-2">
                    ${getWeatherDescription(current.weather_code)}
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                    <span class="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm">💨 Viento ${Math.round(current.wind_speed_10m)} km/h</span>
                    <span class="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm">💧 Humedad ${current.relative_humidity_2m}%</span>
                    <span class="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm">🌡️ Sensación ${Math.round(current.apparent_temperature)}°C</span>
                </div>
            </div>
            <div class="text-5xl sm:text-6xl md:text-8xl drop-shadow-lg">
                ${getWeatherIcon(current.weather_code)}
            </div>
        </div>

        <div class="bg-white/15 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 mb-6 border border-white/20 animate-slideUp">
            <div class="flex justify-between items-center mb-5 flex-wrap gap-2">
                <span class="text-lg sm:text-xl md:text-2xl font-semibold">⏰ PRÓXIMAS HORAS</span>
                <span class="text-xs sm:text-sm md:text-base opacity-80">Pronóstico 12h</span>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mt-5">
    `;

    for (let i = 0; i < 12; i++) {
        const hourIndex = currentHour + i;
        if (hourIndex < 24) {
            const temp = Math.round(hourly.temperature_2m[hourIndex]);
            const rain = hourly.precipitation_probability[hourIndex];
            const code = hourly.weather_code[hourIndex];
            const time = `${String(hourIndex).padStart(2, '0')}:00`;

            html += `
                <div class="bg-white/20 rounded-2xl p-2 sm:p-3 text-center transition-all hover:-translate-y-1 hover:bg-white/30 border border-white/10">
                    <div class="font-bold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">${time}</div>
                    <div class="text-2xl sm:text-3xl md:text-4xl my-1 sm:my-2">${getWeatherIcon(code)}</div>
                    <div class="text-lg sm:text-xl md:text-2xl my-1 sm:my-2">${temp}°</div>
                    <div class="text-[10px] sm:text-xs md:text-sm opacity-90">${rain}%</div>
                </div>
            `;
        }
    }

    html += `
            </div>
        </div>

        <div class="bg-white/15 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 animate-slideUpDelay">
            <div class="flex justify-between items-center mb-5 flex-wrap gap-2">
                <span class="text-lg sm:text-xl md:text-2xl font-semibold">📅 PRÓXIMOS DÍAS</span>
                <span class="text-xs sm:text-sm md:text-base opacity-80">Resumen semanal</span>
            </div>
    `;

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Hoy' : dayNames[date.getDay()];
        const dayDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

        html += `
            <div class="bg-white/20 rounded-2xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 flex justify-between items-center gap-3 sm:gap-4 transition-all hover:translate-x-2 hover:bg-white/30 border border-white/10 flex-wrap">
                <div class="flex-1 min-w-[100px] sm:min-w-[120px]">
                    <div class="font-bold text-sm sm:text-base md:text-lg mb-1">${dayName}, ${dayDate}</div>
                </div>
                <div class="text-3xl sm:text-4xl md:text-5xl">${getWeatherIcon(daily.weather_code[i])}</div>
                <div class="flex gap-2 sm:gap-3 md:gap-5 items-center flex-wrap">
                    <span class="text-lg sm:text-xl md:text-2xl font-bold">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="text-base sm:text-lg md:text-xl opacity-80">${Math.round(daily.temperature_2m_min[i])}°</span>
                    <span class="text-xs sm:text-sm md:text-base opacity-90">💧 ${daily.precipitation_probability_max[i]}%</span>
                </div>
            </div>
        `;
    }

    html += '</div>';
    document.getElementById('weatherContent').innerHTML = html;
}

/**
 * Get user's current location using the Geolocation API
 */
function getLocation() {
    if (navigator.geolocation) {
        document.getElementById('locationStatus').textContent = 'Obteniendo ubicación...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                document.getElementById('locationName').textContent = 'Tu ubicación';
                document.getElementById('locationStatus').textContent = '✅ Ubicación detectada';
                fetchWeatherData(currentLat, currentLon);
            },
            (error) => {
                let errorMessage = '❌ No se pudo obtener la ubicación.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage += ' Activa los permisos de ubicación en tu navegador.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage += ' La ubicación no está disponible.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage += ' Tiempo de espera agotado.';
                }
                document.getElementById('locationStatus').textContent = errorMessage;
                console.error('Geolocation error:', error);
            }
        );
    } else {
        document.getElementById('locationStatus').textContent = '❌ Geolocalización no disponible en este navegador';
    }
}


async function useManualLocation() {
    const city = prompt('Introduce el nombre de la ciudad, pueblo o provincia:\n\nEjemplos:\n- Madrid\n- Barcelona\n- Nueva York\n- París\n- Tokio');
    
    if (city && city.trim() !== '') {
        document.getElementById('locationStatus').innerHTML = '🔍 Buscando ubicación...';
        
        const results = await searchCity(city.trim());
        
        if (results && results.length > 0) {
            if (results.length === 1) {
                const location = results[0];
                selectCity(
                    location.latitude, 
                    location.longitude, 
                    location.name, 
                    location.country || '',
                    location.admin1 || ''
                );
            } else {
                showCitySelector(results);
            }
        } else {
            document.getElementById('locationStatus').innerHTML = `
                <div class="text-red-200 bg-red-500/20 p-3 sm:p-4 rounded-xl mt-2 text-xs sm:text-sm">
                    ❌ No se encontró la ubicación "${city}". <br>
                    Intenta con otra ciudad o verifica la ortografía.
                </div>
            `;
        }
    }
}


document.getElementById('locationName').textContent = 'Orihuela, Valencia, España';
loadSearchHistory();
fetchWeatherData(currentLat, currentLon);


setInterval(() => {
    fetchWeatherData(currentLat, currentLon);
}, 600000);