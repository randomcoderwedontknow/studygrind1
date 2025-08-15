import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function IndexScreen() {
  const { isAuthenticated } = useAuthStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  if (hasCompletedOnboarding) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/onboarding" />;
}