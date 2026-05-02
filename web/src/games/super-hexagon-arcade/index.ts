import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperHexagonArcadeState, SuperHexagonArcadeAction, SuperHexagonArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuperHexagonArcadeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const superHexagonArcadePlugin: GamePlugin<SuperHexagonArcadeState, SuperHexagonArcadeAction, typeof settings> = {
  id:"super-hexagon-arcade", title:"Super Hexagon-Style", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Super Hexagon and rotation-dodging arcade games.",
  howToPlay:"Super Hexagon-Style Trivia is a ten-question quiz about Super Hexagon (Terry Cavanagh, 2012) and similar rotation-dodging arcade games. The player controls a tiny triangle that rotates around the center of a hexagonal screen. Walls of hexagonal pattern close in toward the center and the player must rotate to find gaps and pass through. The game features driving electronic music by Chipzel and is famous for its difficulty and short play sessions. Each question tests gameplay, design, and history of Super Hexagon. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SuperHexagonArcadeSettings),
  reducer,isTerminal,hint: (state: SuperHexagonArcadeState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-super-hexagon-arcade-primary"]', pulses: 3 } : null,component:SuperHexagonArcadeGame,
};
