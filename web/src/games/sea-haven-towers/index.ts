import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SeaHavenTowersState, SeaHavenTowersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeaHavenTowers } from "./SeaHavenTowers.js";

export const seaHavenTowersSettings = {} as const;

export const seaHavenTowersPlugin: GamePlugin<SeaHavenTowersState, SeaHavenTowersAction, typeof seaHavenTowersSettings> = {
  id: "sea-haven-towers",
  title: "Sea Haven Towers",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A FreeCell-like solitaire where tableau builds are same-suit descending.",
  howToPlay: `Sea Haven Towers (also called Towers) is a cousin to FreeCell. The goal is to move all 52 cards to the four foundation piles, built up from Ace to King in suit.

Deal: 52 cards are spread across 10 tableau columns of 5 cards each. Two remaining cards start in the reserve cells. There are four reserve cells (towers) at the top-left and four foundation slots at the top-right.

Moves: Only single cards move at a time. On the tableau you may place a card on another card only if they share the same suit and the card you are placing is exactly one rank lower. For example the 9 of spades goes onto the 10 of spades. Empty tableau columns accept any card. Reserve cells hold any single card.

Strategy: The same-suit constraint makes Sea Haven harder than FreeCell. Plan carefully before blocking a cell. Try to sequence same-suit runs together so you can chain foundation builds. Clearing an entire column gives you a valuable free space.

Win condition: All four foundations built Ace through King by suit.`,
  settings: seaHavenTowersSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: SeaHavenTowers,
};
