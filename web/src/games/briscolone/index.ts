import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BriscoloneGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const briscolonePlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "briscolone",
  title: "Briscolone",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "No-trump Briscola variant; pure card counting and trick play.",
  howToPlay: "Briscolone is the no-trump branch of the Italian Briscola family. Without a trump suit, every trick is decided by following the led suit — the highest card of that suit takes the trick, period. In this 1v1 duel you and the bot each receive thirteen cards and play through all thirteen tricks.\n\nFollow suit if you can. If you cannot, you must still play, but a card off-suit cannot win the trick. Aces are highest (rank fourteen above the king), then king, queen, jack, ten down to two. The bot plays a defensive baseline strategy: it tries to win cheaply when leading is captured, and dumps low cards otherwise.\n\nWin if you take eight or more of thirteen tricks. Briscolone rewards card-counting and timing: with no trumps to fall back on, each suit must be tracked and high cards saved for the right moment. Click any legal card in your hand to play it — the bot responds immediately, and the trick resolves in a flash.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: BriscoloneGame,
};
