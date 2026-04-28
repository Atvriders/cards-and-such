import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TelestrationsQuizState, TelestrationsQuizAction, TelestrationsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TelestrationsQuizGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const telestrationsQuizPlugin: GamePlugin<TelestrationsQuizState, TelestrationsQuizAction, typeof settings> = {
  id: "telestrations-quiz",
  title: "Telestrations Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of Telestrations, the sketch-and-guess telephone party game.",
  howToPlay: "Telestrations Trivia tests how well you know the chaotic sketch-and-guess party hit Telestrations and its many spinoffs. Players answer ten multiple-choice questions about the game's components, history, rules, expansions, and oddball moments that happen when drawings travel around the table.\n\nEach question shows four options labelled A through D. Tap one to select it and press Submit. A correct answer earns 100 points; a wrong answer earns nothing but reveals the correct choice so you learn for next time.\n\nTopics include the original publisher, the timer length, sketchbook count, the After Dark adult edition, the Upside Drawn challenge variant, scoring rules in classic mode, and the unmistakable feel of getting \"skull on fire\" as your prompt.\n\nPress Next after each result, and Finish on the final question to see your total. Ten correct answers nets a perfect 1000-point sketchbook score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TelestrationsQuizSettings),
  reducer, isTerminal, component: TelestrationsQuizGame,
};
