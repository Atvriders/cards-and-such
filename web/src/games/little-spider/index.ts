import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { LittleSpiderState, LittleSpiderAction, LittleSpiderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LittleSpider } from "./LittleSpider.js";

export const littleSpiderSettings = {} as const;

export const littleSpiderPlugin: GamePlugin<LittleSpiderState, LittleSpiderAction, typeof littleSpiderSettings> = {
  id: "little-spider",
  title: "Little Spider",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deal eight rows across eight columns and build two suits up and two suits down.",
  howToPlay: `Little Spider is a unique solitaire game that combines dealing with real-time building — two foundations grow upward while two grow downward.

Setup: Eight empty tableau columns are arranged in a row. All 52 cards sit in the stock. Four foundations wait above: Hearts and Diamonds build up from Ace to King; Spades and Clubs build down from King to Ace.

Dealing: Click Deal to send one card face-up to each of the eight tableau columns. After a deal, you may reorganize the tableau by moving cards between columns — a card may move onto another if their ranks are adjacent (one apart, any suit, with Ace-King wrapping). Only one card may be moved at a time, and empty columns cannot receive cards from the tableau.

Foundations: Move any tableau top card directly onto the matching foundation when the rank is correct. Red foundations accept the next ascending rank; black foundations accept the next descending rank.

Play alternates: deal a row, then play as many moves as you wish before dealing the next row.

Goal: Fill all four foundations (13 cards each) to win.

Tip: During early rows, prioritize freeing Aces to start red foundations and Kings to start black ones. Managing both directions simultaneously requires careful planning.`,
  settings: littleSpiderSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: LittleSpiderState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-little-spider-primary"]', pulses: 3 };
  },
  component: LittleSpider,
};
