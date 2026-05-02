import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedKingState, RedKingAction, RedKingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedKingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const redKingPlugin: GamePlugin<RedKingState, RedKingAction, typeof settings> = {
  id:"red-king", title:"Red King", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score 25 points each time you draw a red King. 12 draws.",
  howToPlay:"Red King is a tiny luck-based card minigame. The deck is shuffled internally on every draw — your job is simple: hit Draw 12 times and hope for red Kings (the King of Hearts and the King of Diamonds).\n\nEach red King you draw is worth 25 points; everything else scores zero. Two red Kings exist among the 52 cards, so the rough probability per draw is about 1 in 26. Across 12 draws, an average run scores 0-50 points; lucky streaks can push past 100.\n\nEach draw is independent — there's no penalty for misses, just keep clicking. Watch the suit symbols: red ♥ and ♦ are the targets when paired with the King rank.\n\nWhen all 12 draws are done, your final score is locked in. Try to beat the odds and string together a hot streak of crowned hearts and diamonds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RedKingSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-red-king-primary"]', pulses: 3 }),component:RedKingGame,
};
