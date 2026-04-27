import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DinosaursQuizState, DinosaursQuizAction, DinosaursQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DinosaursQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dinosaursQuizPlugin: GamePlugin<DinosaursQuizState, DinosaursQuizAction, typeof settings> = {
  id:"dinosaurs-quiz", title:"Dinosaurs Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roar through thirty questions on Mesozoic giants — Triassic to Cretaceous, theropods to sauropods.",
  howToPlay:"Dinosaurs Quiz tests your knowledge of life in the Mesozoic Era. Questions cover the three periods (Triassic, Jurassic, Cretaceous), the major groups (theropods, sauropods, ornithopods, ceratopsians, ankylosaurs, stegosaurids), and famous individual species: Tyrannosaurus rex, Velociraptor, Triceratops, Stegosaurus, Brachiosaurus, Spinosaurus, Allosaurus, Diplodocus, Iguanodon, and many more. You'll see questions on diet, locomotion, the K-Pg extinction event, the modern bird connection, and recent paleontological discoveries.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong ones flash red and show the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you have a paleontology degree or just have a five-year-old who knows every species, this quiz delivers a fossil-bed of Mesozoic knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DinosaursQuizSettings),
  reducer,isTerminal,component:DinosaursQuizGame,
};
