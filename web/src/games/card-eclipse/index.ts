import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardEclipseState, CardEclipseAction, CardEclipseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardEclipseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardEclipsePlugin: GamePlugin<CardEclipseState, CardEclipseAction, typeof settings> = {
  id:"card-eclipse", title:"Card Eclipse", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards arrayed in eclipse. Pick face cards for big scores. 8 rounds.",
  howToPlay:"Card Eclipse evokes the rare alignment of sun and moon: face cards and Aces are your celestial bodies. Each round, five cards form an eclipse pattern. Pick wisely — Aces score 40 (the sun crown), face cards (J, Q, K) score 25, and number cards just score their face value (2-10).\n\nThe strategy is simple: hunt for Aces, settle for face cards if no Ace is showing, otherwise take the highest number card. Approximately 4/13 of cards are 'good' picks (J, Q, K, A), so you'll usually have something solid to grab.\n\nYou play 8 rounds. Expected scores cluster around 150-220, with strong runs (where you keep finding Aces) reaching 280+. Maximum theoretical: 320 (8 × 40, all Aces).\n\nThere's no time pressure — just scan the eclipse pattern, pick your celestial pick, and let the heavens align.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardEclipseSettings),
  reducer,isTerminal,component:CardEclipseGame,
};
