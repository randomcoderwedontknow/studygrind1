import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFocusLockStore } from '@/stores/focusLockStore';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated } = useAuthStore();
  const { initializeThemes } = useThemeStore();
  const { loadFromDatabase } = useFocusLockStore();

  useEffect(() => {
    // Initialize theme system on app start
    initializeThemes();
    
    // Load focus lock settings if user is authenticated
    if (isAuthenticated) {
      loadFromDatabase();
    }
  }, [isAuthenticated]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="owner-settings" />
        <Stack.Screen name="weekly-review" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
