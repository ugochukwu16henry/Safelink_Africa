import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account and trusted contacts</Text>
      {user ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Signed in as</Text>
            <Text style={styles.cardText}>{user.email}</Text>
            <Text style={styles.cardName}>{user.name}</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </>
      ) : null}
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
  cardName: {
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  logoutButton: {
    backgroundColor: colors.sosRedLight,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sosRed,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sosRed,
  },
});
