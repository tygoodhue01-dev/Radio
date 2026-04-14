// app.config.js - Dynamic config that reads environment variables
export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://radio-production-3743.up.railway.app',
    },
  };
};
