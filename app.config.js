import 'dotenv/config';

export default {
  expo: {
    name: 'weather-app',

    slug: 'weather-app',

    scheme: 'weather-app',

    version: '1.0.0',

    orientation: 'portrait',

    userInterfaceStyle: 'automatic',

    android: {
      package: 'com.thomas.weatherapp',
    },

    extra: {
      eas: {
        projectId: 'f4c9410b-c587-4e60-b0f5-ea11d9ed52e5',
      },

      WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    },
  },
};
