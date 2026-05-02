import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { YukonCellsState, YukonCellsAction } from "./state.js";
import { initialState, reducer, isTerminal, yukonCellsRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
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
  hint: (state: YukonCellsState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, yukonCellsRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: YukonCells,
};
