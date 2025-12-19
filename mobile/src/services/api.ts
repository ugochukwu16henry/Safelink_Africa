/**
 * API Service
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001' 
  : 'https://api.safelinkafrica.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });
          await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
          // Retry original request
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    password: string;
    country: string;
    email?: string;
  }) => {
    return api.post('/api/auth/register', data);
  },
  
  login: async (phoneNumber: string, password: string) => {
    return api.post('/api/auth/login', { phoneNumber, password });
  },
  
  verifyPhone: async (phoneNumber: string, otp: string) => {
    return api.post('/api/auth/verify-phone', { phoneNumber, otp });
  },
};

export const emergencyService = {
  trigger: async (data: {
    type: string;
    latitude: number;
    longitude: number;
    message?: string;
  }) => {
    return api.post('/api/emergency/trigger', data);
  },
  
  cancel: async (id: string) => {
    return api.post(`/api/emergency/${id}/cancel`);
  },
  
  getHistory: async () => {
    return api.get('/api/emergency/history');
  },
};

export const reportingService = {
  create: async (data: {
    category: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    anonymous?: boolean;
  }) => {
    return api.post('/api/reports', data);
  },
  
  getNearby: async (latitude: number, longitude: number, radius?: number) => {
    return api.get('/api/reports/nearby', {
      params: { latitude, longitude, radius },
    });
  },
};

export const transportService = {
  startTrip: async (data: {
    startLatitude: number;
    startLongitude: number;
    endLatitude: number;
    endLongitude: number;
  }) => {
    return api.post('/api/transport/trips', data);
  },
  
  updateLocation: async (tripId: string, location: { latitude: number; longitude: number }) => {
    return api.post(`/api/transport/trips/${tripId}/location`, location);
  },
  
  endTrip: async (tripId: string) => {
    return api.post(`/api/transport/trips/${tripId}/end`);
  },
};

export default api;

