import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesWestCountryPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "skittles-west-country",
  title: "Skittles (West Country)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Somerset/Wiltshire variant; three balls per turn.",
  howToPlay: "Skittles (West Country) lets you throw three balls per turn at the West Country diamond formation. Across eight turns press Throw to release all three balls; the total pins knocked is the sum of three random rolls. Possible per-ball scores range 0-9 with bias toward 1-3 pins per ball. A perfect turn would be 27 (three strikes); typical turns yield 8-15. The CPU throws three balls simultaneously. Total pins after eight turns wins. The West Country variant is the basis of skittles leagues in Somerset and Wiltshire, with weekend tournaments drawing dozens of pubs into competition. Three balls per turn means more action per round than Long Alley's single throw. Press Throw to roll all three in one click; the total appears immediately. Final scoreboard awards 100 points for the win, 25 for a tie. The variant feels generous early, but multiple poor turns add up. Pub etiquette: cheer your opponent's strikes; jeer your own missed shots.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
