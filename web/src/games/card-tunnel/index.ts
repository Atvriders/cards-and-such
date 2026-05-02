import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTunnelState, CardTunnelAction, CardTunnelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTunnelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTunnelPlugin: GamePlugin<CardTunnelState, CardTunnelAction, typeof settings> = {
  id:"card-tunnel", title:"Card Tunnel", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 12 cards through a dark tunnel — face cards and aces light the way.",
  howToPlay:"Card Tunnel is a 12-draw card mini. You're walking through a long, dark tunnel and each step reveals a single card. Face cards (J, Q, K) and Aces are torches that brightly light your way and score 20 points each. Mid-rank cards (8, 9, 10) cast a faint glow and score 10 points. Low cards (2 through 7) leave you in the dark and score 0.\\n\\nJust press Draw, see what comes up, then press Next to step further into the tunnel. There's no skill — only the order of the deck and your luck. Average runs land around 80-130 points; emerge with 200+ and the tunnel was lit by a fortunate string of high cards.\\n\\nA short, simple game perfect for a quick break. Each card is drawn fresh from a 52-card deck (with replacement, so duplicates are possible across the 12 draws). Walk through, count your light, and emerge into the daylight!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTunnelSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-tunnel-primary"]', pulses: 3 }),component:CardTunnelGame,
};
