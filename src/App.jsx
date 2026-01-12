import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [place, setPlace] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCoordinates = async () => {
    if (!place.trim()) {
      setError("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const geo = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${place}`
      );

      if (!geo.data.results) throw new Error();

      const { latitude, longitude } = geo.data.results[0];
      getWeather(latitude, longitude);
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
        current: {
          temperature: res.data.current_weather.temperature,
          windspeed: res.data.current_weather.windspeed,
          code: res.data.current_weather.weathercode,
        },
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

  const formatHour = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      <div className="bg-white/90 backdrop-blur-md w-[380px] rounded-3xl shadow-2xl p-6">

        <h1 className="text-2xl font-bold text-center mb-5 text-blue-700">
          🌤 Weather App
        </h1>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Enter city name"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getCoordinates()}
          className="w-full p-3 rounded-full border focus:outline-none mb-3"
        />

        <button
          onClick={getCoordinates}
          className="w-full bg-blue-600 text-white rounded-full py-3 font-semibold hover:bg-blue-700 transition"
        >
          Search
        </button>

        {error && (
          <p className="text-red-500 text-center mt-3 font-semibold">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-center mt-4 font-semibold">Loading...</p>
        )}

        {/* CURRENT WEATHER */}
        {weather && !loading && (
          <>
            <h2 className="text-xl text-center font-bold mt-5">
              {place.toUpperCase()}
            </h2>

            <p className="text-5xl text-center font-extrabold my-3">
              {weather.current.temperature}°
            </p>

            <p className="text-center text-gray-500 mb-4">
              💨 Wind: {weather.current.windspeed} km/h
            </p>

            {/* SUN */}
            <div className="bg-gray-100 rounded-xl p-3 text-center text-sm mb-4">
              <p>🌅 Sunrise: {weather.sunrise}</p>
              <p>🌇 Sunset: {weather.sunset}</p>
            </div>

            {/* HOURLY FORECAST */}
            <h3 className="font-bold mb-2">🕒 Next 24 Hours</h3>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {weather.hourly.map((hour, i) => (
                <div
                  key={i}
                  className="min-w-[80px] bg-blue-100 rounded-xl p-2 text-center shadow"
                >
                  <p className="text-xs font-semibold">
                    {formatHour(hour.time)}
                  </p>
                  <p className="text-lg font-bold">{hour.temp}°</p>
                  <p className="text-xs text-gray-600">
                    💨 {hour.wind}
                  </p>
                </div>
              ))}
            </div>

            {/* GEO MAP */}
            <div className="mt-6 rounded-2xl overflow-hidden shadow-lg border">
              <iframe
                title="geomap"
                width="100%"
                height="180"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${weather.lon - 0.1}%2C${weather.lat - 0.1}%2C${weather.lon + 0.1}%2C${weather.lat + 0.1}&layer=mapnik&marker=${weather.lat}%2C${weather.lon}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
