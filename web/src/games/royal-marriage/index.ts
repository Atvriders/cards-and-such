import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RoyalMarriageState, RoyalMarriageAction, RoyalMarriageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RoyalMarriage } from "./RoyalMarriage.js";

export const royalMarriageSettings = {} as const;

export const royalMarriagePlugin: GamePlugin<RoyalMarriageState, RoyalMarriageAction, typeof royalMarriageSettings> = {
  id: "royal-marriage",
  title: "Royal Marriage",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bring the King and Queen of Hearts together by discarding cards between matching pairs.",
  howToPlay: `Royal Marriage is a whimsical solitaire with a story: the King of Hearts and Queen of Hearts must be united. The King starts alone at the left of a growing row; the Queen of Hearts is the very last card in the deck and will only appear when you deal to the end.

Deal cards one at a time from the stock to the right end of the row. After each deal (or at any time), look for two cards in the row that share the same suit or the same rank and have exactly one or two cards between them. Click both such cards to discard the card(s) sandwiched between them.

Keep dealing and discarding until the stock is empty. If the King and Queen of Hearts end up side-by-side with all other cards removed, you win.

Strategy: try to clear cards near the King early to keep him from being buried. Pay attention to suits — pairs of hearts, spades, clubs, and diamonds appear frequently and let you chain multiple discards. Ranks can also match; two Tens sandwich any two cards between them just as validly as two Clubs.

Score is based on how many cards you successfully discard between matching pairs. A perfect game scores 250 points.`,
  settings: royalMarriageSettings,
  initialState: (seed: number) => initialState(seed, {} as RoyalMarriageSettings),
  reducer,
  isTerminal,
  component: RoyalMarriage,
};
