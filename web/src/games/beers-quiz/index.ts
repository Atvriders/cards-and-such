import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeersQuizState, BeersQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BeersQuiz } from "./Game.js";

export const beersQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof beersQuizSettings>;

export const beersQuizPlugin: GamePlugin<BeersQuizState, BeersQuizAction, typeof beersQuizSettings> = {
  id: "beers-quiz",
  title: "Beers Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify beer styles, brewing methods, and famous brews from around the world.",
  howToPlay: `Beers Quiz tests your knowledge of beer styles, brewing techniques, and regional traditions from across the globe. Each question describes a beer's fermentation method, flavor profile, origin, or famous brand and asks you to identify the style or name.

Select the correct answer to earn 10 points. Correct answers highlight in green; wrong ones in red with the right answer revealed. Press Next to continue.

The quiz covers lagers, ales, stouts, IPAs, wheat beers, sour beers, Belgian styles, German traditions, and more. Both casual beer drinkers and enthusiasts will find questions at various difficulty levels.

Choose 5, 10, or 15 questions per session to match your level of expertise.

Tips: Yeast type is a key clue — top-fermenting yeast typically means ale; bottom-fermenting means lager. Geographic hints are powerful: Czech or German settings suggest lager styles; Belgian references often mean farmhouse or Trappist ales. Flavor descriptors narrow things down quickly — roasted and dark means stout or porter; citrusy and bitter means IPA. When a question mentions monks or abbeys, Trappist ales are the likely answer.`,
  settings: beersQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BeersQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: BeersQuiz,
};
