import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrenchTarotState, FrenchTarotAction, FrenchTarotSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FrenchTarotGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const frenchTarotPlugin: GamePlugin<FrenchTarotState, FrenchTarotAction, typeof settings> = {
  id: "french-tarot", title: "French Tarot", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "78-card French Tarot trick game with the dog and excuse card.",
  howToPlay: "French Tarot is the classic seventy-eight card trick-taking game using the standard French Tarot deck of four suits plus twenty-one trump atouts and the special excuse card (le fou). The dealer declares a contract — petite, garde, garde sans, or garde contre — and aims to capture a target number of points based on holding bouts (key cards: the one of trump, twenty-one of trump, and the excuse). The chien (dog) of six face-down cards is added to the declarer's hand for petite and garde contracts. In this one-on-one duel, click Play Round to bid and play across six hands. Strategy: bid low contracts (petite) unless you have multiple bouts. The excuse never loses to a trick, so save it for the final lead. Aim for at least two made contracts. A score above three hundred fifty across the match is strong.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FrenchTarotSettings),
  reducer, isTerminal, component: FrenchTarotGame,
};
