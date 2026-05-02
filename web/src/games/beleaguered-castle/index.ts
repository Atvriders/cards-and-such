import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { BeleagueredCastleState, BeleagueredCastleAction } from "./state.js";
import { initialState, reducer, isTerminal, beleagueredRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { BeleagueredCastle } from "./BeleagueredCastle.js";

export const beleagueredCastleSettings = {} as const;

export const beleagueredCastlePlugin: GamePlugin<BeleagueredCastleState, BeleagueredCastleAction, typeof beleagueredCastleSettings> = {
  id: "beleaguered-castle",
  title: "Beleaguered Castle",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Foundations pre-loaded with Aces. Build them up while dismantling the siege of tableau rows.",
  howToPlay: `All four Aces are placed on the foundations at the start. The remaining 48 cards are dealt face-up into eight tableau rows of six cards each. Your goal is to build all four foundations from Ace up to King by suit.

Moves: Only the rightmost card in each tableau row can be moved. You may move it to a foundation (building up same-suit from the current top), or onto another tableau row (building down by rank regardless of suit). Empty rows accept any single card.

Strategy: Unlike FreeCell, there are no free cells — every move must go to a foundation or to the end of a tableau row. This severely limits your options. Focus on uncovering the cards that are needed for foundation builds. Creating empty rows is powerful: they act as temporary parking spaces. Plan several moves ahead because it is easy to lock yourself into dead ends.

Winning requires moving all 52 cards to the four foundations. The game is won when each foundation shows a King on top. Beleaguered Castle is challenging — most deals require careful sequencing to avoid blocking key cards behind impassable stacks.`,
  settings: beleagueredCastleSettings,
  initialState: (seed) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: BeleagueredCastleState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, beleagueredRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: BeleagueredCastle,
};
