import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CraplessCrapsState, CraplessCrapsAction, CraplessCrapsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CraplessCrapsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const craplessCrapsPlugin: GamePlugin<CraplessCrapsState, CraplessCrapsAction, typeof settings> = {
  id:"crapless-craps", title:"Crapless Craps", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Casino craps without 2/3/12 losses. 10 rounds; come-out roll scoring.",
  howToPlay:"Crapless Craps (also called Bastard Craps) is a casino variant where the come-out roll never loses on 2, 3, or 12 — the typical \"craps\" numbers in standard play. Instead, those numbers become point numbers, making the game more player-friendly on come-out.\n\nIn this 10-round single-roll version, you roll two dice each round as a come-out roll. Scoring: 7 or 11 = 30 (natural win); 2, 3, 12 = 15 (in regular craps these lose, here they're points worth a small reward); other sums (4, 5, 6, 8, 9, 10) = 10 + sum (the higher the point, the better the consolation).\n\n10 rounds total. Average expected score: 130-220 points. The Crapless variant raises every roll's expected value compared to standard craps because nothing ever scores zero.\n\nA gentler casino dice experience. Every roll wins something, and the natural 7 or 11 is still the dream.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CraplessCrapsSettings),
  reducer,isTerminal,component:CraplessCrapsGame,
};
