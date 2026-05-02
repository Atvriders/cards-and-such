import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { Chess960CrazyhouseQuizState, Chess960CrazyhouseQuizAction, Chess960CrazyhouseQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Chess960CrazyhouseQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chess960CrazyhouseQuizPlugin: GamePlugin<Chess960CrazyhouseQuizState, Chess960CrazyhouseQuizAction, typeof settings> = {
  id: "chess960-crazyhouse-quiz",
  title: "Chess 960 + Crazyhouse Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fischer Random combined with Crazyhouse drops.",
  howToPlay: "Chess 960 + Crazyhouse Quiz is a fast-paced quiz built around the rules, history, and tactical themes of Chess 960 + Crazyhouse. Each question describes a position, a rule, or a strategic choice unique to this variant, and asks you to pick the right answer from four choices.\n\nYou have 15 seconds per question. A correct answer awards 100 base points plus 10 points for every second remaining on the clock — so think fast and decide. Wrong answers and timeouts score zero, but the correct choice is always revealed before you continue, turning every miss into a learning moment.\n\nTap a choice to select it, then press Submit. Selected choices glow blue, correct answers turn green, and wrong picks turn red. Press Next to continue to the next question. After ten questions you will see your final score and how many you nailed.\n\nWhether you have never played this variant or you have studied it for years, the quiz mixes flavor questions, rule trivia, and tactical motifs that capture what makes this variant distinctive.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Chess960CrazyhouseQuizSettings),
  reducer,
  isTerminal,
  hint: (state: Chess960CrazyhouseQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: Chess960CrazyhouseQuizGame,
};
