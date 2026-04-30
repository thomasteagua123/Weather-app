import 'dotenv/config';

export default {
  expo: {
    name: 'weather-app',
    slug: 'weather-app',

    scheme: 'weather-app',

    version: '1.0.0',

    orientation: 'portrait',

    userInterfaceStyle: 'automatic',

    extra: {
      WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    },
  },
};
