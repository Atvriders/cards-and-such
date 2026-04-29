import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MariashGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const mariashPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "mariash",
  title: "Mariáš",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Czech 3-player trump game with marriages adapted to 1v1.",
  howToPlay: "Mariáš is the Czech national three-player trump game, traditionally featuring 'marriages' (king-queen pairs of the same suit) for bonus points. This 1v1 simulator distills the trump-trick rhythm into a thirteen-card duel; clubs are trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card takes the trick. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take eight or more of the thirteen tricks. Mariáš marriage bonuses are abstracted here, but a king-queen of trumps in your hand naturally translates into trick-winning power. The bot plays defensively: cheap wins when possible, dumps elsewhere. Click any legal card; the bot responds immediately. Mariáš rewards trump-rich seeds, especially when paired with strong side-suit aces — the classic Czech card-game decision pattern.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: MariashGame,
};
