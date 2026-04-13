import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getNewsApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

const CATEGORIES = ['all', 'music', 'events', 'local', 'contests'];

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = useCallback(async () => {
    const data = await getNewsApi(category === 'all' ? '' : category);
    setNews(data);
  }, [category]);

  useEffect(() => { loadNews(); }, [loadNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>NEWS</Text>
        <Text style={styles.subtitle}>Stay in the loop</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            testID={`category-${cat}`}
            style={[styles.catBtn, category === cat && styles.catBtnActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {news.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No news articles yet</Text>
          </View>
        ) : (
          news.map((article, idx) => (
            <TouchableOpacity
              key={article.news_id}
              testID={`news-card-${article.news_id}`}
              style={[styles.card, idx === 0 && styles.heroCard]}
              onPress={() => router.push(`/news/${article.news_id}`)}
            >
              {article.image_url ? (
                <Image source={{ uri: article.image_url }} style={idx === 0 ? styles.heroImage : styles.cardImage} />
              ) : null}
              <View style={styles.cardContent}>
                <View style={styles.metaRow}>
                  <Text style={styles.catLabel}>{article.category?.toUpperCase()}</Text>
                  <Text style={styles.date}>
                    {new Date(article.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={idx === 0 ? styles.heroTitle : styles.cardTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.summary} numberOfLines={idx === 0 ? 3 : 2}>
                  {article.summary}
                </Text>
                <Text style={styles.author}>By {article.author_name}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.white, letterSpacing: 3 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  catRow: { marginTop: Spacing.md, maxHeight: 44 },
  catContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  catBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1 },
  catTextActive: { color: Colors.white },
  scroll: { flex: 1, paddingTop: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textMuted, marginTop: Spacing.md, fontSize: FontSizes.md },
  card: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  heroCard: { borderColor: 'rgba(0,240,255,0.3)' },
  cardImage: { width: '100%', height: 120 },
  heroImage: { width: '100%', height: 200 },
  cardContent: { padding: Spacing.md },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2 },
  date: { fontSize: FontSizes.xs, color: Colors.textMuted },
  heroTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  summary: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  author: { fontSize: FontSizes.xs, color: Colors.textMuted },
});
