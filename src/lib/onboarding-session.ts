const ONBOARDING_DISMISSED_KEY = "onboardingDismissed";

export const isOnboardingDismissedForSession = (): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1";
};

export const dismissOnboardingForSession = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
};
