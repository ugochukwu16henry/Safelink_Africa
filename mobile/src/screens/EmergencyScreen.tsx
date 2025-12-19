/**
 * Emergency SOS Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { emergencyService } from '../services/api';

export default function EmergencyScreen() {
  const [loading, setLoading] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  async function triggerEmergency() {
    try {
      setLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for emergency alerts');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Trigger emergency
      const response = await emergencyService.trigger({
        type: 'security',
        latitude,
        longitude,
        message: 'Emergency SOS activated',
      });

      if (response.data.success) {
        setEmergencyActive(true);
        Alert.alert(
          'Emergency Alert Activated',
          'Your emergency alert has been sent. Help is on the way.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger emergency alert');
      console.error('Emergency trigger error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function cancelEmergency() {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel the emergency alert?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            // Implementation would cancel the active emergency
            setEmergencyActive(false);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="shield" size={80} color="#D90429" />
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>
          Tap the button below to activate an emergency alert
        </Text>

        {!emergencyActive ? (
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={triggerEmergency}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="alert-circle" size={40} color="#fff" />
                <Text style={styles.emergencyButtonText}>ACTIVATE SOS</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.emergencyButton, styles.cancelButton]}
            onPress={cancelEmergency}
          >
            <Ionicons name="close-circle" size={40} color="#fff" />
            <Text style={styles.emergencyButtonText}>CANCEL ALERT</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.info}>
          Your location will be shared with emergency contacts and security partners
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  emergencyButton: {
    backgroundColor: '#D90429',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  info: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

