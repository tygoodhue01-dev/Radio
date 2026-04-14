import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  useWindowDimensions, Platform, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const teamMembers = [
    { name: 'Station Manager', role: 'Operations', icon: 'briefcase' },
    { name: 'Program Director', role: 'Content & Shows', icon: 'musical-notes' },
    { name: 'Music Director', role: 'Playlists & Artists', icon: 'disc' },
    { name: 'Promotions', role: 'Events & Contests', icon: 'megaphone' },
  ];

  const stats = [
    { value: '24/7', label: 'Live Broadcasting' },
    { value: '50K+', label: 'Monthly Listeners' },
    { value: '10+', label: 'Local DJs' },
    { value: '2020', label: 'Est.' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>About Us</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[s.content, isWeb && s.contentWeb]}>
          {/* Hero Section */}
          <View style={s.heroSection}>
            <LinearGradient
              colors={[Colors.primary + '40', Colors.secondary + '20', 'transparent']}
              style={s.heroGradient}
            />
            <Text style={s.heroLogo}>THE BEAT <Text style={{ color: Colors.primary }}>515</Text></Text>
            <Text style={s.heroTagline}>PROUD. LOUD. LOCAL.</Text>
            <Text style={s.heroDesc}>
              Des Moines' premier urban radio station, bringing you the best in hip-hop, R&B, and local talent since 2020.
            </Text>
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            {stats.map((stat, idx) => (
              <View key={idx} style={s.statCard}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Mission Section */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: Colors.primary }]} />
              <Text style={s.sectionTitle}>OUR MISSION</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardText}>
                The Beat 515 exists to amplify the voices, music, and culture of Des Moines and Central Iowa. 
                We're committed to providing a platform for local artists, engaging our community through events 
                and contests, and delivering the hottest music 24/7.
              </Text>
              <Text style={[s.cardText, { marginTop: Spacing.md }]}>
                Whether you're tuning in on your morning commute, at work, or heading out for the night, 
                The Beat 515 is your soundtrack to life in the 515.
              </Text>
            </View>
          </View>

          {/* What We Offer */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: Colors.secondary }]} />
              <Text style={s.sectionTitle}>WHAT WE OFFER</Text>
            </View>
            <View style={s.offerGrid}>
              {[
                { icon: 'radio', title: '24/7 Live Radio', desc: 'Non-stop music and entertainment' },
                { icon: 'mic', title: 'Local DJs', desc: 'Talent from the 515 community' },
                { icon: 'musical-notes', title: 'Song Requests', desc: 'You pick the music we play' },
                { icon: 'gift', title: 'Rewards Program', desc: 'Earn points, win prizes' },
                { icon: 'calendar', title: 'Local Events', desc: 'Concerts, meetups, and more' },
                { icon: 'newspaper', title: 'Music News', desc: 'Stay updated on the scene' },
              ].map((item, idx) => (
                <View key={idx} style={s.offerCard}>
                  <View style={s.offerIcon}>
                    <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                  </View>
                  <Text style={s.offerTitle}>{item.title}</Text>
                  <Text style={s.offerDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Team Section */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: Colors.accent }]} />
              <Text style={s.sectionTitle}>OUR TEAM</Text>
            </View>
            <View style={s.teamGrid}>
              {teamMembers.map((member, idx) => (
                <View key={idx} style={s.teamCard}>
                  <View style={s.teamIcon}>
                    <Ionicons name={member.icon as any} size={28} color={Colors.secondary} />
                  </View>
                  <Text style={s.teamName}>{member.name}</Text>
                  <Text style={s.teamRole}>{member.role}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact CTA */}
          <View style={s.ctaSection}>
            <Text style={s.ctaTitle}>Want to get in touch?</Text>
            <Text style={s.ctaDesc}>We'd love to hear from you - whether it's feedback, partnership inquiries, or just to say hi!</Text>
            <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/contact')}>
              <Ionicons name="mail" size={20} color="#fff" />
              <Text style={s.ctaBtnText}>CONTACT US</Text>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View style={s.socialSection}>
            <Text style={s.socialTitle}>FOLLOW US</Text>
            <View style={s.socialRow}>
              {[
                { icon: 'logo-instagram', color: '#E4405F' },
                { icon: 'logo-twitter', color: '#1DA1F2' },
                { icon: 'logo-facebook', color: '#1877F2' },
                { icon: 'logo-tiktok', color: '#fff' },
                { icon: 'logo-youtube', color: '#FF0000' },
              ].map((social, idx) => (
                <TouchableOpacity key={idx} style={[s.socialBtn, { borderColor: social.color + '50' }]}>
                  <Ionicons name={social.icon as any} size={24} color={social.color} />
                </TouchableOpacity>
              ))}
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
  contentWeb: { maxWidth: 900, alignSelf: 'center', width: '100%' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: Spacing.xxl, position: 'relative' },
  heroGradient: { position: 'absolute', top: 0, left: -50, right: -50, bottom: 0, borderRadius: 100 },
  heroLogo: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  heroTagline: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.secondary, letterSpacing: 6, marginTop: Spacing.sm },
  heroDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 24, maxWidth: 500 },

  // Stats
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  statCard: { flex: 1, minWidth: 80, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: FontSizes.xl, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },

  // Sections
  section: { marginTop: Spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionDot: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 3 },

  // Card
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  cardText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 24 },

  // Offer Grid
  offerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  offerCard: { flex: 1, minWidth: 150, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  offerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  offerTitle: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff' },
  offerDesc: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },

  // Team
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  teamCard: { flex: 1, minWidth: 150, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  teamIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.secondary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  teamName: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff', textAlign: 'center' },
  teamRole: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },

  // CTA
  ctaSection: { marginTop: Spacing.xxl, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '30' },
  ctaTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: '#fff' },
  ctaDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 400 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: BorderRadius.round, marginTop: Spacing.lg },
  ctaBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  // Social
  socialSection: { marginTop: Spacing.xxl, alignItems: 'center' },
  socialTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 3, marginBottom: Spacing.md },
  socialRow: { flexDirection: 'row', gap: Spacing.md },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
