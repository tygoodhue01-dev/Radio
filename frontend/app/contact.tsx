import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  useWindowDimensions, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ContactScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Platform.OS === 'web' ? alert('Please fill in all required fields') : Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    
    Platform.OS === 'web' 
      ? alert('Message sent! We\'ll get back to you soon.') 
      : Alert.alert('Success', 'Message sent! We\'ll get back to you soon.');
    
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const contactMethods = [
    { icon: 'call', label: 'Studio Line', value: '(515) 555-BEAT', color: Colors.primary },
    { icon: 'mail', label: 'Email', value: 'hello@thebeat515.com', color: Colors.secondary },
    { icon: 'location', label: 'Studio', value: 'Des Moines, Iowa', color: Colors.accent },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Contact Us</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[s.content, isWeb && s.contentWeb]}>
          {/* Hero */}
          <View style={s.heroSection}>
            <LinearGradient
              colors={[Colors.secondary + '30', 'transparent']}
              style={s.heroGradient}
            />
            <Ionicons name="chatbubbles" size={48} color={Colors.secondary} />
            <Text style={s.heroTitle}>Get In Touch</Text>
            <Text style={s.heroDesc}>
              Have a question, feedback, or want to partner with us? We'd love to hear from you!
            </Text>
          </View>

          {/* Contact Methods */}
          <View style={s.methodsRow}>
            {contactMethods.map((method, idx) => (
              <View key={idx} style={s.methodCard}>
                <View style={[s.methodIcon, { backgroundColor: method.color + '20' }]}>
                  <Ionicons name={method.icon as any} size={24} color={method.color} />
                </View>
                <Text style={s.methodLabel}>{method.label}</Text>
                <Text style={s.methodValue}>{method.value}</Text>
              </View>
            ))}
          </View>

          {/* Contact Form */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: Colors.primary }]} />
              <Text style={s.sectionTitle}>SEND US A MESSAGE</Text>
            </View>

            <View style={s.formCard}>
              <View style={isWeb ? s.formRow : null}>
                <View style={[s.inputGroup, isWeb && { flex: 1 }]}>
                  <Text style={s.label}>Name *</Text>
                  <TextInput
                    style={s.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={[s.inputGroup, isWeb && { flex: 1 }]}>
                  <Text style={s.label}>Email *</Text>
                  <TextInput
                    style={s.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Subject</Text>
                <TextInput
                  style={s.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="What's this about?"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.label}>Message *</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Your message..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={5}
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
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={s.submitBtnText}>SEND MESSAGE</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Links */}
          <View style={s.quickLinks}>
            <Text style={s.quickLinksTitle}>QUICK LINKS</Text>
            <View style={s.linksGrid}>
              {[
                { icon: 'briefcase', label: 'Careers', route: '/careers', desc: 'Join our team' },
                { icon: 'megaphone', label: 'Advertise', route: '/advertise', desc: 'Partner with us' },
                { icon: 'musical-notes', label: 'Request', route: '/(tabs)/requests', desc: 'Song requests' },
                { icon: 'information-circle', label: 'About', route: '/about', desc: 'Our story' },
              ].map((link, idx) => (
                <TouchableOpacity key={idx} style={s.linkCard} onPress={() => router.push(link.route as any)}>
                  <Ionicons name={link.icon as any} size={24} color={Colors.secondary} />
                  <Text style={s.linkLabel}>{link.label}</Text>
                  <Text style={s.linkDesc}>{link.desc}</Text>
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
  contentWeb: { maxWidth: 800, alignSelf: 'center', width: '100%' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: Spacing.xl, position: 'relative' },
  heroGradient: { position: 'absolute', top: 0, left: -50, right: -50, bottom: 0, borderRadius: 100 },
  heroTitle: { fontSize: FontSizes.xxl, fontWeight: '900', color: '#fff', marginTop: Spacing.md },
  heroDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 400 },

  // Contact Methods
  methodsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  methodCard: { flex: 1, minWidth: 150, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  methodIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  methodLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: 4 },
  methodValue: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff', textAlign: 'center' },

  // Form
  formSection: { marginTop: Spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionDot: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 3 },
  formCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  formRow: { flexDirection: 'row', gap: Spacing.md },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSizes.md, color: '#fff', borderWidth: 1, borderColor: Colors.border },
  textArea: { minHeight: 120 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.round, paddingVertical: 16, marginTop: Spacing.md },
  submitBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  // Quick Links
  quickLinks: { marginTop: Spacing.xxl },
  quickLinksTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 3, marginBottom: Spacing.md },
  linksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  linkCard: { flex: 1, minWidth: 150, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  linkLabel: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff', marginTop: Spacing.sm },
  linkDesc: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
});
