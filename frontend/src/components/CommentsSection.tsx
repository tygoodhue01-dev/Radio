import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getCommentsApi, createCommentApi } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';

type CommentsSectionProps = {
  postType: string;
  postId: string;
};

export default function CommentsSection({ postType, postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const data = await getCommentsApi(postType, postId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postType, postId]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      const msg = 'Please enter a comment';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Required', msg);
      }
      return;
    }

    if (!user) {
      const msg = 'Please sign in to comment';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Sign In Required', msg);
      }
      return;
    }

    setSubmitting(true);
    try {
      // Get token from storage
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.default.getItem('access_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      await createCommentApi(postType, postId, commentText, token);
      setCommentText('');
      const successMsg = 'Comment submitted! It will appear after moderation.';
      if (Platform.OS === 'web') {
        alert(successMsg);
      } else {
        Alert.alert('Success', successMsg);
      }
      loadComments();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to submit comment';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={20} color={Colors.primary} />
        <Text style={styles.headerTitle}>
          Comments ({comments.length})
        </Text>
      </View>

      {/* Comment Form */}
      <View style={styles.formCard}>
        <Text style={styles.formLabel}>
          {user ? 'Leave a Comment' : 'Sign in to comment'}
        </Text>
        <TextInput
          style={styles.textArea}
          value={commentText}
          onChangeText={setCommentText}
          placeholder={user ? 'Share your thoughts...' : 'Please sign in to comment'}
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          editable={!!user && !submitting}
        />
        <TouchableOpacity
          style={[styles.submitBtn, (!user || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmitComment}
          disabled={!user || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#fff" />
              <Text style={styles.submitBtnText}>POST COMMENT</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : comments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No comments yet</Text>
          <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.comment_id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={16} color={Colors.primary} />
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 12,
    marginTop: Spacing.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  commentsList: {
    gap: Spacing.md,
  },
  commentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,0,127,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  commentDate: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  commentText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
