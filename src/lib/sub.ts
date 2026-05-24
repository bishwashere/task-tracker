type SubscriptionLike = {
  status?: string | null;
  currentPeriodEnd?: string | Date | null;
};

export const getPeriodEnd = (sub?: SubscriptionLike | null) =>
  sub?.currentPeriodEnd?.toString() ?? "";

export const isSubscriptionExpired = (endsAt: string) => {
  const now = new Date();
  const endsAtDate = new Date(endsAt);
  const isValidDate = !Number.isNaN(endsAtDate.getTime());

  return {
    isExpired: isValidDate && endsAtDate < now,
    remainingDays: Math.floor(
      (endsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    ),
    expiringSoon:
      isValidDate &&
      Math.floor(
        (endsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ) < 2,
  };
};

export const hasPaidAccess = (sub?: SubscriptionLike | null) => {
  if (!sub) return false;
  const { isExpired } = isSubscriptionExpired(getPeriodEnd(sub));
  return sub.status === "active" && !isExpired;
};
