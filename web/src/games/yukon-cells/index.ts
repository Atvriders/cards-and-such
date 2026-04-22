import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { YukonCellsState, YukonCellsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YukonCells } from "./YukonCells.js";

export const yukonCellsSettings = {} as const;

export const yukonCellsPlugin: GamePlugin<YukonCellsState, YukonCellsAction, typeof yukonCellsSettings> = {
  id: "yukon-cells",
  title: "Yukon Cells",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yukon with 4 free cells — move any face-up group, park singles in cells.",
  howToPlay: `Yukon Cells combines the freewheeling movement of Yukon with the tactical storage of FreeCell. Your goal is to build all four foundations from Ace to King in suit.

Deal: Seven tableau columns receive all 52 cards in the classic Yukon arrangement — column 1 has 1 card; columns 2 through 7 have increasingly more, with several face-down cards at the bottom and multiple face-up cards on top. Face-down cards are automatically revealed as you move the cards above them.

Tableau: Build columns downward in alternating colors. The signature Yukon rule applies: you may pick up any face-up card and everything above it as a group, even if those cards don't form a valid sequence. Only the bottom card of your moving group needs to land legally on the target. Empty columns accept only Kings.

Free Cells: Four free cells sit above the tableau. Each holds one card. Use them to temporarily store a blocking card so you can access what's beneath it. Single cards only — no groups.

Foundations: Place Aces and build each suit up through King. Use Auto-move to quickly send all safe cards to foundations.

Scoring: +10 per card moved to a foundation.

Tips: The free cells give you crucial extra flexibility over standard Yukon, but they fill up fast. Prioritize revealing face-down cards early.`,
  settings: yukonCellsSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: YukonCells,
};
