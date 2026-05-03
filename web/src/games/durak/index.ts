import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DurakState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const durakSettings = {} as const;
type DurakSettings = SettingsOf<typeof durakSettings>;
type DurakAction =
  | { type: "play-attack"; cardId: string }
  | { type: "play-defend"; cardId: string }
  | { type: "take" };

export const durakPlugin: GamePlugin<DurakState, DurakAction, typeof durakSettings> = {
  id: "durak",
  title: "Durak",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Russian shedding card game. Don't be the last one holding cards — the Durak (fool) loses!",
  howToPlay: `Durak ("fool" in Russian) is Russia's most popular card game. The goal is simple: get rid of all your cards before your opponent. The last player holding cards is the Durak — the fool!

Setup: A 36-card deck (6 through Ace). Each player gets 6 cards. One card is flipped to reveal the trump suit — the trump card goes to the bottom of the deck.

Trump cards: Any trump card beats any non-trump card of any rank.

Attack: You attack by playing any card face-up. The bot must defend it.

Defending: To beat an attack card, you must play either:
- A higher card of the same suit
- Any trump card (if the attack card is not trump)

If the defender cannot beat the attack card, they must take it into their hand and the attacker gets another turn.

Taking: As defender, you can click "Take card" to pick up the attack card and forfeit your defense.

Drawing: After each exchange, both players draw back up to 6 cards from the deck.

End: When the deck runs out, the player who empties their hand first wins. The loser — the Durak — is left holding cards!`,
  settings: durakSettings,
  initialState: (seed: number, _settings: DurakSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-durak-action"]', pulses: 3 }; },
  component: Game,
};
