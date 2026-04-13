import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getScheduleApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isWeb = useIsWebDesktop();

  const loadSchedule = async () => {
    try {
      const data = await getScheduleApi();
      setSchedule(data);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedule();
  };

  const getScheduleForDay = (day: string) => {
    return schedule.filter(slot => slot.day_of_week === day);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {isWeb && <WebNavBar />}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {isWeb && <WebNavBar />}
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {isWeb ? (
          <WebContainer>
            <View style={styles.header}>
              <Ionicons name="calendar" size={32} color={Colors.primary} />
              <Text style={styles.title}>ON-AIR SCHEDULE</Text>
            </View>
            <Text style={styles.subtitle}>Your weekly guide to all the shows on The Beat 515</Text>

            <View style={styles.scheduleGrid}>
              {DAYS.map(day => {
                const daySlots = getScheduleForDay(day);
                return (
                  <View key={day} style={styles.dayColumn}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayName}>{day.toUpperCase()}</Text>
                    </View>
                    {daySlots.length === 0 ? (
                      <View style={styles.emptyDay}>
                        <Text style={styles.emptyText}>No shows scheduled</Text>
                      </View>
                    ) : (
                      daySlots.map(slot => (
                        <View key={slot.schedule_id} style={styles.slotCard}>
                          <Text style={styles.timeSlot}>{slot.time_slot}</Text>
                          <Text style={styles.showName}>{slot.show_name}</Text>
                          <Text style={styles.djName}>with {slot.dj_name}</Text>
                          {slot.description && (
                            <Text style={styles.description}>{slot.description}</Text>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
            </View>
          </WebContainer>
        ) : (
          <View style={styles.mobileContainer}>
            <View style={styles.header}>
              <Ionicons name="calendar" size={28} color={Colors.primary} />
              <Text style={styles.title}>ON-AIR SCHEDULE</Text>
            </View>

            {DAYS.map(day => {
              const daySlots = getScheduleForDay(day);
              return (
                <View key={day} style={styles.mobileDay}>
                  <View style={styles.mobileDayHeader}>
                    <Text style={styles.mobileDayName}>{day}</Text>
                  </View>
                  {daySlots.length === 0 ? (
                    <Text style={styles.emptyText}>No shows scheduled</Text>
                  ) : (
                    daySlots.map(slot => (
                      <View key={slot.schedule_id} style={styles.mobileSlot}>
                        <Text style={styles.timeSlot}>{slot.time_slot}</Text>
                        <Text style={styles.showName}>{slot.show_name}</Text>
                        <Text style={styles.djName}>with {slot.dj_name}</Text>
                        {slot.description && (
                          <Text style={styles.description}>{slot.description}</Text>
                        )}
                      </View>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}
        {isWeb && <WebFooter />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  dayColumn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dayHeader: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    alignItems: 'center',
  },
  dayName: {
    fontSize: FontSizes.sm,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  emptyDay: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  slotCard: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeSlot: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  showName: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  djName: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  mobileContainer: {
    padding: Spacing.lg,
  },
  mobileDay: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  mobileDayHeader: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
  },
  mobileDayName: {
    fontSize: FontSizes.base,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  mobileSlot: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});
