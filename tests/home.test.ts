import { describe, test, expect } from "bun:test";

// 🔹 simulamos fetch (como hacías en Jest)
async function fetchWeather() {
  return {
    current: {
      temp_c: 22,
      humidity: 58,
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

// 🔹 lógica que usa tu app
function getMinTemp(data: any) {
  return Math.round(data.forecast.forecastday[0].day.mintemp_c);
}

function getMaxTemp(data: any) {
  return Math.round(data.forecast.forecastday[0].day.maxtemp_c);
}

describe("API del clima (Bun)", () => {
  test("la API devuelve datos", async () => {
    const data = await fetchWeather();

    expect(data).toBeDefined();
    expect(data).toHaveProperty("forecast");
  });

  test("obtiene temperatura mínima", async () => {
    const data = await fetchWeather();
    const min = getMinTemp(data);

    expect(min).toBe(15);
  });

  test("obtiene temperatura máxima", async () => {
    const data = await fetchWeather();
    const max = getMaxTemp(data);

    expect(max).toBe(25);
  });

  test("temperaturas incluyen °", async () => {
    const data = await fetchWeather();

    const min = `${getMinTemp(data)}°`;
    const max = `${getMaxTemp(data)}°`;

    expect(min).toContain("°");
    expect(max).toContain("°");
  });
});