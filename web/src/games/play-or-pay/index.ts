import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type PlayOrPayState, type PlayOrPayAction } from "./state.js";
import { PlayOrPayGame } from "./Game.js";

export const playOrPaySettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
  startChips: { kind: "enum" as const, label: "Starting Chips", options: ["10", "15", "20"] as const, default: "10" as const },
} as const;

export const playOrPayPlugin: GamePlugin<PlayOrPayState, PlayOrPayAction, typeof playOrPaySettings> = {
  id: "play-or-pay",
  title: "Play or Pay",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play a card to extend a suit sequence — or pay a chip to the pot!",
  howToPlay: `Play or Pay is a classic Victorian-era card game for 2-4 players. Each player starts with a hand of cards and a stack of chips. There is a shared pot in the centre of the table.

The goal is to be the first player to empty their hand. Cards are played to four suit sequences on the table — each suit builds from Ace (1) through to King (13) in order. On your turn, play one card that continues any available sequence (it must be the exact next rank for that suit). If you have no playable card, you must pay one chip to the pot.

The first player to empty their hand wins and collects all the chips in the pot. Bots play automatically when it is their turn.

Cards highlighted in green in your hand are currently playable. The suit tracker shows which rank is needed next for each suit. Conserve your chips when you can — holding key cards like Aces can block entire suit sequences, but you may not be able to play them immediately.

Score = (your chips × 10) + 200 for a win. If you lose, score = remaining chips × 5.`,
  settings: playOrPaySettings,
  initialState,
  reducer,
  isTerminal,
  component: PlayOrPayGame,
};
