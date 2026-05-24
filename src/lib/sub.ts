type SubscriptionLike = {
  status?: string | null;
  planId?: string | null;
  currentPeriodEnd?: string | Date | null;
};

export const getPeriodEnd = (sub?: SubscriptionLike | null) => {
  const end = sub?.currentPeriodEnd;
  if (!end) return "";
  if (typeof end === "string") return end;
  if (end instanceof Date) return end.toISOString();
  return String(end);
};

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
  if (sub.status !== "active") return false;
  const periodEnd = getPeriodEnd(sub);
  if (!periodEnd) return true;
  return !isSubscriptionExpired(periodEnd).isExpired;
};

export const shouldShowUpgradeFlow = (sub?: SubscriptionLike | null) => {
  if (!sub || hasPaidAccess(sub)) return false;
  return sub.status === "trial";
};
