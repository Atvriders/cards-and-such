import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReptilesWorldQuizState, ReptilesWorldQuizAction, ReptilesWorldQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReptilesWorldQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const reptilesWorldQuizPlugin: GamePlugin<ReptilesWorldQuizState, ReptilesWorldQuizAction, typeof settings> = {
  id:"reptiles-world-quiz", title:"Reptiles World Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Slither through thirty questions on snakes, lizards, turtles, and crocodilians from across the planet.",
  howToPlay:"Reptiles World Quiz tests your knowledge of the cold-blooded class. Questions cover the four orders — Squamata (snakes and lizards), Testudines (turtles, tortoises, terrapins), Crocodilia (alligators, crocodiles, gharials, caimans), and the lone Sphenodontia (the tuatara). You'll see questions on venomous vs constricting snakes, the largest lizards (Komodo dragon, monitor lizards, iguanas), beloved chelonians from Galapagos to leatherback sea turtles, and how reptiles thermoregulate in environments from rainforest to desert.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong choices flash red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you keep a corn snake at home or brave Australian desert herping, this quiz delivers a basking-rock of reptile knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ReptilesWorldQuizSettings),
  reducer,isTerminal,component:ReptilesWorldQuizGame,
};
