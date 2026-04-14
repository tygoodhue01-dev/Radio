import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get backend URL from environment - works for both Expo and web builds
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 
                    Constants.expoConfig?.extra?.backendUrl || 
                    '';
const API_BASE = `${BACKEND_URL}/api`;

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('access_token');
}

async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem('refresh_token');
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  console.log('🔐 authFetch:', url.split('/').pop(), 'Token exists:', !!token, token ? `(${token.substring(0, 20)}...)` : 'NONE');
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  
  console.log('🔐 authFetch response:', res.status, res.statusText);
  
  if (res.status === 401) {
    console.log('🔐 Got 401, trying refresh token...');
    // Try refresh
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        await AsyncStorage.setItem('access_token', data.access_token);
        headers['Authorization'] = `Bearer ${data.access_token}`;
        console.log('🔐 Refreshed token, retrying...');
        return fetch(url, { ...options, headers });
      } else {
        console.error('🔐 Refresh failed:', refreshRes.status);
      }
    } else {
      console.error('🔐 No refresh token available');
    }
  }
  return res;
}

function formatError(detail: any): string {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail.map((e: any) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e))).filter(Boolean).join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}

// Auth
export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(formatError(data.detail));
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('refresh_token', data.refresh_token);
  return data.user;
}

export async function registerApi(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(formatError(data.detail));
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('refresh_token', data.refresh_token);
  return data.user;
}

export async function getMeApi() {
  const res = await authFetch(`${API_BASE}/auth/me`);
  if (!res.ok) return null;
  return res.json();
}

export async function logoutApi() {
  await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
}

// News
export async function getNewsApi(category?: string) {
  const q = category ? `?category=${category}` : '';
  const res = await fetch(`${API_BASE}/news${q}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getNewsDetailApi(newsId: string) {
  const res = await fetch(`${API_BASE}/news/${newsId}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

export async function createNewsApi(data: any) {
  const res = await authFetch(`${API_BASE}/news`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(formatError(result.detail));
  return result;
}

export async function updateNewsApi(newsId: string, data: any) {
  const res = await authFetch(`${API_BASE}/news/${newsId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(formatError(result.detail));
  return result;
}

export async function deleteNewsApi(newsId: string) {
  const res = await authFetch(`${API_BASE}/news/${newsId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

// Song Requests
export async function getRequestsApi(status?: string) {
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}/requests${q}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createRequestApi(data: { song_title: string; artist?: string; message?: string }) {
  const res = await authFetch(`${API_BASE}/requests`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(formatError(result.detail));
  return result;
}

export async function updateRequestStatusApi(requestId: string, status: string) {
  const res = await authFetch(`${API_BASE}/requests/${requestId}/status?status=${status}`, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

export async function deleteRequestApi(requestId: string) {
  const res = await authFetch(`${API_BASE}/requests/${requestId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete request');
  return res.json();
}

// Chat
export async function getChatApi() {
  const res = await fetch(`${API_BASE}/requests/chat`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendChatApi(message: string) {
  const res = await authFetch(`${API_BASE}/requests/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(formatError(result.detail));
  return result;
}

// Shows
export async function getShowsApi() {
  const res = await fetch(`${API_BASE}/shows`);
  if (!res.ok) return [];
  return res.json();
}

// Now Playing
export async function getNowPlayingApi() {
  const res = await fetch(`${API_BASE}/now-playing`);
  if (!res.ok) return { song_title: 'The Beat 515', artist: 'Live Radio' };
  return res.json();
}

export async function updateNowPlayingApi(data: { song_title: string; artist?: string; album?: string }) {
  const res = await authFetch(`${API_BASE}/now-playing`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

// DJs
export async function getDjsApi() {
  const res = await fetch(`${API_BASE}/djs`);
  if (!res.ok) return [];
  return res.json();
}

// Admin
export async function getAdminUsersApi() {
  const res = await authFetch(`${API_BASE}/admin/users`);
  if (!res.ok) return [];
  return res.json();
}

export async function updateUserApi(userId: string, data: { name?: string; email?: string; role?: string; bio?: string }) {
  const res = await authFetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function updateUserRoleApi(userId: string, role: string) {
  const res = await authFetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

export async function deleteUserApi(userId: string) {
  const res = await authFetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

export async function getAdminStatsApi() {
  const res = await authFetch(`${API_BASE}/admin/stats`);
  if (!res.ok) return {};
  return res.json();
}

export async function getAdminRequestsApi(status?: string) {
  const q = status ? `?status=${status}` : '';
  const res = await authFetch(`${API_BASE}/admin/requests${q}`);
  if (!res.ok) return [];
  return res.json();
}

// Stream config
export async function getStreamConfigApi() {
  const res = await fetch(`${API_BASE}/stream-config`);
  if (!res.ok) return { stream_url: '', station_name: 'The Beat 515', tagline: 'Proud. Loud. Local.' };
  return res.json();
}

// Profile
export async function updateProfileApi(data: any) {
  const res = await authFetch(`${API_BASE}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

// Rewards
export async function getRewardsApi() {
  const res = await fetch(`${API_BASE}/rewards`);
  if (!res.ok) return [];
  return res.json();
}

export async function getMyPointsApi() {
  const res = await authFetch(`${API_BASE}/rewards/my-points`);
  if (!res.ok) return { points: 0, lifetime_points: 0 };
  return res.json();
}

export async function getMyHistoryApi() {
  const res = await authFetch(`${API_BASE}/rewards/my-history`);
  if (!res.ok) return [];
  return res.json();
}

export async function getLeaderboardApi() {
  const res = await fetch(`${API_BASE}/rewards/leaderboard`);
  if (!res.ok) return [];
  return res.json();
}

export async function dailyCheckInApi() {
  const res = await authFetch(`${API_BASE}/rewards/check-in`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(formatError(data.detail));
  return data;
}

export async function redeemRewardApi(rewardId: string) {
  const res = await authFetch(`${API_BASE}/rewards/redeem`, {
    method: 'POST',
    body: JSON.stringify({ reward_id: rewardId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(formatError(data.detail));
  return data;
}

// Events
export async function getEventsApi() {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) return [];
  return res.json();
}

// Contests
export async function getContestsApi() {
  const res = await fetch(`${API_BASE}/contests`);
  if (!res.ok) return [];
  return res.json();
}

// Podcasts
export async function getPodcastsApi() {
  const res = await fetch(`${API_BASE}/podcasts`);
  if (!res.ok) return [];
  return res.json();
}

// Recently Played
export async function getRecentlyPlayedApi(limit: number = 50) {
  const res = await fetch(`${API_BASE}/recently-played?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

// Comments
export async function createCommentApi(postType: string, postId: string, content: string, token: string) {
  const res = await fetch(`${API_BASE}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ post_type: postType, post_id: postId, content })
  });
  return res.json();
}

export async function getCommentsApi(postType: string, postId: string) {
  const res = await fetch(`${API_BASE}/comments/${postType}/${postId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getPendingCommentsApi() {
  const res = await authFetch(`${API_BASE}/admin/comments/pending`);
  if (!res.ok) return [];
  return res.json();
}

export async function approveCommentApi(commentId: string) {
  const res = await authFetch(`${API_BASE}/admin/comments/${commentId}/approve`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to approve');
  return res.json();
}

export async function deleteCommentApi(commentId: string) {
  const res = await authFetch(`${API_BASE}/admin/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

// Schedule
export async function getScheduleApi() {
  const res = await fetch(`${API_BASE}/schedule`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function createScheduleSlotApi(data: any) {
  const res = await authFetch(`${API_BASE}/admin/schedule`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create schedule slot');
  return res.json();
}

export async function updateScheduleSlotApi(scheduleId: string, data: any) {
  const res = await authFetch(`${API_BASE}/admin/schedule/${scheduleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update schedule slot');
  return res.json();
}

export async function deleteScheduleSlotApi(scheduleId: string) {
  const res = await authFetch(`${API_BASE}/admin/schedule/${scheduleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete schedule slot');
  return res.json();
}

// Job Applications
export async function submitJobApplicationApi(data: any) {
  const res = await fetch(`${API_BASE}/job-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit application');
  return res.json();
}

export async function getJobApplicationsApi() {
  const res = await authFetch(`${API_BASE}/admin/job-applications`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function updateJobApplicationStatusApi(appId: string, status: string) {
  const res = await authFetch(`${API_BASE}/admin/job-applications/${appId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function deleteJobApplicationApi(appId: string) {
  const res = await authFetch(`${API_BASE}/admin/job-applications/${appId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete application');
  return res.json();
}

export async function sendEmailToApplicantApi(appId: string, emailData: any) {
  const res = await authFetch(`${API_BASE}/admin/job-applications/${appId}/send-email`, {
    method: 'POST',
    body: JSON.stringify(emailData),
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
}

// ==================== ROLE MANAGEMENT ====================
export async function getRolesApi() {
  const res = await authFetch(`${API_BASE}/admin/roles`);
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

export async function getPermissionsApi() {
  const res = await authFetch(`${API_BASE}/admin/permissions`);
  if (!res.ok) throw new Error('Failed to fetch permissions');
  return res.json();
}

export async function createRoleApi(roleData: { name: string; display_name: string; color: string; permissions: string[] }) {
  const res = await authFetch(`${API_BASE}/admin/roles`, {
    method: 'POST',
    body: JSON.stringify(roleData),
  });
  if (!res.ok) throw new Error('Failed to create role');
  return res.json();
}

export async function updateRoleApi(roleId: string, roleData: { display_name?: string; color?: string; permissions?: string[] }) {
  const res = await authFetch(`${API_BASE}/admin/roles/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify(roleData),
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

export async function deleteRoleApi(roleId: string) {
  const res = await authFetch(`${API_BASE}/admin/roles/${roleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Failed to delete role');
  }
  return res.json();
}

// ==================== PUSH NOTIFICATIONS ====================
export async function registerPushTokenApi(token: string, deviceName?: string) {
  const res = await authFetch(`${API_BASE}/push/register`, {
    method: 'POST',
    body: JSON.stringify({ token, device_name: deviceName }),
  });
  if (!res.ok) throw new Error('Failed to register push token');
  return res.json();
}

export async function getPushTokensApi() {
  const res = await authFetch(`${API_BASE}/admin/push/tokens`);
  if (!res.ok) throw new Error('Failed to fetch push tokens');
  return res.json();
}

export async function sendPushNotificationApi(title: string, body: string, target: string = 'all', data?: any) {
  const res = await authFetch(`${API_BASE}/admin/push/send`, {
    method: 'POST',
    body: JSON.stringify({ title, body, target, data }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to send notification');
  }
  return res.json();
}

export async function getPushHistoryApi() {
  const res = await authFetch(`${API_BASE}/admin/push/history`);
  if (!res.ok) throw new Error('Failed to fetch push history');
  return res.json();
}
