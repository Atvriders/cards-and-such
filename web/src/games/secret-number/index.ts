import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SecretNumberState, SecretNumberAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SecretNumber } from "./SecretNumber.js";

export const secretNumberSettings = {
  range: {
    kind: "enum" as const,
    label: "Range",
    options: ["100", "1000", "10000"] as const,
    default: "100",
  },
  lies: {
    kind: "enum" as const,
    label: "Bot Lies",
    options: ["0", "1", "2"] as const,
    default: "1",
  },
} as const;

type SecretNumberSettingsType = SettingsOf<typeof secretNumberSettings>;

export const secretNumberPlugin: GamePlugin<SecretNumberState, SecretNumberAction, typeof secretNumberSettings> = {
  id: "secret-number",
  title: "Secret Number",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Higher or lower — but the bot lies sometimes.",
  howToPlay: `The bot secretly picks a number within the chosen range (1–100, 1–1000, or 1–10,000). Your goal is to guess it within a limited number of attempts.

After each guess the bot responds "Higher" (the secret is above your guess), "Lower" (it is below), or "Correct." However, if the "Bot Lies" setting is 1 or 2, the bot is allowed to send one or two false hints during the game — flipping "higher" to "lower" or vice versa at a random moment.

You can detect lies by watching for contradictions: if you guessed 400 and were told "higher," then guessed 700 and were told "lower," the secret is between 401 and 699. If a later hint contradicts that range, a lie was involved.

Strategy with lies: use a wider bracketing approach instead of pure binary search. Keep a consistent range based on all hints and watch for impossible contradictions. When lies run out (shown in the history after game over), all remaining hints are truthful.

Settings: Range changes the search space; Bot Lies sets how many false hints the bot can give.

Scoring: win score = (remaining attempts + 1) × 100. Failure scores 0.`,
  settings: secretNumberSettings,
  initialState: (seed: number, settings: SecretNumberSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SecretNumber,
};
