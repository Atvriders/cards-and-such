import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DaifugoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DaifugoGame } from "./Game.js";

export const daifugoSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type DaifugoAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const daifugoPlugin: GamePlugin<DaifugoState, DaifugoAction, typeof daifugoSettings> = {
  id: "daifugo",
  title: "Daifugo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese shedding game. Beat the last play to climb the social ladder from Daihinmin to Daifugo.",
  howToPlay: `Daifugo (Great Millionaire) is a classic Japanese climbing card game for 4 players. You play against three bots, racing to shed all your cards and become the Daifugo.

Setup: all 52 cards are dealt evenly (13 per player). The player holding the 3 of Clubs leads the first round.

Card ranking: 3 is lowest, rising 4-5-6-7-8-9-10-J-Q-K-A, with 2 as the highest. Suits do not break ties.

Legal plays: lead any set of cards of the same rank (one, two, three, or four). Other players must play the same number of cards with a strictly higher rank, or pass.

Passing: once all other players pass consecutively, the last player to play leads a new round with any combination.

Social ranks: the first to empty their hand earns the title Daifugo (Great Millionaire, score 100). Second place is Fugo (60), third is Hinmin (30), and last is Daihinmin (Great Pauper, 0).

Strategy: save your 2s and Aces for when opponents play high. Try to control the lead by playing mid-rank cards early.`,
  settings: daifugoSettings,
  initialState,
  reducer,
  isTerminal,
  component: DaifugoGame,
};
