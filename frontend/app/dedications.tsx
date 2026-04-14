import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  useWindowDimensions, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://radio-production-3743.up.railway.app';

export default function DedicationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [dedicatedTo, setDedicatedTo] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [recentDedications, setRecentDedications] = useState<any[]>([]);

  useEffect(() => {
    loadRecentDedications();
  }, []);

  const loadRecentDedications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dedications/recent`);
      if (res.ok) {
        const data = await res.json();
        setRecentDedications(data);
      }
    } catch (e) {
      console.error('Failed to load dedications:', e);
    }
  };

  const handleSubmit = async () => {
    if (!songTitle || !artist || !dedicatedTo) {
      Platform.OS === 'web' 
        ? alert('Please fill in song, artist, and who it\'s for') 
        : Alert.alert('Error', 'Please fill in song, artist, and who it\'s for');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/dedications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song_title: songTitle,
          artist,
          dedicated_to: dedicatedTo,
          message,
          from_name: user?.name || 'Anonymous',
          user_id: user?.user_id
        })
      });
      
      if (res.ok) {
        Platform.OS === 'web' 
          ? alert('Dedication submitted! 💕 The DJ will play your song soon.') 
          : Alert.alert('Success', 'Dedication submitted! 💕 The DJ will play your song soon.');
        setSongTitle('');
        setArtist('');
        setDedicatedTo('');
        setMessage('');
        loadRecentDedications();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (e) {
      Platform.OS === 'web' 
        ? alert('Failed to submit dedication. Try again!') 
        : Alert.alert('Error', 'Failed to submit dedication. Try again!');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Song Dedications</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[s.content, isWeb && s.contentWeb]}>
          {/* Hero */}
          <View style={s.heroSection}>
            <LinearGradient
              colors={[Colors.primary + '40', Colors.accent + '20', 'transparent']}
              style={s.heroGradient}
            />
            <Text style={s.heroEmoji}>💕</Text>
            <Text style={s.heroTitle}>Dedicate a Song</Text>
            <Text style={s.heroDesc}>
              Send a special song dedication to someone you love! Our DJs will read your message on air.
            </Text>
          </View>

          {/* Dedication Form */}
          <View style={s.formSection}>
            <View style={s.formCard}>
              <View style={isWeb ? s.formRow : null}>
                <View style={[s.inputGroup, isWeb && { flex: 1 }]}>
                  <Text style={s.label}>Song Title *</Text>
                  <TextInput
                    style={s.input}
                    value={songTitle}
                    onChangeText={setSongTitle}
                    placeholder="What song do you want to dedicate?"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={[s.inputGroup, isWeb && { flex: 1 }]}>
                  <Text style={s.label}>Artist *</Text>
                  <TextInput
                    style={s.input}
                    value={artist}
                    onChangeText={setArtist}
                    placeholder="Artist name"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Dedicated To *</Text>
                <TextInput
                  style={s.input}
                  value={dedicatedTo}
                  onChangeText={setDedicatedTo}
                  placeholder="Who is this dedication for?"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Your Message (Optional)</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Add a personal message to be read on air..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={[s.submitBtn, sending && { opacity: 0.7 }]} 
                onPress={handleSubmit}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="heart" size={20} color="#fff" />
                    <Text style={s.submitBtnText}>SEND DEDICATION</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Dedications */}
          {recentDedications.length > 0 && (
            <View style={s.recentSection}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionDot, { backgroundColor: Colors.primary }]} />
                <Text style={s.sectionTitle}>RECENT DEDICATIONS</Text>
              </View>

              {recentDedications.map((ded, idx) => (
                <View key={idx} style={s.dedicationCard}>
                  <View style={s.dedicationHeader}>
                    <Ionicons name="heart" size={16} color={Colors.primary} />
                    <Text style={s.dedicationFrom}>From {ded.from_name}</Text>
                    <Text style={s.dedicationTo}>to {ded.dedicated_to}</Text>
                  </View>
                  <Text style={s.dedicationSong}>"{ded.song_title}" by {ded.artist}</Text>
                  {ded.message && <Text style={s.dedicationMessage}>"{ded.message}"</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Tips */}
          <View style={s.tipsSection}>
            <Text style={s.tipsTitle}>💡 DEDICATION TIPS</Text>
            <View style={s.tipsList}>
              <Text style={s.tipItem}>• Keep your message short and sweet for on-air reading</Text>
              <Text style={s.tipItem}>• Dedications are played during our live shows</Text>
              <Text style={s.tipItem}>• Inappropriate messages won't be read on air</Text>
              <Text style={s.tipItem}>• Tune in to hear your dedication!</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: '#fff' },
  content: { paddingHorizontal: Spacing.lg },
  contentWeb: { maxWidth: 700, alignSelf: 'center', width: '100%' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: Spacing.xl, position: 'relative' },
  heroGradient: { position: 'absolute', top: 0, left: -50, right: -50, bottom: 0, borderRadius: 100 },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: FontSizes.xxl, fontWeight: '900', color: '#fff', marginTop: Spacing.sm },
  heroDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 400 },

  // Form
  formSection: { marginTop: Spacing.lg },
  formCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30' },
  formRow: { flexDirection: 'row', gap: Spacing.md },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: '#fff', borderWidth: 1, borderColor: Colors.border },
  textArea: { minHeight: 80 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.round, paddingVertical: 16, marginTop: Spacing.md },
  submitBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  // Recent Dedications
  recentSection: { marginTop: Spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionDot: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 3 },
  dedicationCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  dedicationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  dedicationFrom: { fontSize: FontSizes.sm, fontWeight: '600', color: '#fff' },
  dedicationTo: { fontSize: FontSizes.sm, color: Colors.primary },
  dedicationSong: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff' },
  dedicationMessage: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 6 },

  // Tips
  tipsSection: { marginTop: Spacing.xxl, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  tipsTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.accent, letterSpacing: 2, marginBottom: Spacing.md },
  tipsList: { gap: 8 },
  tipItem: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
