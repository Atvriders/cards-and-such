import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceFantasyFootballDraftState, DiceFantasyFootballDraftAction, DiceFantasyFootballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFantasyFootballDraftGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceFantasyFootballDraftGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFantasyFootballDraftPlugin: GamePlugin<DiceFantasyFootballDraftState, DiceFantasyFootballDraftAction, typeof settings> = {
  id: "dice-fantasy-football-draft",
  title: "Fantasy Football Draft",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Fantasy Football Draft: draft 8 picks; build the highest-rated roster.',
  howToPlay: 'Fantasy Football Draft is a real, dice-driven simulation. Fantasy Football Draft: draft 8 picks; build the highest-rated roster.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFantasyFootballDraftSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFantasyFootballDraftState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-fantasy-football-draft-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-fantasy-football-draft-next"]', pulses: 3 };
    return null;
  },
  component: DiceFantasyFootballDraftGame,
};
