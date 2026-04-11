/**
 * Plan hour limits per tier.
 * Enforcement is hour-based (seconds). Computed from call_logs each billing period.
 * Billing period = calendar month (resets on the 1st).
 * First month is prorated based on live_since date (set when admin first flips client active).
 */
export const PLAN_LIMITS = {
  STARTER:    { seconds: 8  * 3600 },   // 28,800 s  (~8 hrs)
  GROWTH:     { seconds: 20 * 3600 },   // 72,000 s  (~20 hrs)
  PRO:        { seconds: 35 * 3600 },   // 126,000 s (~35 hrs)
  ENTERPRISE: { seconds: Infinity },    // No cap
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

/** Returns the start of the current calendar month in UTC. */
export function billingMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Returns the effective limit in seconds for a plan this billing month.
 * If liveSince falls within the current billing month, the limit is prorated:
 *   limit = flat_limit × (days_remaining_from_liveSince / days_in_month)
 * Full limit is returned for all subsequent months.
 */
export function planLimitSeconds(plan: string, liveSince?: Date | null): number {
  const flat = (PLAN_LIMITS as Record<string, { seconds: number }>)[plan]?.seconds ?? PLAN_LIMITS.STARTER.seconds;
  if (!liveSince || !isFinite(flat)) return flat;

  const monthStart = billingMonthStart();
  // Only prorate in the signup month — after that always full limit
  if (liveSince < monthStart) return flat;

  const now = new Date();
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  // Days remaining = from liveSince day to end of month (inclusive)
  const dayOfMonth = liveSince.getUTCDate();
  const daysRemaining = daysInMonth - dayOfMonth + 1;

  return Math.round((daysRemaining / daysInMonth) * flat);
}
