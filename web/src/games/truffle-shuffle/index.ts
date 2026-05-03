import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { truffleShuffleState, truffleShuffleAction, truffleShuffleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { truffleShuffleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const truffleShufflePlugin: GamePlugin<truffleShuffleState, truffleShuffleAction, typeof settings> = {
  id: "truffle-shuffle",
  title: "Truffle Shuffle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-flip vegan cheese pairing — match flavour dice to recipe cards.",
  howToPlay: "Truffle Shuffle is a flavour-pairing card-flip game distilled to a 4x4 recipe-card grid. Each cell represents a vegan cheese recipe waiting for the right flavour die to be inscribed.\n\nPress Roll to draw a flavour die (1-6). Click any unmarked recipe cell to fill it with that flavour value, earning 2 points per recipe completed. Twelve flavour rolls per game.\n\nCompleting any row triggers a Flavor Profile bonus of +5, any column a Pairing Pattern bonus of +5, and a fully filled menu (sixteen recipes) the +10 Master Cheesemonger award. Skipping a turn passes cost-free but uses one of your twelve flips.\n\nA balanced flavour-shuffler scores 30-45; a perfectionist who fills the entire grid in twelve goes — impossible by design (you have only twelve flips for sixteen cells) — falls back on completion bonuses for top scores in the high forties.\n\nThe original Truffle Shuffle is a dice-and-card flavour-matching game for 2-6 players; this preserves the recipe-by-recipe filling without the multi-player dynamics.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as truffleShuffleSettings),
  reducer,
  isTerminal, hint: (state: truffleShuffleState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-truffle-shuffle-primary"]', pulses: 3 } : null),
  component: truffleShuffleGame,
};
