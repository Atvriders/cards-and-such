import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MortalKombatState, MortalKombatAction, MortalKombatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MortalKombatQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mortalKombatQuizPlugin: GamePlugin<MortalKombatState, MortalKombatAction, typeof settings> = {
  id:"mortal-kombat-quiz", title:"Mortal Kombat Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Mortal Kombat: brutal fighting tournaments and Fatalities.",
  howToPlay:"Mortal Kombat Quiz tests your knowledge of Midway and NetherRealm's iconic, blood-soaked fighting franchise that revolutionized arcade brawlers in 1992. Questions cover the kombatants you know — Scorpion, Sub-Zero, Liu Kang, Raiden, Kitana, Mileena, Kano, Sonya, Johnny Cage, Jax, Goro, Shao Kahn, Quan Chi, Reptile, and many more — along with Fatalities, Babalities, the realms (Earthrealm, Outworld, Netherrealm, Edenia), and three decades of brutal kombat.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. FINISH HIM!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MortalKombatSettings),
  reducer,isTerminal,component:MortalKombatQuizGame,
};
