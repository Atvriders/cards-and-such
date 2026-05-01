import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConcentrationCardsState, ConcentrationCardsAction, ConcentrationCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConcentrationCardsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const concentrationCardsPlugin: GamePlugin<ConcentrationCardsState, ConcentrationCardsAction, typeof settings> = {
  id: "concentration-cards", title: "Concentration", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic memory pair-finder. Flip two, find the match.",
  howToPlay: "Concentration — also called Memory — is the classic face-down pair-finding card game. Sixteen cards are shuffled face-down in a 4x4 grid. Each card has a hidden symbol (one of eight) and every symbol appears exactly twice.\n\nClick a card to flip it. Click a second card. If both symbols match, the pair stays revealed and you score 12 points. If they do not match, both cards flip back after a moment and you must remember their positions for next time. Any flipped pair counts as one attempt regardless of match.\n\nClear all eight pairs to finish. Find every pair without a single miss (8 attempts exactly) and a perfect-run bonus of 30 points is added. With perfect play the maximum score is 126.\n\nUse the visible symbols of revealed misses to plan your next pair — the trick is mental position memory. Quick, focused, and a calm test of attention.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConcentrationCardsSettings),
  reducer, isTerminal, component: ConcentrationCardsGame,
};
