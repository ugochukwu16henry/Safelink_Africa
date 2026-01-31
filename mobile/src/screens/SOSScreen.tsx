import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { EMERGENCY_API } from '../config/api';
import { useAuth } from '../context/AuthContext';

export function SOSScreen() {
  const { user } = useAuth();
  const [pressed, setPressed] = useState(false);

  const handleSOS = async () => {
    const userId = user?.id ?? 'anonymous';
    setPressed(true);
    try {
      const res = await fetch(`${EMERGENCY_API}/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          latitude: 6.5244,
          longitude: 3.3792,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('SOS sent', `Alert ID: ${data.id}. Help is on the way.`);
      } else {
        Alert.alert('SOS failed', data.message || 'Could not reach server. Try again.');
      }
    } catch (e) {
      Alert.alert(
        'SOS failed',
        'Cannot reach Emergency service. Run the emergency service (port 4002) or check network.'
      );
    } finally {
      setPressed(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.subtitle}>Tap once to send your location to emergency responders</Text>
      {!user && (
        <Text style={styles.anonHint}>You're not signed in — alert will be sent as anonymous.</Text>
      )}
      <Pressable
        style={({ pressed: p }) => [styles.sosButton, p && styles.sosButtonPressed]}
        onPress={handleSOS}
        disabled={pressed}
      >
        <Text style={styles.sosButtonText}>{pressed ? 'Sending…' : 'SOS'}</Text>
      </Pressable>
      <Text style={styles.hint}>Keep calm. We'll share your location with your trusted contacts and responders.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sky,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  anonHint: {
    fontSize: 12,
    color: colors.warning,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.sosRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sosButtonText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.snow,
    letterSpacing: 2,
  },
  hint: {
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
