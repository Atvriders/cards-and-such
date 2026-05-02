import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UsStatesQuizState, UsStatesQuizAction, UsStatesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UsStatesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const usStatesQuizPlugin: GamePlugin<UsStatesQuizState, UsStatesQuizAction, typeof settings> = {
  id:"us-states-quiz", title:"US States Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of US state capitals, nicknames, and abbreviations.",
  howToPlay:`US States Quiz drills you on America's 50 states. Questions cover state capitals (Sacramento, Albany, Tallahassee), official nicknames (Sunshine State, Lone Star State, Empire State), and two-letter postal abbreviations (MA, MS, MN). Whether you grew up reciting state lists in elementary school or never quite got past the obvious ones, this quiz will pinpoint your gaps.\n\nEach question gives you 15 seconds and four options. A correct answer earns 100 points plus 10 per second remaining — so the faster you click, the more you score.\n\nTap your answer, press Submit, and watch the right one glow green. Choose 10, 20, or 30 questions in Settings.\n\nQuick — what's the capital of Idaho? Pierre or Boise? And which state is the Hoosier State? This is the kind of trivia that wins game nights and impresses social-studies teachers everywhere.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UsStatesQuizSettings),
  reducer,isTerminal,
  hint: (state: UsStatesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:UsStatesQuizGame,
};
