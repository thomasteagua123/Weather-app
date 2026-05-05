// lib/weather.ts

export type WeatherData = {
  current: {
    temp_c: number;
    humidity: number;
    pressure_mb: number;
    wind_kph: number;
  };
  forecast: {
    forecastday: {
      day: {
        mintemp_c: number;
        maxtemp_c: number;
        condition: { text: string };
      };
    }[];
  };
};

// 🔹 temperatura mínima
export function getMinTemp(data: WeatherData, index = 0) {
  return Math.round(data.forecast.forecastday[index].day.mintemp_c);
}

// 🔹 temperatura máxima
export function getMaxTemp(data: WeatherData, index = 0) {
  return Math.round(data.forecast.forecastday[index].day.maxtemp_c);
}

// 🔹 formateo
export function formatTemp(temp: number) {
  return `${temp}°`;
}

// 🔹 mock de API (para tests)
export async function fetchWeatherMock(): Promise<WeatherData> {
  return {
    current: {
      temp_c: 22,
      humidity: 58,
      pressure_mb: 1012,
      wind_kph: 14,
    },
    forecast: {
      forecastday: [
        {
          day: {
            mintemp_c: 15,
            maxtemp_c: 25,
            condition: { text: "Sunny" },
          },
        },
      ],
    },
  };
}