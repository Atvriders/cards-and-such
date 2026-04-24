import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcHappiness, BUILDING_INFO, GRID_SIZE, TOTAL_TURNS } from "./state.js";

describe("City Builder Micro", () => {
  it("initializes with empty grid and correct budget", () => {
    const s = initialState(42);
    expect(s.turn).toBe(1);
    expect(s.budget).toBe(50);
    expect(s.grid.length).toBe(GRID_SIZE * GRID_SIZE);
    expect(s.grid.every(c => c.building === "empty")).toBe(true);
    expect(s.phase).toBe("building");
  });

  it("placing a house deducts cost and updates grid", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "selectBuilding", building: "house" });
    const s3 = reducer(s2, { type: "place", cellIndex: 0 });
    expect(s3.grid[0]?.building).toBe("house");
    expect(s3.budget).toBe(s.budget - BUILDING_INFO.house.cost);
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "place", cellIndex: 0 });
    const s3 = reducer(s2, { type: "place", cellIndex: 0 });
    expect(s3.budget).toBe(s2.budget); // no extra cost
  });

  it("cannot place without enough budget", () => {
    const s = { ...initialState(42), budget: 1 };
    const s2 = reducer(s, { type: "place", cellIndex: 5 });
    expect(s2.grid[5]?.building).toBe("empty");
  });

  it("parks boost adjacent cell happiness", () => {
    const s = initialState(42);
    // Place house at 0, park at 1 (adjacent)
    const withHouse = reducer(reducer(s, { type: "selectBuilding", building: "house" }), { type: "place", cellIndex: 0 });
    const withPark = reducer(reducer(withHouse, { type: "selectBuilding", building: "park" }), { type: "place", cellIndex: 1 });
    const happinessWithPark = calcHappiness(withPark.grid);
    // Remove park and check happiness drops
    const grid2 = [...withPark.grid];
    grid2[1] = { building: "empty" };
    const happinessWithout = calcHappiness(grid2);
    expect(happinessWithPark).toBeGreaterThan(happinessWithout);
  });

  it("endTurn advances turn and generates income", () => {
    const s = initialState(42);
    const s2 = reducer(reducer(s, { type: "selectBuilding", building: "shop" }), { type: "place", cellIndex: 0 });
    const budgetBefore = s2.budget;
    const s3 = reducer(s2, { type: "endTurn" });
    expect(s3.turn).toBe(2);
    expect(s3.budget).toBeGreaterThan(budgetBefore); // shop income
  });

  it("game completes after 20 turns", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("happiness score is capped at 100", () => {
    const s = { ...initialState(42), phase: "done" as const, happiness: 200 };
    expect(isTerminal(s)?.score).toBe(100);
  });
});
