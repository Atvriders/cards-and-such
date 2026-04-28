import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SagradaWindowState, SagradaWindowAction, SagradaWindowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SagradaWindowGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sagradaWindowPlugin: GamePlugin<SagradaWindowState, SagradaWindowAction, typeof settings> = {
  id:"sagrada-window",
  title:"Sagrada Window",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll-and-draft stained glass dice game.",
  howToPlay:"Sagrada Window is a 10-round dice-drafting cathedral-window game. Each round, four dice are rolled to populate the draft pool. Sum all four for your base round score. 🪟\n\nIf any two of the four dice share the same value (a matching color of stained glass), you earn a 4-point harmony bonus. If three match, +8. If all four match (rare!), +15. Across 10 rounds expect totals between 130 and 170.\n\nPress Roll to draft new stained-glass dice for your window, then Next to continue. Each die's value glows. Score 160+ to be a Sagrada artisan master. The game captures the original Sagrada's quiet, meditative drafting in a quick fantasy run finishing in well under a minute. Inspired by the cathedral-window dice game beloved by tabletop fans, this miniature evokes its peaceful artistry in a brisk session ideal for a creative fantasy break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SagradaWindowSettings),
  reducer,
  isTerminal,
  component:SagradaWindowGame,
};
