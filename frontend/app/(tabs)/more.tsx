import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Rewards',
      icon: 'gift' as const,
      route: '/(tabs)/rewards',
      description: 'Points, leaderboard & prizes',
      color: Colors.primary,
    },
    {
      title: 'Schedule',
      icon: 'calendar' as const,
      route: '/schedule',
      description: 'DJ shows & program times',
      color: Colors.secondary,
    },
    {
      title: 'Charts',
      icon: 'stats-chart' as const,
      route: '/charts',
      description: 'Top rated & trending songs',
      color: Colors.accent,
    },
    {
      title: 'Recently Played',
      icon: 'time' as const,
      route: '/recently-played',
      description: 'Song history',
      color: Colors.primary,
    },
    {
      title: 'Events',
      icon: 'calendar-outline' as const,
      route: '/events',
      description: 'Upcoming events',
      color: Colors.secondary,
    },
    {
      title: 'Contests',
      icon: 'trophy' as const,
      route: '/contests',
      description: 'Win prizes',
      color: Colors.accent,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Explore</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDesc}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
