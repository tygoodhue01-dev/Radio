import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

interface AdvancedPlayerProps {
  visible: boolean;
  onClose: () => void;
  nowPlaying: any;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function AdvancedPlayer({ visible, onClose, nowPlaying, isPlaying, onPlayPause }: AdvancedPlayerProps) {
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [volume, setVolume] = useState(100);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const timerOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
  ];

  useEffect(() => {
    if (sleepTimer) {
      setTimeLeft(sleepTimer * 60);
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev > 0) {
            return prev - 1;
          } else {
            onPlayPause(); // Stop playback
            setSleepTimer(null);
            return null;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sleepTimer]);

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetEqualizer = () => {
    setBass(0);
    setMid(0);
    setTreble(0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Advanced Player</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Now Playing */}
            <View style={styles.nowPlayingSection}>
              <View style={styles.visualizer}>
                {[...Array(20)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      { height: isPlaying ? Math.random() * 60 + 20 : 20 }
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.songTitle}>{nowPlaying?.song_title || 'The Beat 515'}</Text>
              <Text style={styles.artist}>{nowPlaying?.artist || 'Live Radio'}</Text>
              
              <TouchableOpacity style={styles.playBtn} onPress={onPlayPause}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={40} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Equalizer */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Equalizer</Text>
                <TouchableOpacity onPress={resetEqualizer}>
                  <Text style={styles.resetBtn}>Reset</Text>
                </TouchableOpacity>
              </View>

              {/* Bass */}
              <View style={styles.eqControl}>
                <Ionicons name="musical-note" size={20} color={Colors.primary} />
                <Text style={styles.eqLabel}>Bass</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={-10}
                  maximumValue={10}
                  value={bass}
                  onValueChange={setBass}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
                <Text style={styles.eqValue}>{bass.toFixed(0)}</Text>
              </View>

              {/* Mid */}
              <View style={styles.eqControl}>
                <Ionicons name="pulse" size={20} color={Colors.secondary} />
                <Text style={styles.eqLabel}>Mid</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={-10}
                  maximumValue={10}
                  value={mid}
                  onValueChange={setMid}
                  minimumTrackTintColor={Colors.secondary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.secondary}
                />
                <Text style={styles.eqValue}>{mid.toFixed(0)}</Text>
              </View>

              {/* Treble */}
              <View style={styles.eqControl}>
                <Ionicons name="sparkles" size={20} color={Colors.accent} />
                <Text style={styles.eqLabel}>Treble</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={-10}
                  maximumValue={10}
                  value={treble}
                  onValueChange={setTreble}
                  minimumTrackTintColor={Colors.accent}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.accent}
                />
                <Text style={styles.eqValue}>{treble.toFixed(0)}</Text>
              </View>
            </View>

            {/* Volume Boost */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Volume Boost</Text>
              <View style={styles.volumeControl}>
                <Ionicons name="volume-low" size={24} color={Colors.textSecondary} />
                <Slider
                  style={styles.volumeSlider}
                  minimumValue={0}
                  maximumValue={150}
                  value={volume}
                  onValueChange={setVolume}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
                <Ionicons name="volume-high" size={24} color={Colors.primary} />
                <Text style={styles.volumeValue}>{volume}%</Text>
              </View>
            </View>

            {/* Sleep Timer */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sleep Timer</Text>
              
              {timeLeft ? (
                <View style={styles.timerActive}>
                  <Ionicons name="moon" size={32} color={Colors.accent} />
                  <Text style={styles.timerText}>Stops in {formatTime(timeLeft)}</Text>
                  <TouchableOpacity 
                    onPress={() => { setSleepTimer(null); setTimeLeft(null); }}
                    style={styles.cancelTimer}
                  >
                    <Text style={styles.cancelTimerText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.timerOptions}>
                  {timerOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.timerBtn}
                      onPress={() => setSleepTimer(option.value)}
                    >
                      <Ionicons name="moon-outline" size={18} color={Colors.secondary} />
                      <Text style={styles.timerBtnText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  nowPlayingSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    gap: 4,
    marginBottom: Spacing.lg,
  },
  bar: {
    width: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  songTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  artist: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  resetBtn: {
    fontSize: FontSizes.sm,
    color: Colors.secondary,
    fontWeight: '600',
  },
  eqControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  eqLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    width: 50,
    fontWeight: '600',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  eqValue: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    width: 30,
    textAlign: 'right',
    fontWeight: '700',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  volumeValue: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    width: 45,
    textAlign: 'right',
    fontWeight: '700',
  },
  timerActive: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: 'rgba(255,240,0,0.1)',
    borderRadius: BorderRadius.lg,
  },
  timerText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: Spacing.md,
  },
  cancelTimer: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
  },
  cancelTimerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '600',
  },
});
