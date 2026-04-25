import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CosmicDiceState, CosmicDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CosmicDice } from "./CosmicDice.js";

export const cosmicDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type CosmicDiceSettingsType = SettingsOf<typeof cosmicDiceSettings>;

export const cosmicDicePlugin: GamePlugin<CosmicDiceState, CosmicDiceAction, typeof cosmicDiceSettings> = {
  id: "cosmic-dice",
  title: "Cosmic Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice and score cosmic combos — nebulae, supernovae, black holes, and more!",
  howToPlay: `Cosmic Dice is a space-themed scoring dice game played over 5, 7, or 10 rounds. Each round you have up to three rolls of five dice.

After the first roll, click any dice to keep them (they glow when locked), then re-roll the rest. After up to three rolls you must assign your dice to one of seven cosmic categories — each can only be used once across the whole game.

Categories: Nebula scores three of a kind at face value × 30. Supernova scores four of a kind at face value × 60. Black Hole scores five of a kind (500 points). Galaxy scores 150 if all five dice show different faces. Comet scores 200 for a five-dice sequence (1–5 or 2–6). Asteroid scores the sum of all five dice. Cosmos scores 100 for a full house (three of a kind plus a pair).

If you have fewer rounds than categories, unused categories score zero. Scoring a high-value combo like Black Hole or Comet will rocket your total — but sometimes taking a safe Asteroid score keeps your total competitive. Aim to fill every category by game end for the best result!`,
  settings: cosmicDiceSettings,
  initialState: (seed: number, settings: CosmicDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CosmicDice,
};
