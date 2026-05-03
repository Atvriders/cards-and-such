import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShipCaptainCrewFoolState, ShipCaptainCrewFoolAction, ShipCaptainCrewFoolSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShipCaptainCrewFoolGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const shipCaptainCrewFoolPlugin: GamePlugin<ShipCaptainCrewFoolState, ShipCaptainCrewFoolAction, typeof settings> = {
  id:"ship-captain-crew-fool", title:"Ship Captain Crew Mate (Ship of Fools)", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Ship Captain Crew Mate (a.k.a. Ship of Fools), a push-your-luck dice game.",
  howToPlay:"Ship Captain Crew Mate Trivia (also called Ship of Fools) is a ten-question quiz about a classic five-dice push-your-luck pub game. Each player rolls five dice up to three times per turn aiming to set aside, in order, a 6 (the Ship), 5 (the Captain), and 4 (the Crew). Once these three are set, the remaining two dice (the Mate and Cargo) are summed for that turn's score. Players take turns and the highest score wins. The game has many regional variants and rule tweaks (such as betting and called shots). Each question tests rules, the 6-5-4 sequence, scoring, and history of Ship Captain Crew Mate. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ShipCaptainCrewFoolSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-ship-captain-crew-fool-primary"]', pulses: 3 }), component:ShipCaptainCrewFoolGame,
};
