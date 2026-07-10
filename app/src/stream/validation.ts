export interface StreamInputs {
  startTime: number;
  cliffTime: number;
  endTime: number;
  amount: bigint;
}

export interface ValidationError {
  field: "startTime" | "cliffTime" | "endTime" | "amount" | "general";
  message: string;
}

const MIN_DURATION = 60;
const MAX_DURATION = 10 * 365 * 86400;

export function validateStreamDates(
  inputs: StreamInputs,
  now: number = nowUnix(),
): ValidationError[] {
  const { startTime, cliffTime, endTime } = inputs;
  const errors: ValidationError[] = [];

  if (startTime <= 0) {
    errors.push({ field: "startTime", message: "Start time must be a positive unix timestamp" });
  }
  if (startTime <= now) {
    errors.push({ field: "startTime", message: "Start time must be in the future" });
  }
  if (cliffTime < startTime) {
    errors.push({ field: "cliffTime", message: "Cliff must be on or after start time" });
  }
  if (endTime <= startTime) {
    errors.push({ field: "endTime", message: "End time must be after start time" });
  }
  if (cliffTime > endTime) {
    errors.push({ field: "cliffTime", message: "Cliff must be on or before end time" });
  }
  if (endTime - startTime < MIN_DURATION) {
    errors.push({ field: "endTime", message: `Duration must be at least ${MIN_DURATION} seconds` });
  }
  if (endTime - startTime > MAX_DURATION) {
    errors.push({ field: "endTime", message: "Duration exceeds 10 year maximum" });
  }

  return errors;
}

export function validateAmount(amount: bigint): ValidationError | null {
  if (amount <= 0n) {
    return { field: "amount", message: "Amount must be greater than 0" };
  }
  if (amount > 10n ** 30n) {
    return { field: "amount", message: "Amount exceeds maximum allowed" };
  }
  return null;
}

export function getClaimable(
  now: number,
  startTime: number,
  cliffTime: number,
  endTime: number,
  amount: bigint,
  amountWithdrawn: bigint,
): bigint {
  if (amount <= 0n || now < cliffTime || now < startTime) {
    return 0n;
  }
  if (now >= endTime) {
    return amount - amountWithdrawn;
  }
  const elapsed = now - startTime;
  const total = endTime - startTime;
  if (total <= 0) return amount - amountWithdrawn;
  const vested = (amount * BigInt(elapsed)) / BigInt(total);
  const claimable = vested - amountWithdrawn;
  return claimable > 0n ? claimable : 0n;
}

export function getMilestoneClaimable(
  milestoneReached: boolean,
  cancelled: boolean,
  amount: bigint,
  amountWithdrawn: bigint,
): bigint {
  if (cancelled || !milestoneReached) return 0n;
  return amount - amountWithdrawn;
}

export function isBeforeCliff(now: number, cliffTime: number): boolean {
  return now < cliffTime;
}

export function isAfterEnd(now: number, endTime: number): boolean {
  return now >= endTime;
}

export function isStreamActive(
  cancelled: boolean,
  amountWithdrawn: bigint,
  amount: bigint,
): boolean {
  return !cancelled && amountWithdrawn < amount;
}

export function toDatetimeLocal(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function fromDatetimeLocal(val: string): number {
  if (!val) return 0;
  return Math.floor(new Date(val).getTime() / 1000);
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}
