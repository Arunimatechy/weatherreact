import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [place, setPlace] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  };

  const formatHour = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getCoordinates = async () => {
    if (!place.trim()) {
      setError("Enter city name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const geo = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${place}`
      );

      if (!geo.data.results?.length) throw new Error();

      const { latitude, longitude } = geo.data.results[0];

      await getWeather(latitude, longitude);
    } catch {
      setError("City not found");
      setLoading(false);
    }
  };

  const getWeather = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m&daily=sunrise,sunset&timezone=auto`
      );

      const hourlyData = res.data.hourly.time.slice(0, 24).map((time, i) => ({
        time,
        temp: res.data.hourly.temperature_2m[i],
        wind: res.data.hourly.windspeed_10m[i],
        code: res.data.hourly.weathercode[i],
      }));

      setWeather({
        current: res.data.current_weather,
        sunrise: res.data.daily.sunrise[0],
        sunset: res.data.daily.sunset[0],
        hourly: hourlyData,
        lat,
        lon,
      });

      setLoading(false);
    } catch {
      setError("Failed to fetch weather");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center px-3 py-4">

      {/* MAIN CARD (SMALLER + COMPACT) */}
      <div className="w-full max-w-sm bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center text-white mb-4">
          🌤 Weather
        </h1>

        {/* SEARCH */}
        <div className="flex gap-2 mb-3">

          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getCoordinates()}
            placeholder="City"
            className="flex-1 p-2 rounded-xl bg-white/90 outline-none text-sm"
          />

          <button
            onClick={getCoordinates}
            className="bg-white text-blue-700 px-3 rounded-xl text-sm font-semibold"
          >
            Go
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-200 text-center text-sm mb-2">
            {error}
          </p>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-3">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* WEATHER */}
        {weather && !loading && (
          <>

            {/* CITY + TEMP */}
            <div className="text-center text-white mb-3">

              <h2 className="text-lg font-bold">
                📍 {place}
              </h2>

              <div className="text-5xl">
                {getWeatherIcon(weather.current.weathercode)}
              </div>

              <p className="text-4xl font-bold">
                {weather.current.temperature}°
              </p>

              <p className="text-xs">
                💨 {weather.current.windspeed} km/h
              </p>

            </div>

            {/* SUN */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-white text-xs">

              <div className="bg-white/20 p-2 rounded-xl text-center">
                🌅 {weather.sunrise.split("T")[1].slice(0, 5)}
              </div>

              <div className="bg-white/20 p-2 rounded-xl text-center">
                🌇 {weather.sunset.split("T")[1].slice(0, 5)}
              </div>

            </div>

            {/* HOURLY (SMALL SCROLL ROW) */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">

              {weather.hourly.map((h, i) => (
                <div
                  key={i}
                  className="min-w-[70px] bg-white/20 rounded-xl p-2 text-center text-white"
                >

                  <p className="text-[10px]">
                    {formatHour(h.time)}
                  </p>

                  <div className="text-lg">
                    {getWeatherIcon(h.code)}
                  </div>

                  <p className="text-xs font-bold">
                    {h.temp}°
                  </p>

                </div>
              ))}

            </div>

            {/* MAP (SMALL HEIGHT FIX) */}
            <div className="rounded-xl overflow-hidden">

              <iframe
                title="map"
                width="100%"
                height="140"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  weather.lon - 0.1
                }%2C${
                  weather.lat - 0.1
                }%2C${
                  weather.lon + 0.1
                }%2C${
                  weather.lat + 0.1
                }&layer=mapnik&marker=${
                  weather.lat
                }%2C${weather.lon}`}
              />

            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default App;