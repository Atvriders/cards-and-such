import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ClassicCanastaRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ClassicCanastaRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const classicCanastaRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "classic-canasta-r", title: "Classic Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Original Argentine partnership canasta with seven-card meld bonuses.",
  howToPlay: "Classic Canasta is the original Argentine partnership melding game from the late 1940s. In this solo variant, you draw an 11-card hand each round and the engine auto-melds your sets. Sets of three or four are worth twenty points base; growing them toward a full canasta of seven cards adds bonus points. Five rounds are played.\n\nEach round, the engine identifies the best automatic combinations: sets of equal rank (three or more) and runs in suit (three or more). Cards remaining outside any meld form deadwood; their pip values add up against you. Aces count one, face cards ten, others their face value.\n\nClassic scoring rewards melding aggressively: each meld gives twenty plus five for every extra card past three. Going out (no deadwood) adds a twenty-five-point Canasta-out bonus. Across five hands, expect roughly ninety to two hundred points. The classic feel of melding under pressure rewards seeds with rank-clustered hands and punishes scattered draws.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-classic-canasta-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-classic-canasta-r-next"]', pulses: 3 };
    return null;
  },
  component: ClassicCanastaRGame,
};
