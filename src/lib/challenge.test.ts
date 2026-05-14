import { describe, expect, it } from "vitest";
import {
  addDaysUtc,
  diffCalendarDaysUtc,
  fractionComplete,
  getChallengePhase,
  getYmdForChallengeDay,
  habitSatisfied,
  isDayComplete,
  listChallengeDates,
  parseYMDUtc,
} from "./challenge";
import type { Habit } from "@/types";

describe("parseYMDUtc / diffCalendarDaysUtc", () => {
  it("counts same day as 0", () => {
    expect(diffCalendarDaysUtc("2026-01-01", "2026-01-01")).toBe(0);
  });
  it("counts forward days", () => {
    expect(diffCalendarDaysUtc("2026-01-01", "2026-01-02")).toBe(1);
    expect(diffCalendarDaysUtc("2026-01-01", "2026-03-17")).toBe(75);
  });
  it("counts backward as negative", () => {
    expect(diffCalendarDaysUtc("2026-01-10", "2026-01-05")).toBe(-5);
  });
});

describe("getChallengePhase", () => {
  it("returns upcoming before start", () => {
    expect(getChallengePhase("2026-02-01", "2026-01-30")).toEqual({
      phase: "upcoming",
      startsInDays: 2,
    });
  });
  it("returns active day 1 on start date", () => {
    expect(getChallengePhase("2026-01-01", "2026-01-01")).toEqual({
      phase: "active",
      dayNumber: 1,
      daysRemaining: 74,
    });
  });
  it("returns active day 75 on last day", () => {
    expect(getChallengePhase("2026-01-01", "2026-03-16")).toEqual({
      phase: "active",
      dayNumber: 75,
      daysRemaining: 0,
    });
  });
  it("returns completed after day 75", () => {
    expect(getChallengePhase("2026-01-01", "2026-03-17").phase).toBe("completed");
  });
  it("returns invalid for bad dates", () => {
    expect(getChallengePhase("not-a-date", "2026-01-01").phase).toBe("invalid_start");
  });
});

describe("addDaysUtc / getYmdForChallengeDay", () => {
  it("adds days across month boundary", () => {
    expect(addDaysUtc("2026-01-30", 3)).toBe("2026-02-02");
  });
  it("maps challenge day to YMD", () => {
    expect(getYmdForChallengeDay("2026-01-01", 1)).toBe("2026-01-01");
    expect(getYmdForChallengeDay("2026-01-01", 75)).toBe("2026-03-16");
  });
});

describe("parseYMDUtc", () => {
  it("parses valid YMD", () => {
    expect(Number.isFinite(parseYMDUtc("2026-06-15"))).toBe(true);
  });
  it("returns NaN for invalid", () => {
    expect(Number.isNaN(parseYMDUtc("2026-13-40"))).toBe(true);
  });
});

describe("habitSatisfied", () => {
  const cb: Habit = { id: "1", name: "x", kind: "checkbox" };
  const num: Habit = { id: "2", name: "water", kind: "number", target: 3000 };
  const numNoTarget: Habit = { id: "3", name: "pages", kind: "number" };
  const dur: Habit = { id: "4", name: "move", kind: "duration", target: 45 };

  it("checkbox", () => {
    expect(habitSatisfied(cb, true)).toBe(true);
    expect(habitSatisfied(cb, false)).toBe(false);
    expect(habitSatisfied(cb, undefined)).toBe(false);
  });
  it("number with target", () => {
    expect(habitSatisfied(num, 2999)).toBe(false);
    expect(habitSatisfied(num, 3000)).toBe(true);
  });
  it("number without target requires > 0", () => {
    expect(habitSatisfied(numNoTarget, 0)).toBe(false);
    expect(habitSatisfied(numNoTarget, 1)).toBe(true);
  });
  it("duration with target", () => {
    expect(habitSatisfied(dur, 44)).toBe(false);
    expect(habitSatisfied(dur, 45)).toBe(true);
  });
});

describe("isDayComplete / fractionComplete", () => {
  const habits: Habit[] = [
    { id: "a", name: "A", kind: "checkbox" },
    { id: "b", name: "B", kind: "number", target: 2 },
  ];

  it("fractionComplete", () => {
    expect(fractionComplete(habits, { a: true, b: 1 })).toBeCloseTo(0.5);
    expect(fractionComplete(habits, { a: true, b: 2 })).toBe(1);
  });
  it("isDayComplete", () => {
    expect(isDayComplete(habits, { a: true, b: 2 })).toBe(true);
    expect(isDayComplete(habits, { a: false, b: 2 })).toBe(false);
    expect(isDayComplete([], { a: true })).toBe(false);
  });
});

describe("listChallengeDates", () => {
  it("returns 75 dates", () => {
    expect(listChallengeDates("2026-01-01")).toHaveLength(75);
    expect(listChallengeDates("2026-01-01")[0]).toBe("2026-01-01");
    expect(listChallengeDates("2026-01-01")[74]).toBe("2026-03-16");
  });
  it("returns empty for invalid start", () => {
    expect(listChallengeDates("not-a-date")).toEqual([]);
  });
});
