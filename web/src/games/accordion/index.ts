import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AccordionState, AccordionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Accordion } from "./Accordion.js";

export const accordionSettings = {
  allowJump3: {
    kind: "boolean" as const,
    label: "Allow 3-Away Jumps",
    default: true,
  },
} as const;

export const accordionPlugin: GamePlugin<AccordionState, AccordionAction, typeof accordionSettings> = {
  id: "accordion",
  title: "Accordion",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compress the deck into one pile. Move cards onto neighbors or cards 3 away by matching suit or rank.",
  howToPlay: `All 52 cards are dealt face-up in a row, each forming its own pile. Your goal is to compress the entire row into a single pile by moving cards onto other cards they match.

Moves: Click a card to move it onto the card immediately to its left, or onto the card three positions to its left — but only if the top cards match in either suit or rank. When a card moves, any pile it sits on top of moves with it. The source position disappears, and the row compacts.

Settings: The "Allow 3-Away Jumps" option is on by default — this is standard Accordion. Turning it off limits moves to adjacent cards only, making the game far harder to reduce.

Winning: Compress all 52 cards into a single pile. This is rare and mostly luck-driven — even optimal play rarely wins. The goal is typically to minimize the number of remaining piles.

Strategy: Look for chain moves where one compression unlocks another. Prioritize 3-away jumps when they set up follow-up moves. Keep an eye on suits — same-suit moves are often more powerful since they apply regardless of rank. Don't always take the first available move; scan the whole row first.`,
  settings: accordionSettings,
  initialState,
  reducer,
  isTerminal,
  component: Accordion,
};
