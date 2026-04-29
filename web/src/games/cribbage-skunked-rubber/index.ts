import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageSkunkedRubberPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "cribbage-skunked-rubber",
  title: "Cribbage: Skunked Rubber",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-rubber match with double loss for skunked games.",
  howToPlay: "Cribbage: Skunked Rubber is a three-game match where a skunk in any rubber doubles the winner's tally — best of three with skunk amplification. Each rubber is a quick five-round peg race; you and the CPU peg random points (1-15). After three rubbers the side with more rubber-wins takes the match. A skunk (loser below 61 in any rubber) doubles that rubber's score for the winner; double skunks (below 31) quadruple it. The match score is the sum of all three rubber scores. Rubber matches are central to British league cribbage where Saturday-night pub leagues schedule three-rubber rounds throughout the season. The skunk modifier sharpens otherwise mild peg-races into high-stakes dramas. Press Peg each round — the action moves quickly and three full rubbers complete in a couple of minutes. Final scoreboard tallies match wins and bonus skunks. The original tournament rule has many regional spellings; the version here uses the most common pub-British template.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
