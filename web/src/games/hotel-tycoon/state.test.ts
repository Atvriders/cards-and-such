import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcOccupancy, TOTAL_WEEKS, ROOM_COST, AMENITY_COST } from "./state.js";

describe("Hotel Tycoon", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.week).toBe(1);
    expect(s.cash).toBe(600);
    expect(s.phase).toBe("plan");
    expect(s.rooms).toBe(10);
    expect(s.guestRating).toBe(3);
  });

  it("setRate clamps to 40-200", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setRate", value: 10 }).ratePerNight).toBe(40);
    expect(reducer(s, { type: "setRate", value: 500 }).ratePerNight).toBe(200);
    expect(reducer(s, { type: "setRate", value: 100 }).ratePerNight).toBe(100);
  });

  it("buyRoom increments rooms and deducts cash", () => {
    const s = { ...initialState(42), cash: 1000 };
    const s2 = reducer(s, { type: "buyRoom" });
    expect(s2.rooms).toBe(11);
    expect(s2.cash).toBe(1000 - ROOM_COST);
  });

  it("buyRoom fails with insufficient cash", () => {
    const s = { ...initialState(42), cash: 50 };
    const s2 = reducer(s, { type: "buyRoom" });
    expect(s2.rooms).toBe(10);
  });

  it("buyAmenity increments amenities", () => {
    const s = { ...initialState(42), cash: 1000 };
    const s2 = reducer(s, { type: "buyAmenity" });
    expect(s2.amenities).toBe(1);
    expect(s2.cash).toBe(1000 - AMENITY_COST);
  });

  it("runWeek transitions to results", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "runWeek" });
    expect(s2.phase).toBe("results");
    expect(s2.lastOccupied).toBeGreaterThanOrEqual(0);
    expect(s2.lastOccupied).toBeLessThanOrEqual(s.rooms);
  });

  it("calcOccupancy returns fewer bookings at max rate than min rate", () => {
    const lowRate = calcOccupancy(10, 40, 0, 0, "offSeason", 1, () => 0.5);
    const highRate = calcOccupancy(10, 200, 0, 0, "offSeason", 1, () => 0.5);
    expect(highRate).toBeLessThanOrEqual(lowRate);
  });

  it("peak season has higher occupancy than off season", () => {
    const peak = calcOccupancy(10, 80, 0, 0, "peak", 3, () => 0.8);
    const off = calcOccupancy(10, 80, 0, 0, "offSeason", 3, () => 0.8);
    expect(peak).toBeGreaterThan(off);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 5000 })).toEqual({ score: 100 });
  });

  it("completes all weeks", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_WEEKS; i++) {
      s = reducer(s, { type: "runWeek" });
      s = reducer(s, { type: "nextWeek" });
    }
    expect(s.phase).toBe("done");
  });
});
