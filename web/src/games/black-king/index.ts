import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackKingState, BlackKingAction, BlackKingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackKingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blackKingPlugin: GamePlugin<BlackKingState, BlackKingAction, typeof settings> = {
  id:"black-king", title:"Black King", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score 25 points each time you draw a black King. 12 draws.",
  howToPlay:"Black King is a tiny luck-based card minigame. Each draw the deck is reshuffled and a single card flips up — your goal is to land black Kings (the King of Spades and the King of Clubs).\n\nEvery black King you draw earns 25 points; any other card earns nothing. There are only two black Kings in the standard 52-card deck, so the per-draw probability sits near 1 in 26. Over the 12 rounds an average run lands around 0-50 points; getting two or more black Kings in a single game is genuinely lucky.\n\nEach draw is independent — there's no penalty for misses, just keep clicking the Draw button. Watch the suit symbols: black ♠ and ♣ are the targets when paired with the King rank.\n\nWhen all 12 draws are complete, your final score is locked. Will the dark crown smile on you today?",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BlackKingSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-black-king-primary"]', pulses: 3 }), component:BlackKingGame,
};
