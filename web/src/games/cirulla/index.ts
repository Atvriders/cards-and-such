import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CirullaGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const cirullaPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "cirulla",
  title: "Cirulla",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ligurian Scopa relative with bonus declaration trick play.",
  howToPlay: "Cirulla is the Ligurian cousin of Scopa, traditionally featuring 'fifteens' (cards summing to fifteen) and bonus declarations. This 1v1 simulator captures the trick-taking flavor of the Scopa family with a thirteen-card hand and no trump suit.\n\nFollow the led suit if you can; if you cannot, your card cannot win the trick. Within the led suit, the highest card takes the trick — ace is high, then king, queen, jack, ten through two. Each won trick counts toward your goal of eight or more out of thirteen.\n\nThe bot uses a defensive baseline: cheap wins when possible, dumps low cards otherwise. Cirulla's classical bonus declarations are abstracted here into the trick-count score, so big seeds with good high cards stay rewarding without needing to track Italian deck-specific extras. Click any legal card to play; the bot responds and the trick resolves immediately. Card-counting and saving ace-and-court cards for important suits is the path to victory.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: CirullaGame,
};
