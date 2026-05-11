import { describe, it, expect } from "vitest";
import { threedTunnelRunnerPlugin } from "./index.js";
import type { ThreedTunnelRunnerState } from "./state.js";

const S = { dummy: false } as never;

describe("3d-tunnel-runner plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(threedTunnelRunnerPlugin.id).toBe("3d-tunnel-runner");
    expect(threedTunnelRunnerPlugin.title).toBe("3D Tunnel Runner");
    expect(threedTunnelRunnerPlugin.category).toBe("arcade");
    expect(threedTunnelRunnerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof threedTunnelRunnerPlugin.description).toBe("string");
    expect(threedTunnelRunnerPlugin.description.length).toBeGreaterThan(0);
    expect(typeof threedTunnelRunnerPlugin.howToPlay).toBe("string");
    expect(threedTunnelRunnerPlugin.settings).toBeDefined();
    expect(typeof threedTunnelRunnerPlugin.settings).toBe("object");
    expect(typeof threedTunnelRunnerPlugin.initialState).toBe("function");
    expect(typeof threedTunnelRunnerPlugin.reducer).toBe("function");
    expect(typeof threedTunnelRunnerPlugin.isTerminal).toBe("function");
    expect(threedTunnelRunnerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = threedTunnelRunnerPlugin.initialState(42, S);
    const b = threedTunnelRunnerPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.playerLane).toBe(1);
    expect(a.obstacles).toEqual([]);
    expect(a.score).toBe(0);
    expect(threedTunnelRunnerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null after phase becomes done", () => {
    expect(typeof threedTunnelRunnerPlugin.hint).toBe("function");
    const state = threedTunnelRunnerPlugin.initialState(7, S);
    const playingHint = threedTunnelRunnerPlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(typeof playingHint!.selector).toBe("string");
    expect(playingHint!.selector.length).toBeGreaterThan(0);
    expect(playingHint!.selector).toBe('[data-testid="hint-target-3d-tunnel-runner-primary"]');
    expect(playingHint!.pulses).toBe(3);

    const doneState: ThreedTunnelRunnerState = { ...state, phase: "done" };
    expect(threedTunnelRunnerPlugin.hint!(doneState)).toBeNull();
    expect(threedTunnelRunnerPlugin.isTerminal(doneState)).toEqual({ score: state.score });
  });
});
