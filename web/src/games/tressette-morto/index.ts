import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TressetteMortoGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const tressetteMortoPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "tressette-morto",
  title: "Tressette con il Morto",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-player Tressette played here with a dummy hand 1v1.",
  howToPlay: "Tressette con il Morto ('Tressette with the Dead Hand') traditionally uses a dummy hand to enable three-player Tressette. In this simulator the dummy hand is folded into the 1v1 trick-taking duel, with you and the bot each holding thirteen cards in classic Tressette fashion.\n\nNo trump applies. Follow the led suit if you can; if you cannot, your card cannot win the trick. The highest card of the led suit takes the trick — ace high, then king, queen, jack, ten down to two. Tressette card values are abstracted into pure trick-counting here.\n\nWin by taking seven or more of the thirteen tricks. The bot plays a careful defensive baseline: it captures when it can do so cheaply, and dumps low otherwise. Tressette rewards reading the bot's lead choices and timing high cards to control suits — particularly when capturing the king or queen. Click any legal card; the bot responds immediately and the trick resolves on screen.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: TressetteMortoGame,
};
