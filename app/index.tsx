import { useEffect, useState } from 'react';

import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import Constants from 'expo-constants';
import * as Location from 'expo-location';

const API_KEY = Constants.expoConfig?.extra?.WEATHER_API_KEY;

export default function HomeScreen() {
  const [weather, setWeather] = useState<any>(null);

  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      // PERMISOS
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      // UBICACIÓN
      const location = await Location.getCurrentPositionAsync({});

      const latitude = location.coords.latitude;

      const longitude = location.coords.longitude;

      // CIUDAD
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const city =
        reverseGeocode[0]?.city ||
        reverseGeocode[0]?.district ||
        reverseGeocode[0]?.subregion ||
        reverseGeocode[0]?.region ||
        'Unknown';

      // FECHA AYER
      const yesterday = new Date();

      yesterday.setDate(yesterday.getDate() - 1);

      const formattedYesterday = yesterday.toISOString().split('T')[0];

      // AYER
      const historyResponse = await fetch(
        `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${latitude},${longitude}&dt=${formattedYesterday}`
      );

      const historyData = await historyResponse.json();

      // HOY + MAÑANA
      const forecastResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2&aqi=no&alerts=no`
      );

      const forecastData = await forecastResponse.json();

      // VALIDAR RESPUESTAS
      if (historyData.error || forecastData.error) {
        console.log('API Error:', historyData.error || forecastData.error);

        return;
      }

      // EVITAR UNDEFINED
      const historyDay = historyData?.forecast?.forecastday?.[0];

      const forecastDays = forecastData?.forecast?.forecastday || [];

      // COMBINAR
      const combinedDays = [historyDay, ...forecastDays].filter(Boolean);

      setWeather({
        city,

        current: forecastData.current,

        forecast: {
          forecastday: combinedDays,
        },
      });
    } catch (error) {
      console.log('Weather error:', error);
    }
  };

  // LOADING
  if (!weather || !weather.forecast) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  const days = weather.forecast.forecastday;

  const currentDay = days[selectedDay];

  return (
    <View style={styles.container}>
      {/* TOP DATE NAV */}
      <View style={styles.topBar}>
        {[0, 1, 2].map((dayIndex) => {
          const date = new Date();

          if (dayIndex === 0) {
            date.setDate(date.getDate() - 1);
          }

          if (dayIndex === 2) {
            date.setDate(date.getDate() + 1);
          }

          const formatted = date.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'numeric',
          });

          return (
            <TouchableOpacity key={dayIndex} onPress={() => setSelectedDay(dayIndex)}>
              <Text style={selectedDay === dayIndex ? styles.activeDate : styles.inactiveDate}>
                {formatted}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CITY */}
      <Text style={styles.city}>{weather.city.toUpperCase()}</Text>

      {/* ICON */}
      <Image
        source={{
          uri: 'https:' + currentDay.day.condition.icon.replace('64x64', '128x128'),
        }}
        style={styles.weatherIcon}
      />

      {/* INFO */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <Text style={styles.metricIcon}>💧</Text>

          <Text style={styles.metricText}>{weather.current.humidity}%</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricIcon}>🌀</Text>

          <Text style={styles.metricText}>{weather.current.pressure_mb} hPa</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricIcon}>🌬</Text>

          <Text style={styles.metricText}>{weather.current.wind_kph} km/h</Text>
        </View>
      </View>

      {/* TEMPERATURES */}
      <View style={styles.temperatureRow}>
        <Text style={styles.sideTemperature}>{Math.round(currentDay.day.mintemp_c)}°</Text>

        {selectedDay === 1 && (
          <Text style={styles.mainTemperature}>{Math.round(weather.current.temp_c)}°</Text>
        )}

        <Text style={styles.sideTemperature}>{Math.round(currentDay.day.maxtemp_c)}°</Text>
      </View>

      {/* TIMELINE */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineHour}>9</Text>

        <View style={styles.lineContainer}>
          <View style={styles.line} />

          {selectedDay === 1 && <Text style={styles.nowText}>NOW</Text>}
        </View>

        <Text style={styles.timelineHour}>15</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },

  inactiveDate: {
    color: '#D6D6D6',
    fontSize: 12,
  },

  activeDate: {
    color: 'black',
    fontSize: 13,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingBottom: 3,
  },

  city: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 40,
    color: 'black',
  },

  weatherIcon: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginBottom: 10,
  },

  metricsContainer: {
    position: 'absolute',
    left: 24,
    top: 320,
    gap: 12,
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metricIcon: {
    fontSize: 12,
  },

  metricText: {
    fontSize: 14,
    color: 'black',
  },

  temperatureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 20,
    gap: 24,
  },

  sideTemperature: {
    fontSize: 40,
    color: 'black',
  },

  mainTemperature: {
    fontSize: 72,
    fontWeight: '900',
    color: 'black',
    lineHeight: 75,
  },

  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },

  timelineHour: {
    fontSize: 12,
    color: '#BDBDBD',
  },

  lineContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },

  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#DADADA',
    marginBottom: 5,
  },

  nowText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'black',
  },
});
