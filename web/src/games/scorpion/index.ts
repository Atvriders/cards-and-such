import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScorpionState, ScorpionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Scorpion = /* @__PURE__ */ lazy(() => import("./Scorpion.js").then((mod) => ({ default: mod.Scorpion as unknown as React.ComponentType<unknown> })));
export const scorpionSettings = {} as const;

type ScorpionSettings = SettingsOf<typeof scorpionSettings>;

export const scorpionPlugin: GamePlugin<ScorpionState, ScorpionAction, typeof scorpionSettings> = {
  id: "scorpion",
  title: "Scorpion",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build same-suit K→A sequences in the tableau. No foundation piles.",
  howToPlay: `Complete all four suits by building K-through-Ace sequences in the same suit directly on the tableau. There are no separate foundation piles — a completed sequence is automatically removed.

Deal: Seven columns of seven cards each. The first four columns have three face-down cards at the bottom; the last three columns are fully face-up. Three reserve cards sit off to the side.

Moves: Build tableau columns down in the same suit — a 6♠ plays only on a 7♠. Like Yukon, you may pick up any face-up card (and all cards resting on top of it) even if they don't form a proper sequence — only the bottom card of your group must legally land on the target. Face-down cards are automatically revealed when uncovered.

Reserve: Click "Deal Reserve" once to deal one card face-up to each of the first three columns.

Win: Four complete K-to-Ace same-suit sequences are removed automatically.

Scoring: +100 per completed suit sequence.

Tips: Expose face-down cards as quickly as possible. Empty columns are powerful — use them to reorganize suits. Try to build complete same-suit runs before dealing the reserve.`,
  settings: scorpionSettings,
  initialState: (seed: number, settings: ScorpionSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: ScorpionState): HintTarget | null => {
    // Priority 1: any tableau column whose top two face-up cards form a same-suit descending run.
    const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const id of TABLEAU_IDS) {
      const pile = state.piles.find((p) => p.id === id);
      if (!pile || pile.cards.length < 2) continue;
      const faceUp = pile.faceUpCount ?? 0;
      if (faceUp < 2) continue;
      const top = pile.cards[pile.cards.length - 1]!;
      const below = pile.cards[pile.cards.length - 2]!;
      if (top.suit === below.suit && (below.rank as number) === (top.rank as number) + 1) {
        return { selector: `[data-testid="pile-${id}"]`, pulses: 3 };
      }
    }
    // Priority 2: deal reserve if not yet dealt and reserve still has cards.
    const reserve = state.piles.find((p) => p.id === "reserve");
    const dealt = (state as unknown as { reserveDealt?: boolean }).reserveDealt === true;
    if (!dealt && reserve && reserve.cards.length > 0) {
      return { selector: `[data-testid="pile-reserve"]`, pulses: 3 };
    }
    return null;
  },
  component: Scorpion,
};
