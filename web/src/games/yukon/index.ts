import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YukonState, YukonAction } from "./state.js";
import { initialState, reducer, isTerminal, yukonRuleset } from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Yukon = /* @__PURE__ */ lazy(() => import("./Yukon.js").then((mod) => ({ default: mod.Yukon as unknown as React.ComponentType<unknown> })));
export const yukonSettings = {} as const;

type YukonSettings = SettingsOf<typeof yukonSettings>;

export const yukonPlugin: GamePlugin<YukonState, YukonAction, typeof yukonSettings> = {
  id: "yukon",
  title: "Yukon",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Like Klondike, but move any card (and what's on top) without needing a valid sequence.",
  howToPlay: `Build all four foundations from Ace to King in suit to win. There is no stock or waste — all 52 cards are dealt to seven tableau columns.

Deal: Column 1 receives one face-up card. Columns 2–7 receive progressively more cards; the top several in each column are face-up, but only the top card in column 1 is exposed initially. Hidden (face-down) cards are revealed automatically when the cards above them are moved.

Moves: Tableau builds down in alternating colors — a red card goes on a black card one rank higher. The key Yukon rule: you may pick up any face-up card together with every card resting on top of it, even if those cards don't form a proper sequence. Only the bottom card of your moving group must legally land on the target. Drag a card group or click the lowest card in the group to auto-move.

Foundations accept one card at a time, starting with Aces and building up by suit.

Scoring: +10 per card moved to a foundation. Use Auto-move when confident.

Tips: Expose face-down cards quickly by moving stacks. Empty columns are powerful — only Kings may fill them.`,
  settings: yukonSettings,
  initialState: (seed: number, settings: YukonSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: YukonState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1","f2","f3","f4"];
    const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7"];
    for (const sourceId of TABLEAU_IDS) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, yukonRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Yukon,
};
