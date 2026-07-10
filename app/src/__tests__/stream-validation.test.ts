import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateStreamDates,
  validateAmount,
  getClaimable,
  getMilestoneClaimable,
  isBeforeCliff,
  isAfterEnd,
  isStreamActive,
  fromDatetimeLocal,
  toDatetimeLocal,
} from "../stream/validation.ts";

const HOUR = 3600;
const DAY = 86400;
const MONTH = 2592000;

// ─── Date Validation ────────────────────────────────────────────────

describe("validateStreamDates", () => {
  const past = 1_700_000_000; // a reference "now" in the past
  const start = past + HOUR;  // all valid streams start in the future

  it("accepts valid stream with cliff at start", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start,
      endTime: start + MONTH,
      amount: 1000n,
    }, past);
    assert.deepEqual(errs, []);
  });

  it("accepts cliff == end (lump sum at end)", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start + MONTH,
      endTime: start + MONTH,
      amount: 1000n,
    }, past);
    assert.deepEqual(errs, []);
  });

  it("rejects start time in the past", () => {
    const errs = validateStreamDates({
      startTime: past,
      cliffTime: past + DAY,
      endTime: past + MONTH,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "startTime"));
  });

  it("accepts start time 1 second in the future", () => {
    const errs = validateStreamDates({
      startTime: past + 1,
      cliffTime: past + 1,
      endTime: past + 61,
      amount: 1000n,
    }, past);
    assert.equal(errs.filter((e) => e.field === "startTime").length, 0);
  });

  it("rejects cliff before start", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start - DAY,
      endTime: start + MONTH,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "cliffTime"));
  });

  it("rejects end <= start", () => {
    const errs1 = validateStreamDates({
      startTime: start,
      cliffTime: start,
      endTime: start,
      amount: 1000n,
    }, past);
    assert.ok(errs1.some((e) => e.field === "endTime"));

    const errs2 = validateStreamDates({
      startTime: start,
      cliffTime: start,
      endTime: start - DAY,
      amount: 1000n,
    }, past);
    assert.ok(errs2.some((e) => e.field === "endTime"));
  });

  it("rejects cliff after end", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start + MONTH * 2,
      endTime: start + MONTH,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "cliffTime"));
  });

  it("rejects duration less than 60 seconds", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start,
      endTime: start + 30,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "endTime"));
  });

  it("rejects duration exceeding 10 years", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start,
      endTime: start + 11 * 365 * DAY,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "endTime"));
  });

  it("accepts max 10 year duration", () => {
    const errs = validateStreamDates({
      startTime: start,
      cliffTime: start,
      endTime: start + 10 * 365 * DAY,
      amount: 1000n,
    }, past);
    assert.ok(!errs.some((e) => e.field === "endTime"));
  });

  it("rejects zero start time", () => {
    const errs = validateStreamDates({
      startTime: 0,
      cliffTime: 100,
      endTime: 200,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "startTime"));
  });

  it("rejects negative start time", () => {
    const errs = validateStreamDates({
      startTime: -1,
      cliffTime: 100,
      endTime: 200,
      amount: 1000n,
    }, past);
    assert.ok(errs.some((e) => e.field === "startTime"));
  });
});

// ─── Amount Validation ──────────────────────────────────────────────

describe("validateAmount", () => {
  it("accepts positive amount", () => {
    assert.equal(validateAmount(1000n), null);
  });

  it("rejects zero amount", () => {
    assert.ok(validateAmount(0n)?.field === "amount");
  });

  it("rejects negative amount", () => {
    assert.ok(validateAmount(-1n)?.field === "amount");
  });

  it("rejects amount > 10^30", () => {
    assert.ok(validateAmount(10n ** 30n + 1n)?.field === "amount");
  });

  it("accepts amount == 10^30", () => {
    assert.equal(validateAmount(10n ** 30n), null);
  });
});

// ─── getClaimable (Vesting Math) ────────────────────────────────────

describe("getClaimable", () => {
  const start = 1_700_000_000;
  const cliff = start + DAY * 30;
  const end = start + MONTH * 6;

  it("returns 0 if now before cliff", () => {
    assert.equal(getClaimable(start + DAY * 15, start, cliff, end, 1000n, 0n), 0n);
  });

  it("returns vested amount at cliff (linear from start)", () => {
    assert.equal(getClaimable(cliff, start, cliff, end, 1000n, 0n), 166n);
  });

  it("returns 0 if now == cliff - 1", () => {
    assert.equal(getClaimable(cliff - 1, start, cliff, end, 1000n, 0n), 0n);
  });

  it("returns non-zero if now == cliff + 1", () => {
    const result = getClaimable(cliff + 1, start, cliff, end, 1000n, 0n);
    assert.ok(result > 0n);
  });

  it("returns full remaining if now >= end", () => {
    assert.equal(getClaimable(end, start, cliff, end, 1000n, 300n), 700n);
  });

  it("returns 0 if amount is 0", () => {
    assert.equal(getClaimable(end, start, cliff, end, 0n, 0n), 0n);
  });

  it("returns 0 if now < start", () => {
    assert.equal(getClaimable(start - 1, start, cliff, end, 1000n, 0n), 0n);
  });

  it("returns correct vested at midpoint", () => {
    const mid = start + (end - start) / 2;
    const result = getClaimable(mid, start, cliff, end, 1000n, 0n);
    assert.equal(result, 500n);
  });

  it("accounts for partial withdrawal", () => {
    const mid = start + (end - start) / 2;
    const result = getClaimable(mid, start, cliff, end, 1000n, 400n);
    assert.equal(result, 100n);
  });

  it("returns 0 if already fully withdrawn", () => {
    assert.equal(getClaimable(end, start, cliff, end, 1000n, 1000n), 0n);
  });

  it("handles zero-duration stream (start == end)", () => {
    assert.equal(getClaimable(start, start, start, start, 1000n, 0n), 1000n);
  });
});

// ─── getMilestoneClaimable ──────────────────────────────────────────

describe("getMilestoneClaimable", () => {
  it("returns full amount if milestone reached and not cancelled", () => {
    assert.equal(getMilestoneClaimable(true, false, 1000n, 0n), 1000n);
  });

  it("returns 0 if milestone not reached", () => {
    assert.equal(getMilestoneClaimable(false, false, 1000n, 0n), 0n);
  });

  it("returns 0 if cancelled", () => {
    assert.equal(getMilestoneClaimable(true, true, 1000n, 0n), 0n);
  });

  it("returns remaining after partial withdraw", () => {
    assert.equal(getMilestoneClaimable(true, false, 1000n, 300n), 700n);
  });

  it("returns 0 if fully withdrawn", () => {
    assert.equal(getMilestoneClaimable(true, false, 1000n, 1000n), 0n);
  });
});

// ─── isBeforeCliff / isAfterEnd ─────────────────────────────────────

describe("isBeforeCliff", () => {
  it("returns true when before cliff", () => {
    assert.equal(isBeforeCliff(100, 200), true);
  });

  it("returns false when at cliff", () => {
    assert.equal(isBeforeCliff(200, 200), false);
  });

  it("returns false when after cliff", () => {
    assert.equal(isBeforeCliff(300, 200), false);
  });
});

describe("isAfterEnd", () => {
  it("returns true when at end", () => {
    assert.equal(isAfterEnd(200, 200), true);
  });

  it("returns true when after end", () => {
    assert.equal(isAfterEnd(300, 200), true);
  });

  it("returns false when before end", () => {
    assert.equal(isAfterEnd(100, 200), false);
  });
});

// ─── isStreamActive ─────────────────────────────────────────────────

describe("isStreamActive", () => {
  it("returns true for active stream", () => {
    assert.equal(isStreamActive(false, 100n, 1000n), true);
  });

  it("returns false if cancelled", () => {
    assert.equal(isStreamActive(true, 100n, 1000n), false);
  });

  it("returns false if fully withdrawn", () => {
    assert.equal(isStreamActive(false, 1000n, 1000n), false);
  });
});

// ─── Date Conversion ────────────────────────────────────────────────

describe("toDatetimeLocal / fromDatetimeLocal", () => {
  it("roundtrips a unix timestamp", () => {
    const ts = 1_700_000_000;
    const str = toDatetimeLocal(ts);
    const back = fromDatetimeLocal(str);
    assert.equal(back, ts);
  });

  it("fromDatetimeLocal returns 0 for empty string", () => {
    assert.equal(fromDatetimeLocal(""), 0);
  });
});
