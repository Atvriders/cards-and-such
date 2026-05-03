import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TonkState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const tonkSettings = {} as const;
type TonkSettings = SettingsOf<typeof tonkSettings>;
type TonkAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "discard"; cardId: string }
  | { type: "tonk" };

export const tonkPlugin: GamePlugin<TonkState, TonkAction, typeof tonkSettings> = {
  id: "tonk",
  title: "Tonk",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "American rummy variant popular in blues clubs. Form melds and go out to win!",
  howToPlay: `Tonk (also known as "Tunk") is an American rummy game popularized in blues bars and jazz clubs. It uses a standard 52-card deck and is fast-paced and fun.

Setup: Each player receives 7 cards. One card is flipped to start the discard pile. Card values: Ace=1, numbered cards at face value, face cards (J, Q, K) = 10.

Your turn:
1. Draw — take the top card from the stock pile, or take the top discard card.
2. Discard — play one card face-up onto the discard pile.

Melds (green): Groups of 3 or 4 cards of the same rank (sets), or 3+ consecutive cards of the same suit (runs). The game auto-detects and highlights your best melds.

Deadwood (red): Cards not in any meld. Your deadwood value is the sum of those cards' point values.

Going out (Tonk!): If after drawing you can arrange all your cards into melds (zero deadwood), click "Tonk!" to go out and win instantly.

If the stock empties, the player with lower deadwood wins. Aim to build melds quickly and go out before the bot!`,
  settings: tonkSettings,
  initialState: (seed: number, _settings: TonkSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: TonkState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-tonk-primary"]', pulses: 3 };
  },
  component: Game,
};
