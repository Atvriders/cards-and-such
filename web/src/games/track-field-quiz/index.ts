import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrackFieldQuizState, TrackFieldQuizAction, TrackFieldQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrackFieldQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trackFieldQuizPlugin: GamePlugin<TrackFieldQuizState, TrackFieldQuizAction, typeof settings> = {
  id:"track-field-quiz", title:"Track and Field Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of track and field events, distances, and records.",
  howToPlay:`Track and Field Quiz tests your knowledge of athletics — the foundational events of every Olympics. Questions cover sprints (100m, 200m, 400m), middle and long distance, hurdles, steeplechase, and the marathon. The field side gets equal time: shot put, discus, hammer, javelin, plus the four jumps (high, long, triple, pole vault).

You'll be quizzed on legends like Usain Bolt and Jesse Owens, world records, technical specs (track length, lane count, hurdle heights), and combined events like the decathlon and heptathlon. Iconic moments like Roger Bannister's 4-minute mile show up too, alongside details about modern track surfaces and equipment standards.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 per second remaining on the timer. Wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always shown.

Choose 10 or 20 questions in Settings. Bring out your inner track nerd!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrackFieldQuizSettings),
  reducer,isTerminal,
  hint: (state: TrackFieldQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:TrackFieldQuizGame,
};
