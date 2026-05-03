import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NineFiveTwoRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NineFiveTwoRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nineFiveTwoRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "nine-five-two-r", title: "Nine Five Two", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-round contract rummy with diminishing card counts.",
  howToPlay: "Nine-Five-Two is a three-round contract rummy variant whose name comes from the meld requirements traditionally used in each round. In this simulator, all three rounds use a single auto-meld engine that finds the best sets and runs in your nine-card hand.\n\nA set is three or more cards of one rank; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five per extra card above three. Cards left outside melds form deadwood — aces one, face cards ten, others pip value — and small bare-hand seeds receive only a tiny consolation.\n\nGoing out — emptying your hand entirely — adds a twenty-five-point clean-finish bonus. Three rounds keep the session short and focused; expected totals run forty to one-twenty. Click 'Auto-score' to evaluate each hand and 'Next' to deal again. Nine-Five-Two rewards seeds where ranks cluster early — three or four matching ranks plus a tight suit run can carry a single hand past sixty points.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, 
  hint: (state: GState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-nine-five-two-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-nine-five-two-r-next"]', pulses: 3 };
    return null;
  },
  component: NineFiveTwoRGame,
};
