import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_QUARTERS, REFINERY_COST, PROSPECT_COST } from "./state.js";

describe("Oil Tycoon", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.quarter).toBe(1);
    expect(s.cash).toBe(800);
    expect(s.phase).toBe("plan");
    expect(s.wells).toBe(2);
    expect(s.refinery).toBe(0);
  });

  it("setSellPrice clamps to 20-100", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setSellPrice", value: 5 }).sellPrice).toBe(20);
    expect(reducer(s, { type: "setSellPrice", value: 200 }).sellPrice).toBe(100);
    expect(reducer(s, { type: "setSellPrice", value: 60 }).sellPrice).toBe(60);
  });

  it("upgradeRefinery costs REFINERY_COST and increments level", () => {
    const s = { ...initialState(42), cash: 500 };
    const s2 = reducer(s, { type: "upgradeRefinery" });
    expect(s2.refinery).toBe(1);
    expect(s2.cash).toBe(500 - REFINERY_COST);
  });

  it("upgradeRefinery fails with insufficient cash", () => {
    const s = { ...initialState(42), cash: 50 };
    const s2 = reducer(s, { type: "upgradeRefinery" });
    expect(s2.refinery).toBe(0);
  });

  it("toggleProspect pays and enables prospecting", () => {
    const s = { ...initialState(42), cash: 500 };
    const s2 = reducer(s, { type: "toggleProspect" });
    expect(s2.prospecting).toBe(true);
    expect(s2.cash).toBe(500 - PROSPECT_COST);
  });

  it("toggleProspect refunds when turned off", () => {
    const s = { ...initialState(42), cash: 500, prospecting: true };
    const s2 = reducer(s, { type: "toggleProspect" });
    expect(s2.prospecting).toBe(false);
    expect(s2.cash).toBe(500 + PROSPECT_COST);
  });

  it("pump transitions to results", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "pump" });
    expect(s2.phase).toBe("results");
    expect(s2.barrelsSold).toBeGreaterThanOrEqual(0);
    expect(s2.lastRevenue).toBe(s2.barrelsSold * s.sellPrice);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 8000 })).toEqual({ score: 100 });
  });

  it("completes all quarters", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_QUARTERS; i++) {
      s = reducer(s, { type: "pump" });
      s = reducer(s, { type: "nextQuarter" });
    }
    expect(s.phase).toBe("done");
  });

  it("refinery upgrade boosts production", () => {
    const s0 = { ...initialState(42), refinery: 0 };
    const s3 = { ...initialState(42), refinery: 3 };
    // After pumping, higher refinery = more barrels
    const r0 = reducer(s0, { type: "pump" }).barrelsSold;
    const r3 = reducer(s3, { type: "pump" }).barrelsSold;
    expect(r3).toBeGreaterThanOrEqual(r0);
  });
});
