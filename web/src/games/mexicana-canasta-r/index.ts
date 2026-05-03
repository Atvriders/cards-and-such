import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MexicanaCanastaRState, MexicanaCanastaRAction, MexicanaCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MexicanaCanastaRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MexicanaCanastaRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const mexicanaCanastaRPlugin: GamePlugin<MexicanaCanastaRState, MexicanaCanastaRAction, typeof settings> = {
  id: "mexicana-canasta-r", title: "Mexicana", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant with bonus hands and aggressive play.",
  howToPlay: "Mexicana is a Canasta variant featuring extra bonus hands and faster-paced melding, often credited as a Mexican-flavoured offshoot of the Argentinean original. The pace rewards aggressive early commitment.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into sets and runs each round. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more of a rank; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you receive a small consolation. Going out earns thirty bonus. A seven-card canasta-equivalent pays forty-two as a single chunk.\n\nExpected score across five rounds is sixty to one hundred and five. Mexicana's quick-melding flavour is well captured by the auto-meld engine — the fastest path to a high score is two melds per round consistently, with one long meld somewhere across the five-round set.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MexicanaCanastaRSettings),
  reducer, isTerminal, 
  hint: (state: MexicanaCanastaRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-mexicana-canasta-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-mexicana-canasta-r-next"]', pulses: 3 };
    return null;
  },
  component: MexicanaCanastaRGame,
};
