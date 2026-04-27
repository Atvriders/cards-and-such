import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SixShootState, SixShootAction, SixShootSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SixShootGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sixShootPlugin: GamePlugin<SixShootState, SixShootAction, typeof settings> = {
  id:"six-shoot", title:"Six Shoot", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Find the sixes! Each 6 drawn earns 40 points.",
  howToPlay:"Six Shoot is a 14-draw card mini hunting sixes. Each draw pulls one random card from a 52-card deck. Every 6 revealed scores 40 points.\n\nThere are four sixes per deck, so the theoretical maximum is 160 points across the run; in practice, expect 0-120. There's no choice to make — just press Draw and watch what comes up. The game is short and luck-driven, perfect for a quick break.\n\nEach draw flips a fresh card. Sixes glow green in your tally; everything else is harmless background. Past cards appear in a small ribbon under the current card so you can track what's already been revealed.\n\nThe game ends after 14 draws and your final score is locked in. There's no penalty for missing — just no points. Pure draw, pure dice-of-the-deck variance. Try to land that elusive sixth six!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SixShootSettings),
  reducer,isTerminal,component:SixShootGame,
};
