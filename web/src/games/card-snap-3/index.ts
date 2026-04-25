import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSnap3State, CardSnap3Action, CardSnap3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSnap3 } from "./Game.js";

const cardSnap3Settings = {
  rounds: { kind: "enum" as const, label: "Cards", options: ["15", "30"] as const, default: "15" as const },
} as const;

type CardSnap3SettingsType = SettingsOf<typeof cardSnap3Settings>;

export const cardSnap3Plugin: GamePlugin<CardSnap3State, CardSnap3Action, typeof cardSnap3Settings> = {
  id: "card-snap-3",
  title: "Card Snap 3",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip cards one by one and hit SNAP the moment three cards of the same rank appear. Wrong snaps cost points!",
  howToPlay: `Card Snap 3 is a fast reaction card game. Flip cards one at a time using the Flip button and watch the last three revealed cards displayed on screen.

Your goal is to hit the SNAP button the moment three cards in a row share the same rank — for example three Jacks or three 4s in a row. A correct snap earns +50 points.

If you snap when there is no triple, you lose 20 points — so stay sharp! The SNAP button glows red when a triple is detected.

Flip through the chosen number of cards (15 or 30). Your final score is displayed at the end along with how many correct snaps and false alarms you had.

The suits do not matter, only the ranks. With only four cards of each rank in the deck, triples are rare — keep your eyes peeled and react fast. Use Settings to choose 15 or 30 cards. Aim for a perfect snap score!`,
  settings: cardSnap3Settings,
  initialState: (seed: number, settings: CardSnap3SettingsType) => initialState(seed, settings as CardSnap3Settings),
  reducer,
  isTerminal,
  component: CardSnap3,
};
