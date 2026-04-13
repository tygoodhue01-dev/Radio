import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { submitJobApplicationApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';

export default function CareersPage() {
  const router = useRouter();
  const isWeb = useIsWebDesktop();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    position: '',
    name: '',
    email: '',
    phone: '',
    cover_letter: '',
    resume_data: '',
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.position || !formData.cover_letter) {
      const msg = 'Please fill in all required fields';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required Fields', msg);
      return;
    }

    setSubmitting(true);
    try {
      await submitJobApplicationApi(formData);
      const successMsg = 'Application submitted successfully! We\'ll be in touch soon.';
      
      if (Platform.OS === 'web') {
        alert(successMsg);
      } else {
        Alert.alert('Success!', successMsg);
      }
      
      // Reset form
      setFormData({
        position: '',
        name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume_data: '',
      });
      
      router.back();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to submit application';
      Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const FormContent = () => (
    <>
      <View style={styles.header}>
        <Ionicons name="briefcase" size={32} color={Colors.primary} />
        <Text style={styles.title}>JOIN THE TEAM</Text>
      </View>
      <Text style={styles.subtitle}>
        Be part of the 515's hottest radio station! Submit your application below.
      </Text>

      <View style={[styles.formCard, isWeb && { maxWidth: 700 }]}>
        <Text style={styles.label}>POSITION APPLYING FOR *</Text>
        <TextInput
          style={styles.input}
          value={formData.position}
          onChangeText={(val) => setFormData({...formData, position: val})}
          placeholder="e.g., DJ, Producer, Marketing Manager"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>FULL NAME *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(val) => setFormData({...formData, name: val})}
          placeholder="Your name"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>EMAIL ADDRESS *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(val) => setFormData({...formData, email: val})}
          placeholder="your@email.com"
          placeholderTextColor={Colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(val) => setFormData({...formData, phone: val})}
          placeholder="(555) 123-4567"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>COVER LETTER / WHY YOU? *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.cover_letter}
          onChangeText={(val) => setFormData({...formData, cover_letter: val})}
          placeholder="Tell us why you'd be a great fit for The Beat 515..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.helperText}>
          * Required fields. We'll review your application and get back to you soon!
        </Text>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>SUBMIT APPLICATION</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {isWeb && <WebNavBar />}
      <ScrollView style={styles.container}>
        {isWeb ? (
          <WebContainer>
            <FormContent />
            <WebFooter />
          </WebContainer>
        ) : (
          <View style={styles.mobileContainer}>
            <FormContent />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  mobileContainer: { padding: Spacing.lg },
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
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    marginTop: Spacing.lg,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
});
