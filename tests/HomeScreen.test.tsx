/// <reference types="node" />
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../app/index';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      WEATHER_API_KEY: 'test-api-key',
    },
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('../lib/weather', () => ({
  getMinTemp: jest.fn((data: any) => data?.forecast?.forecastday?.[0]?.day?.mintemp_c ?? 0),
  getMaxTemp: jest.fn((data: any) => data?.forecast?.forecastday?.[0]?.day?.maxtemp_c ?? 0),
  formatTemp: jest.fn((temp: number) => `${temp}°C`),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockWeatherResponse = {
  location: { name: 'Buenos Aires' },
  forecast: {
    forecastday: [
      {
        day: {
          mintemp_c: 12,
          maxtemp_c: 24,
        },
      },
    ],
  },
};

const mockLocation = {
  coords: { latitude: -34.6, longitude: -58.4 },
};

function setupLocationMocks(permissionStatus = 'granted') {
  const Location = require('expo-location');
  Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: permissionStatus });
  Location.getCurrentPositionAsync.mockResolvedValue(mockLocation);
}

function setupFetchMock(responseBody: object) {
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(responseBody),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('HomeScreen', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Flujo exitoso ──────────────────────────────────────────────────────────

  describe('flujo exitoso', () => {

    it('muestra el loader mientras carga', () => {
      setupLocationMocks();
      setupFetchMock(mockWeatherResponse);

      const { getByTestId } = render(<HomeScreen />);

      expect(getByTestId('screen-loading')).toBeTruthy();
    });

    it('muestra los datos del clima cuando la API responde correctamente', async () => {
      setupLocationMocks();
      setupFetchMock(mockWeatherResponse);

      const { getByTestId, getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByTestId('screen-weather')).toBeTruthy();
      });

      expect(getByText('BUENOS AIRES')).toBeTruthy();
      expect(getByTestId('temp-min')).toBeTruthy();
      expect(getByTestId('temp-max')).toBeTruthy();
    });

    it('muestra la ciudad en mayúsculas', async () => {
      setupLocationMocks();
      setupFetchMock(mockWeatherResponse);

      const { getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('BUENOS AIRES')).toBeTruthy();
      });
    });

    it('llama a fetch con las coordenadas correctas y la API key', async () => {
      setupLocationMocks();
      setupFetchMock(mockWeatherResponse);

      render(<HomeScreen />);

      await waitFor(() => {
        expect((global as any).fetch).toHaveBeenCalledWith(
          expect.stringContaining('-34.6,-58.4')
        );
        expect((global as any).fetch).toHaveBeenCalledWith(
          expect.stringContaining('test-api-key')
        );
      });
    });

    it('renderiza temp-min y temp-max con los valores formateados', async () => {
      setupLocationMocks();
      setupFetchMock(mockWeatherResponse);

      const { getByTestId } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByTestId('temp-min').props.children).toBe('12°C');
        expect(getByTestId('temp-max').props.children).toBe('24°C');
      });
    });

  });

  // ── Casos límite ───────────────────────────────────────────────────────────

  describe('casos límite', () => {

    it('se queda en loader si el permiso de ubicación es denegado', async () => {
      setupLocationMocks('denied');

      const { getByTestId, queryByTestId } = render(<HomeScreen />);

      await act(async () => {});

      expect(getByTestId('screen-loading')).toBeTruthy();
      expect(queryByTestId('screen-weather')).toBeNull();
    });

    it('se queda en loader si la API devuelve un error en el body', async () => {
      setupLocationMocks();
      setupFetchMock({ error: { code: 1006, message: 'No matching location found.' } });

      const { getByTestId, queryByTestId } = render(<HomeScreen />);

      await act(async () => {});

      expect(getByTestId('screen-loading')).toBeTruthy();
      expect(queryByTestId('screen-weather')).toBeNull();
    });

    it('se queda en loader si fetch lanza una excepción (sin red)', async () => {
      setupLocationMocks();
      (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

      const { getByTestId, queryByTestId } = render(<HomeScreen />);

      await act(async () => {});

      expect(getByTestId('screen-loading')).toBeTruthy();
      expect(queryByTestId('screen-weather')).toBeNull();
    });

    it('muestra "UNKNOWN" si location.name está ausente en la respuesta', async () => {
      setupLocationMocks();
      setupFetchMock({ ...mockWeatherResponse, location: {} });

      const { getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('UNKNOWN')).toBeTruthy();
      });
    });

  });
});