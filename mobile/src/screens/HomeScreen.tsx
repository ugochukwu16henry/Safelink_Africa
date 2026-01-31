import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeLink Africa</Text>
      <Text style={styles.subtitle}>You're safe. We're here.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick actions</Text>
        <Text style={styles.cardText}>• One-tap SOS (SOS tab)</Text>
        <Text style={styles.cardText}>• Community reports (coming soon)</Text>
        <Text style={styles.cardText}>• Safe transport (coming soon)</Text>
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
    color: colors.safeTeal,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.inkSoft,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.snow,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.safeTeal,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 14,
    color: colors.inkSoft,
    marginBottom: spacing.xs,
  },
});
