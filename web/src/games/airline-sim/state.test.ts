import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcPassengers, TOTAL_QUARTERS, PLANE_COST, MAINTENANCE_COST, FUEL_HEDGE_COST } from "./state.js";

describe("Airline Sim", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.quarter).toBe(1);
    expect(s.cash).toBe(1000);
    expect(s.phase).toBe("plan");
    expect(s.fleet).toBe(2);
    expect(s.safetyRating).toBe(70);
  });

  it("setPrice clamps to 50-400", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setPrice", value: 10 }).ticketPrice).toBe(50);
    expect(reducer(s, { type: "setPrice", value: 1000 }).ticketPrice).toBe(400);
    expect(reducer(s, { type: "setPrice", value: 200 }).ticketPrice).toBe(200);
  });

  it("buyPlane increments fleet and deducts cash", () => {
    const s = { ...initialState(42), cash: 2000 };
    const s2 = reducer(s, { type: "buyPlane" });
    expect(s2.fleet).toBe(3);
    expect(s2.cash).toBe(2000 - PLANE_COST);
  });

  it("buyPlane fails with insufficient cash", () => {
    const s = { ...initialState(42), cash: 100 };
    const s2 = reducer(s, { type: "buyPlane" });
    expect(s2.fleet).toBe(2);
  });

  it("upgradeMaintenance increments level", () => {
    const s = { ...initialState(42), cash: 500 };
    const s2 = reducer(s, { type: "upgradeMaintenance" });
    expect(s2.maintenanceLevel).toBe(1);
    expect(s2.cash).toBe(500 - MAINTENANCE_COST);
  });

  it("toggleFuelHedge pays and sets flag", () => {
    const s = { ...initialState(42), cash: 500 };
    const s2 = reducer(s, { type: "toggleFuelHedge" });
    expect(s2.fuelHedged).toBe(true);
    expect(s2.cash).toBe(500 - FUEL_HEDGE_COST);
  });

  it("fly transitions to results", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "fly" });
    expect(s2.phase).toBe("results");
    expect(s2.lastFlights).toBe(s.fleet * 45);
  });

  it("calcPassengers respects max capacity", () => {
    const fleet = 2;
    const seatsPerFlight = 120;
    const flightsPerQuarter = 45;
    const maxCap = fleet * seatsPerFlight * flightsPerQuarter;
    const pax = calcPassengers(fleet, 50, "domestic", 3, 100, () => 1.0);
    expect(pax).toBeLessThanOrEqual(maxCap);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 10000 })).toEqual({ score: 100 });
  });

  it("completes all quarters", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_QUARTERS; i++) {
      s = reducer(s, { type: "fly" });
      s = reducer(s, { type: "nextQuarter" });
    }
    expect(s.phase).toBe("done");
  });
});
