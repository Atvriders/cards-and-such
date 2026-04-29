import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CockroachBluffState, CockroachBluffAction, CockroachBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CockroachBluffGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cockroachBluffPlugin: GamePlugin<CockroachBluffState, CockroachBluffAction, typeof settings> = {
  id: "cockroach-bluff", title: "Cockroach Bluff", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Kakerlaken Poker (Cockroach Poker) bluff card-game trivia.",
  howToPlay: "Cockroach Bluff (Kakerlaken Poker) is a bluff card game from Drei Magier Spiele where you accuse opponents of holding specific gross-animal cards. Twelve rounds quiz you on card types, rules, and bluff outcomes. Pick from four candidates, ten points each, 120 max. Cockroach Poker was designed by Jacques Zeimet and published in 2004. The deck has eight animal types — cockroach, rat, bat, fly, spider, scorpion, stinkbug, and toad — each appearing eight times. To play a card you announce its identity (truthfully or as a bluff) and pass it face-down. The receiver decides whether to challenge or pass it on. Whoever first collects four of one animal loses. Bluffing strategy is the entire game. Casual players hit 60-80; bluff-game fans hit 100+. Run takes around two minutes. Submit and Next on each round. A short, replayable, and surprisingly tense gateway to the bluff-card-game genre that includes Liar's Dice, BS, Skull, and Coup.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CockroachBluffSettings),
  reducer, isTerminal, component: CockroachBluffGame,
};
