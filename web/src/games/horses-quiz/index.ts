import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorsesQuizState, HorsesQuizAction, HorsesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HorsesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const horsesQuizPlugin: GamePlugin<HorsesQuizState, HorsesQuizAction, typeof settings> = {
  id:"horses-quiz", title:"Horses Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trot through thirty questions on horse breeds, gaits, racing legends, and equine history.",
  howToPlay:"Horses Quiz tests your knowledge of equus caballus. Questions cover the major breeds — Thoroughbred, Arabian, Quarter Horse, Friesian, Andalusian, Clydesdale, Shire, Mustang, Appaloosa, Lipizzaner, and more — plus the natural gaits (walk, trot, canter, gallop), and specialized gaited breeds like the Tennessee Walker. You'll see questions on famous racehorses (Secretariat, Man o' War, Seabiscuit), the Triple Crown, equestrian disciplines (dressage, show jumping, eventing, polo), and the rich history of the horse-human partnership across continents.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong ones flash red and show the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you ride competitively, work a ranch, or just enjoy watching the Kentucky Derby, this quiz delivers a stable-full of equine knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HorsesQuizSettings),
  reducer,isTerminal,
  hint: (state: HorsesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HorsesQuizGame,
};
