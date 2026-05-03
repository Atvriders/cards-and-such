import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OklahomaGinRState, OklahomaGinRAction, OklahomaGinRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { detectMelds } from "../_shared/rummy-engine.js";
const OklahomaGinRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OklahomaGinRGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "hard" as const },
} as const;
type S = SettingsOf<typeof settings>;

const SUIT_ORDER: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };

export const oklahomaGinRPlugin: GamePlugin<OklahomaGinRState, OklahomaGinRAction, typeof settings> = {
  id: "oklahoma-gin-r",
  title: "Oklahoma Gin",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gin variant where the first upcard sets the knock limit.",
  howToPlay: "Oklahoma Gin is Gin Rummy with a twist: the first discard determines the maximum knock value. Draw from stock or discard, form sets and runs, and knock when deadwood is at or below the limit. Gin (zero deadwood) earns a 25-point bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OklahomaGinRSettings),
  reducer,
  isTerminal,
  hint: (state: OklahomaGinRState): HintTarget | null => {
    if (state.phase === "done" || state.phase === "bot-turn") return null;

    // Sorted hand mirrors RummyView's render order so testid indexes align.
    const sortedHand = [...state.playerHand].sort((a, b) => {
      const sd = (SUIT_ORDER[a.suit] ?? 0) - (SUIT_ORDER[b.suit] ?? 0);
      return sd !== 0 ? sd : a.rank - b.rank;
    });

    if (state.phase === "player-discard") {
      // 1) Knock if eligible.
      const { deadwoodValue } = detectMelds(state.playerHand);
      if (deadwoodValue <= state.cfg.knockLimit) {
        return { selector: '[data-testid="hint-target-rummy-knock"]', pulses: 3 };
      }
      // 2) First card whose removal yields an additional meld (i.e. discard
      //    leaves the rest of the hand with more melded cards than now).
      const baseMelded = detectMelds(state.playerHand).melds.flat().length;
      for (let i = 0; i < sortedHand.length; i++) {
        const c = sortedHand[i]!;
        const without = state.playerHand.filter(x => x.id !== c.id);
        const after = detectMelds(without).melds.flat().length;
        if (after > baseMelded) {
          return { selector: `[data-testid="hint-target-rummy-card-${i}"]`, pulses: 3 };
        }
      }
      // Fallback: pulse stock-area as a generic "no obvious move" cue.
      return { selector: '[data-testid="hint-target-rummy-stock"]', pulses: 3 };
    }

    // player-draw: prefer discard if it would extend a meld.
    const top = state.discardPile[state.discardPile.length - 1];
    if (top) {
      const before = detectMelds(state.playerHand).deadwoodValue;
      const after = detectMelds([...state.playerHand, top]).deadwoodValue;
      if (after < before) {
        return { selector: '[data-testid="hint-target-rummy-discard"]', pulses: 3 };
      }
    }
    return { selector: '[data-testid="hint-target-rummy-stock"]', pulses: 3 };
  },
  component: OklahomaGinRGame,
};
