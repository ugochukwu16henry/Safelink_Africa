import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account and trusted contacts</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Not signed in</Text>
        <Text style={styles.cardText}>Sign in and add trusted contacts to receive SOS alerts.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>App version</Text>
        <Text style={styles.cardText}>SafeLink Africa 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sky,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.snow,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.safeTeal,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkSoft,
    marginBottom: spacing.xs,
  },
  cardText: {
    fontSize: 16,
    color: colors.ink,
  },
});
