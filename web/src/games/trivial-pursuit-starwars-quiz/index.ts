import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitStarwarsQuizState, TrivialPursuitStarwarsQuizAction, TrivialPursuitStarwarsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrivialPursuitStarwarsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitStarwarsQuizPlugin: GamePlugin<TrivialPursuitStarwarsQuizState, TrivialPursuitStarwarsQuizAction, typeof settings> = {
  id:"trivial-pursuit-starwars-quiz", title:"Trivial Pursuit Star Wars Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia from the Star Wars edition: Jedi, Sith, ships, and saga lore.",
  howToPlay:"Trivial Pursuit Star Wars Trivia challenges your command of the galaxy far, far away. Questions cover the original trilogy, the prequels, the sequel trilogy, key characters, ships, lightsabers, planets, and saga lore. Each round has ten questions. Pick an answer and press Submit. Correct picks award 100 base points plus 10 points per second remaining on the 15-second clock, so fast Jedi reflexes pay off. A wrong answer reveals the correct option and disables the choices; press Next to advance to the next question. After question ten, your final score appears. Whether you can recite Yoda's most famous lines, name every Millennium Falcon co-pilot, or just remember 'I am your father' from one watch with friends, this quiz is your chance to prove your saga knowledge from the Outer Rim to Coruscant.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitStarwarsQuizSettings),
  reducer,isTerminal,
  hint: (state: TrivialPursuitStarwarsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrivialPursuitStarwarsQuizGame,
};
