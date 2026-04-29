import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageLurchPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-lurch",
  title: "Cribbage: Lurch",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lurch rule: winner doubles if loser hasn't reached 91.",
  howToPlay: "Cribbage: Lurch rewards a runaway win — if the loser fails to peg past 91 by game-end, the winner takes a 'lurch' and doubles their score. Across eight pegging rounds you and the CPU each peg random points (1-12). The race target is 121 but the game stops after eight rounds; whoever has more pegs wins. If the loser hasn't reached 91 the winner's score doubles in the final report — a true bar-pub bonus that drives back-row players to push hard. Press Peg each round; the CPU follows automatically. Watch the peg track; if you're well behind near round 6, the lurch threat looms. The lurch rule turns ordinary wins into outsized triumphs and ordinary losses into double humiliations. Drinks may be doubled too in the original pub etiquette. Pegging is purely dice-driven here; strategy lives in pacing the pubs after a rough round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
