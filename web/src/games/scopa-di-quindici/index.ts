import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScopaDiQuindiciGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const scopaDiQuindiciPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "scopa-di-quindici",
  title: "Scopa di Quindici",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scopa variant capturing by sums of fifteen rather than matching.",
  howToPlay: "Scopa di Quindici (Fifteen) is the variant where captures are made by summing the played card and table cards to exactly fifteen, rather than by direct matching. This simulator adapts the rhythm to a 1v1 trick-taking duel: thirteen tricks are played with no trump suit.\n\nFollow the led suit if you can; otherwise your card cannot win this trick. Highest card of the led suit wins — ace high, then king down to two. The bot plays defensively, capturing cheaply and dumping low cards when out of options.\n\nWin if you take eight or more of thirteen tricks. Scopa di Quindici's signature 'sum-to-fifteen' capture mechanic is abstracted here into pure trick-count scoring, but the spirit of careful card management is preserved: hold high cards for the right moments, watch which suits the bot tends to lead, and time your strongest plays to overwhelm contested suits. Click any legal card to play; the bot responds immediately.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: ScopaDiQuindiciGame,
};
