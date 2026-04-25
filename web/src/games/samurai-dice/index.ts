import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SamuraiDiceState, SamuraiDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SamuraiDice } from "./SamuraiDice.js";

export const samuraiDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["6", "8", "10"] as const,
    default: "8",
  },
} as const;

type SamuraiDiceSettingsType = SettingsOf<typeof samuraiDiceSettings>;

export const samuraiDicePlugin: GamePlugin<SamuraiDiceState, SamuraiDiceAction, typeof samuraiDiceSettings> = {
  id: "samurai-dice",
  title: "Samurai Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Earn honor points by rolling bushido combos across 8 rounds of samurai scorecard dice!",
  howToPlay: `Samurai Dice is a Japanese-themed scorecard game played over 6, 8, or 10 rounds with five dice. Each round grants up to three rolls — click dice to hold them between rolls, then assign your result to one of eight bushido-themed categories.

Honor scores the highest face value × 3 regardless of pattern. Bushido awards 100 for five of a kind — the ultimate achievement. Katana scores 70 for a full straight (1–2–3–4–5 or 2–3–4–5–6). Wakizashi scores 40 for any four consecutive values. Dojo scores four of a kind at face value × 20. Clan scores three of a kind at face value × 10. Seppuku scores 35 for a full house (three of a kind plus a pair). Ronin is the flexible chance category — it simply sums all five dice.

Each category may only be scored once. If you play fewer rounds than categories, unsettled categories score zero at game end. Pursue Bushido or Katana when the dice cooperate, but Ronin is always worth holding in reserve. A samurai adapts to circumstances — so should you!`,
  settings: samuraiDiceSettings,
  initialState: (seed: number, settings: SamuraiDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SamuraiDice,
};
