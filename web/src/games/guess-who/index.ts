import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GuessWhoState, GuessWhoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GuessWhoGame } from "./Game.js";

export const guessWhoSettings = {
  dummy: {
    kind: "enum" as const,
    label: "Mode",
    options: ["yes"] as const,
    default: "yes" as const,
  },
} as const;

type GuessWhoSettingsType = SettingsOf<typeof guessWhoSettings>;

export const guessWhoPlugin: GamePlugin<GuessWhoState, GuessWhoAction, typeof guessWhoSettings> = {
  id: "guess-who",
  title: "Guess Who",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ask yes/no questions to identify the bot's secret character from 20 faces!",
  howToPlay: `Guess Who is a classic deduction game for 2 players. You and the bot each secretly pick one of 20 unique characters. Your goal is to figure out which character the bot is hiding before the bot figures out yours!

On your turn, choose a yes/no question from the list — for example "Does your character have blue eyes?" or "Is your character wearing a hat?" The bot answers truthfully. Use the answer to flip down (eliminate) all characters that cannot match that answer. The eliminated characters are shown with a strikethrough.

After your question, the bot automatically asks a question about your character using the same logic and narrows down its own candidates.

When you think you know the bot's secret character, switch to "Guess" mode and click that character's name. If you are right, you win! If you are wrong, you immediately lose — so only guess when you are confident!

There are 20 characters with 6 attributes: hair color (brown, blonde, black, red, white), eye color, facial hair, accessories (hat, glasses), hair length, and nose size. Use the questions strategically to eliminate large groups quickly. Score 100 for a correct guess, 0 for a wrong guess or if the bot figures you out first!`,
  settings: guessWhoSettings,
  initialState: (seed: number, settings: GuessWhoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: GuessWhoGame,
};
