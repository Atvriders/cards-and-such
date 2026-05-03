import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpotItClassicState, SpotItClassicAction, SpotItClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpotItClassicGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpotItClassicGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spotItClassicPlugin: GamePlugin<SpotItClassicState, SpotItClassicAction, typeof settings> = {
  id: "spot-it-classic", title: "Spot It Classic", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the symbol that appears on both cards.",
  howToPlay: "Spot It Classic captures the Dobble core: every two cards share exactly one symbol, and your job is to spot it fastest. Each round shows two illustrated three-symbol cards plus four candidate symbols. Pick the symbol that appears on both cards — correct answer scores ten points, wrongs zero. The shared-symbol set draws from sixteen icons including stars, suits, geometric shapes, and weather marks. Twelve rounds total; maximum score one hundred twenty points. The original Dobble uses 55 cards with the projective-plane property where any two share exactly one symbol — this digital adaptation simulates that mathematical structure with random sampling. Children love how every card pairs with every other; adults love the speed pressure. Solid Spot-It players hit 100+; first-timers 50-80. Hit Submit to lock your call and Next to advance. There is no time bonus — accuracy alone determines your score across all twelve rounds played end to end.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpotItClassicSettings),
  reducer, isTerminal, hint: (state: SpotItClassicState): HintTarget | null => state.phase === "playing" ? { selector: '.spotcls-cards', pulses: 3 } : null, component: SpotItClassicGame,
};
