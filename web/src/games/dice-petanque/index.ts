import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePetanqueState, DicePetanqueAction, DicePetanqueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePetanqueGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePetanquePlugin: GamePlugin<DicePetanqueState, DicePetanqueAction, typeof settings> = {
  id:"dice-petanque", title:"Dice Petanque", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"French metal-ball throwing; 5 ends.",
  howToPlay:"Dice Petanque models the French boules sport where players throw or roll metal balls toward a small wooden cochonnet (the jack), attempting to land closest. Petanque is fiercely competitive across France — the World Championships are a serious event in Marseille.\n\nEach of 5 ends you Roll three dice. Closeness to the jack is simulated by die value: a 3 scores 3 points (perfect range), a 2 or 4 scores 2 (near miss), a 1 or 5 scores 1, and a 6 scores 0 (overthrown).\n\nA typical end yields 4-6 points; a perfect end (three 3s) yields 9. Five ends commonly total 20-30; a brilliant run can reach 40, with a maximum of 45.\n\nReal petanque is played on hard-packed gravel and turns on the choice between 'pointing' (rolling close) and 'shooting' (knocking opponent balls away). This mini abstracts that into pure dice rolls but keeps the rhythm — three throws, score, advance. Press Roll, Next. Quick, sun-soaked, and unmistakably Provencal.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePetanqueSettings),
  reducer,isTerminal,component:DicePetanqueGame,
};
