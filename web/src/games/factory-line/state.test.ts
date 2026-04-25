import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcOutput, TOTAL_SHIFTS, MACHINE_UPGRADE_COST, QC_COST, WORKER_COST_PER_SHIFT } from "./state.js";

describe("Factory Line", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.shift).toBe(1);
    expect(s.cash).toBe(400);
    expect(s.phase).toBe("plan");
    expect(s.workers).toBe(3);
    expect(s.machineLevel).toBe(0);
    expect(s.orderSize).toBeGreaterThan(0);
  });

  it("setWorkers clamps to 2-10", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setWorkers", value: 0 }).workers).toBe(2);
    expect(reducer(s, { type: "setWorkers", value: 20 }).workers).toBe(10);
    expect(reducer(s, { type: "setWorkers", value: 5 }).workers).toBe(5);
  });

  it("upgradeMachine increments level and costs cash", () => {
    const s = { ...initialState(42), cash: 500 };
    const s2 = reducer(s, { type: "upgradeMachine" });
    expect(s2.machineLevel).toBe(1);
    expect(s2.cash).toBe(500 - MACHINE_UPGRADE_COST);
  });

  it("toggleQC switches quality control on and off", () => {
    const s = initialState(42);
    expect(s.qualityControl).toBe(false);
    const s2 = reducer(s, { type: "toggleQC" });
    expect(s2.qualityControl).toBe(true);
    const s3 = reducer(s2, { type: "toggleQC" });
    expect(s3.qualityControl).toBe(false);
  });

  it("runShift deducts worker and QC costs", () => {
    const s = { ...initialState(42), qualityControl: false, workers: 3 };
    const s2 = reducer(s, { type: "runShift" });
    expect(s2.lastCost).toBe(3 * WORKER_COST_PER_SHIFT);
  });

  it("runShift with QC adds QC_COST", () => {
    const s = { ...initialState(42), qualityControl: true, workers: 3 };
    const s2 = reducer(s, { type: "runShift" });
    expect(s2.lastCost).toBe(3 * WORKER_COST_PER_SHIFT + QC_COST);
  });

  it("calcOutput returns non-negative good units", () => {
    const { output, defects } = calcOutput(4, 2, "widget", () => 0.5);
    expect(output).toBeGreaterThanOrEqual(0);
    expect(defects).toBeGreaterThanOrEqual(0);
  });

  it("higher machine level produces more output", () => {
    const { output: low } = calcOutput(4, 0, "widget", () => 0.5);
    const { output: high } = calcOutput(4, 4, "widget", () => 0.5);
    expect(high).toBeGreaterThan(low);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 3000 })).toEqual({ score: 100 });
  });

  it("completes all shifts", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_SHIFTS; i++) {
      s = reducer(s, { type: "runShift" });
      s = reducer(s, { type: "nextShift" });
    }
    expect(s.phase).toBe("done");
  });
});
