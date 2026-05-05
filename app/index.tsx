import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

import { getMinTemp, getMaxTemp, formatTemp } from '../lib/weather';

export default function HomeScreen() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const API_KEY = Constants.expoConfig?.extra?.WEATHER_API_KEY;
      console.log("API KEY:", API_KEY);

      if (!API_KEY) {
        console.log("❌ API KEY UNDEFINED");
        return;
      }

      // Permiso ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("❌ Permiso denegado");
        return;
      }

      // Obtener coords
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch API
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=1&aqi=no&alerts=no`
      );

      const data = await response.json();

      if (data.error) {
        console.log("❌ API ERROR:", data.error);
        return;
      }

      setWeather(data);

    } catch (error) {
      console.log('❌ Weather error:', error);
    }
  };

  // Loading
  if (!weather) {
    return (
      <View testID="screen-loading" style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View testID="screen-weather" style={styles.container}>

      {/* Ciudad */}
      <Text style={styles.city}>
        {weather.location?.name?.toUpperCase() || "UNKNOWN"}
      </Text>

      {/* Temperaturas */}
      <View style={styles.tempContainer}>
        <Text testID="temp-min" style={styles.temp}>
          {formatTemp(getMinTemp(weather))}
        </Text>

        <Text testID="temp-max" style={styles.temp}>
          {formatTemp(getMaxTemp(weather))}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  city: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tempContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  temp: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});