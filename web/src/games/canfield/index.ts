import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanfieldState, CanfieldAction } from "./state.js";
import { initialState, reducer, isTerminal, makeRulesetPublic } from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Canfield = /* @__PURE__ */ lazy(() => import("./Canfield.js").then((mod) => ({ default: mod.Canfield as unknown as React.ComponentType<unknown> })));
export const canfieldSettings = {} as const;

type CanfieldSettings = SettingsOf<typeof canfieldSettings>;

export const canfieldPlugin: GamePlugin<CanfieldState, CanfieldAction, typeof canfieldSettings> = {
  id: "canfield",
  title: "Canfield",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reserve, foundation, tableau. Foundation starts at a variable rank.",
  howToPlay: `Move all 52 cards to the four foundations to win.

Deal: A 13-card reserve pile sits at top-left (only the top card is playable). The game deals one card face-up to each of the four foundations to establish the starting rank — that rank wraps around (e.g. if 8, foundations run 8–9–10–J–Q–K–A–2–3–4–5–6–7). The four tableau columns each start with one card. Remaining cards form the stock.

Moves: Tableau builds down in alternating colors (same as Klondike). Drag cards or click to auto-move them. Empty tableau columns are immediately and automatically refilled from the reserve. Draw 3 cards at a time from the stock to the waste; the waste top is always playable. Click the stock again when empty to recycle the waste.

Scoring: +5 points for each card moved to a foundation.

Tips: The reserve is your main source of tableau fuel — try to expose deeper reserve cards by clearing tableau columns. Because foundations wrap around, pay attention to what rank you need next; it's easy to block yourself. Prioritize getting all four foundation suits to the same base rank so you can build them in sync.`,
  settings: canfieldSettings,
  initialState: (seed: number, settings: CanfieldSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CanfieldState): HintTarget | null => {
    const ruleset = makeRulesetPublic(state.foundationStartRank);
    const FOUNDATION_IDS = ["f1","f2","f3","f4"];
    // Priority 1: waste -> foundation
    for (const foundId of FOUNDATION_IDS) {
      if (canMove(state.piles, { fromPile: "waste", toPile: foundId, count: 1 }, ruleset)) {
        return { selector: `[data-testid="pile-waste"]`, pulses: 3 };
      }
    }
    // Priority 2: stock has cards — draw.
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    // Priority 3: stock empty but waste non-empty — recycle.
    const waste = state.piles.find((p) => p.id === "waste");
    if (waste && waste.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: Canfield,
};
