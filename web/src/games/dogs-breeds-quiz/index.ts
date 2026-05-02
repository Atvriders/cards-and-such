import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DogsBreedsQuizState, DogsBreedsQuizAction, DogsBreedsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DogsBreedsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dogsBreedsQuizPlugin: GamePlugin<DogsBreedsQuizState, DogsBreedsQuizAction, typeof settings> = {
  id:"dogs-breeds-quiz", title:"Dog Breeds Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Heel through thirty questions on the world's most beloved dog breeds — origins, traits, and group classifications.",
  howToPlay:"Dog Breeds Quiz tests your knowledge of canis familiaris in all its varieties. Questions cover the major AKC groups — sporting dogs (Labrador, Golden Retriever, Pointer, Spaniel), hounds (Beagle, Bloodhound, Greyhound), working dogs (Saint Bernard, Boxer, Mastiff), terriers (Yorkshire, Jack Russell, Bull Terrier), toys (Pomeranian, Chihuahua, Shih Tzu), non-sporting (Bulldog, Dalmatian, Poodle), and herding (Border Collie, Australian Shepherd, German Shepherd). You'll see questions on country of origin, traditional jobs, distinctive traits, and famous breed standards.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong choices flash red and reveal the right answer. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you raise show dogs, train working K9s, or just love every floppy-eared friend, this quiz delivers a kennel-full of canine knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DogsBreedsQuizSettings),
  reducer,isTerminal,
  hint: (state: DogsBreedsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DogsBreedsQuizGame,
};
