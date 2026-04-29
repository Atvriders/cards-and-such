import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarafoneBeccaccinoGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const marafoneBeccaccinoPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "marafone-beccaccino",
  title: "Marafone Beccaccino",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Romagna 40-card trick-taker with trumps and partner accuse calls.",
  howToPlay: "Marafone Beccaccino is the Romagna-region trick-taker traditionally played with a 40-card Italian deck and partner-accuse calls. This 1v1 simulator captures Marafone's trump-driven trick play: thirteen cards each, with clubs as trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card takes the trick. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take eight or more of the thirteen tricks dealt. Marafone's traditional 'busso' and 'striscio' partner-call signals are abstracted away in this single-player adaptation, but the trump-management rhythm remains: the player with stronger trumps and reliable side-suit aces tends to dominate. The bot defends adaptively, capturing cheaply where possible. Click any legal card; the bot responds immediately and the trick resolves on screen.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: MarafoneBeccaccinoGame,
};
