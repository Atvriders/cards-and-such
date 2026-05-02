import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnimalTracksQuizState, AnimalTracksQuizAction, AnimalTracksQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnimalTracksQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const animalTracksQuizPlugin: GamePlugin<AnimalTracksQuizState, AnimalTracksQuizAction, typeof settings> = {
  id:"animal-tracks-quiz", title:"Animal Tracks Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify animals from their footprints and tracks.",
  howToPlay:"Animal Tracks Quiz challenges your tracking skills. Each question asks you to identify which animal made a particular set of footprints — based on size, toe count, claw marks, gait, and habitat clues. From the splayed paw of a bear to the cleft hoof of a deer, the precise toe-count of a raccoon to the claw-streaked print of a wolverine, you'll learn to read the wilderness like a naturalist.\n\nEach correct answer scores 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The correct answer is revealed before you continue. Whether you're a backcountry hiker, an aspiring naturalist, or just a curious mind, this quiz turns the trail into a textbook. Track on!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AnimalTracksQuizSettings),
  reducer,isTerminal,
  hint: (state: AnimalTracksQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AnimalTracksQuizGame,
};
