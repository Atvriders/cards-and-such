import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageMugginsVarPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-muggins-var",
  title: "Cribbage: Muggins",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Muggins rule: opponent claims missed combinations.",
  howToPlay: "Cribbage: Muggins enforces the cruel rule where opponents may claim points you forgot to peg — every miss costs you those exact points. In this digital adaptation, each of ten rounds you peg random points (1-15) and there is a 30% chance you 'miss' some sub-pegs the CPU then claims. The CPU also pegs each round but rarely misses (10% miss rate due to its careful counting). The result: you'll often watch the CPU pull ahead through your missed pegs alone — a savage simulation of being mugginsed in a packed pub. Total score after ten rounds determines the winner. Muggins is famous for sharpening cribbage skill, with experienced players watching like hawks for missed counts. The variant remains popular in serious league play. Press Peg each round; the muggins penalty is automatic and visible in the round summary. Ramp up your concentration — you'll need it. Final score awards 100 points for a win; the muggins simulation gives the underdog less hope than usual.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
