import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartaExplorerState, CartaExplorerAction, CartaExplorerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartaExplorerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cartaExplorerPlugin: GamePlugin<CartaExplorerState, CartaExplorerAction, typeof settings> = {
  id: "carta-explorer",
  title: "Carta Explorer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — explore a world built from cards as you draw.",
  howToPlay: "Carta Explorer is a solo journaling homage to the Carta system by Peach Garden Games, a framework for solo card-driven exploration games. The original uses a 5x5 grid of facedown playing cards as a procedurally-revealed map.\n\nAcross ten entries you choose how to explore: which way to flip, what to record, when to risk a deeper dive. Each prompt offers four choices A-D, assigning a base reward plus 0-20 of variance from the seeded oracle.\n\nThe original Carta is a meta-system — many games are built on it, with different themes from underwater ruins to apartment buildings. This homage focuses on the universal exploration ethos: a world unfolds one card at a time, and your choices shape what you bring back.\n\nImagine the soft snap of a card flipping over, the catch in your throat at what's revealed. Some cards are treasure. Some are nothing. All are part of the map you're drawing.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CartaExplorerSettings),
  reducer, isTerminal, component: CartaExplorerGame,
};
