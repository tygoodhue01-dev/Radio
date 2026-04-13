import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';

type WeatherData = {
  temperature: number;
  condition: string;
  humidity: number;
  feelsLike: number;
  icon: string;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      // Using wttr.in for Des Moines, Iowa - free weather API
      const response = await fetch('https://wttr.in/DesMoines,Iowa?format=j1');
      const data = await response.json();
      
      if (data && data.current_condition && data.current_condition[0]) {
        const current = data.current_condition[0];
        setWeather({
          temperature: Math.round(parseInt(current.temp_F)),
          condition: current.weatherDesc[0].value,
          humidity: parseInt(current.humidity),
          feelsLike: Math.round(parseInt(current.FeelsLikeF)),
          icon: getWeatherIcon(current.weatherCode),
        });
        setError(false);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: string): any => {
    const weatherCode = parseInt(code);
    // Weather codes from wttr.in
    if (weatherCode === 113) return 'sunny';
    if (weatherCode === 116) return 'partly-sunny';
    if ([119, 122, 143, 248, 260].includes(weatherCode)) return 'cloudy';
    if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 317, 353, 356, 359].includes(weatherCode)) return 'rainy';
    if ([179, 182, 185, 227, 230, 281, 284, 320, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(weatherCode)) return 'snow';
    if ([200, 386, 389, 392, 395].includes(weatherCode)) return 'thunderstorm';
    return 'cloudy';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.container}>
        <Ionicons name="partly-sunny" size={20} color={Colors.textMuted} />
        <Text style={styles.errorText}>Des Moines</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={weather.icon as any} size={24} color={Colors.accent} />
      </View>
      <View style={styles.info}>
        <View style={styles.tempRow}>
          <Text style={styles.temp}>{weather.temperature}°F</Text>
          <Text style={styles.location}>Des Moines</Text>
        </View>
        <Text style={styles.condition}>{weather.condition}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>Feels like {weather.feelsLike}°</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>Humidity {weather.humidity}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 240, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  temp: {
    fontSize: FontSizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  location: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.secondary,
  },
  condition: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
  detailText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
});
