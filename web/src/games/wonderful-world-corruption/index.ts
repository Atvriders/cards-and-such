import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WonderfulWorldCorruptionState, WonderfulWorldCorruptionAction, WonderfulWorldCorruptionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WonderfulWorldCorruptionGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wonderfulWorldCorruptionPlugin: GamePlugin<WonderfulWorldCorruptionState, WonderfulWorldCorruptionAction, typeof settings> = {
  id: "wonderful-world-corruption",
  title: "Wonderful World: Corruption",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Corruption-track draft homage.",
  howToPlay: "Wonderful World: Corruption is a homage to Frederic Guerard's expansion that adds corruption-level cards and an ascension path to It's a Wonderful World. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a corruption tier); five earn an additional +15 (an ascension milestone). Pairs of rank earn +5 (a clean recycle); three-of-a-kind +10 (an ascension chain). Raw ranks sum as empire points. Score equals tableau total plus +25 for beating the CPU. Strategy: corruption pushes you toward extreme strategies; commit hard to one suit, even if it costs short-term tempo. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WonderfulWorldCorruptionSettings),
  reducer,
  isTerminal,
  component: WonderfulWorldCorruptionGame,
};
