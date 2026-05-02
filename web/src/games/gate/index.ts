import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { GateState, GateAction } from "./state.js";
import { initialState, reducer, isTerminal, gateRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Gate } from "./Gate.js";

export const gateSettings = {} as const;

export const gatePlugin: GamePlugin<GateState, GateAction, typeof gateSettings> = {
  id: "gate",
  title: "Gate",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-cascade solitaire with 2 free cells. Build foundations Ace to King.",
  howToPlay: `Gate is a compact solitaire game combining a five-column tableau with two reserve cells. Your goal is to move all 52 cards onto the four foundations, building each suit up from Ace to King.

Deal: Five cascades each receive 7 face-up cards (35 total). Two free cells each start with 1 card. The remaining 15 cards sit in a stock pile for reference — in this variant, all playable cards are already in the tableau or cells.

Free Cells: The two reserve cells act like free cells — each holds one card. You can move a card there temporarily to unblock a useful card beneath it.

Tableau: Cascades build downward in alternating colors (red on black, or black on red). You may move valid descending alternating-color sequences together. An empty cascade accepts any single card or valid sequence.

Foundations: Each foundation starts empty. Move an Ace to start a foundation, then continue building up by suit through King.

Scoring: +10 per card moved to a foundation. Use Auto-move to send all safe cards to foundations at once.

Tips: The tight layout makes planning critical. Identify where your Aces are early. Use free cells sparingly to avoid gridlock.`,
  settings: gateSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: GateState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "c1", "c2", "c3", "c4", "c5"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, gateRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: Gate,
};
