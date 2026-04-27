import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniRussianBankState, MiniRussianBankAction, MiniRussianBankSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniRussianBankGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniRussianBankPlugin: GamePlugin<MiniRussianBankState, MiniRussianBankAction, typeof settings> = {
  id:"mini-russian-bank", title:"Mini Russian Bank", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Simplified Russian Bank solitaire mini.",
  howToPlay:"Mini Russian Bank is a simplified take on the classic two-deck Russian Bank solitaire. The full game is a competitive two-handed solitaire with elaborate building rules; this mini condenses the experience into a single-player puzzle where you tap visible cards from a 16-card layout to clear them.\n\nEach card removed scores 15 points. You have 26 clicks total. The original requires intricate cross-pile move planning to avoid traps, but the mini's straightforward removal mechanic delivers the satisfying flow of Russian Bank without the steep learning curve.\n\nA clean clearance scores 240 points. Average runs land in the 220-240 point range. Crisp, tactile, and quick — a great way to honor a beautiful classic without diving into the full ruleset.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniRussianBankSettings),
  reducer,isTerminal,component:MiniRussianBankGame,
};
