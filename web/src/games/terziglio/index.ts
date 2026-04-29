import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TerziglioGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const terziglioPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "terziglio",
  title: "Terziglio",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Calabresella variant popular in Rome with Napoli bonuses.",
  howToPlay: "Terziglio is the Calabresella variant popular around Rome, featuring 'Napoli' bonuses for special card combinations. This 1v1 simulator captures Terziglio's solo-vs-pair feel: you play as the declarer against a unified bot opposition. Clubs are trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps and led-suit cards can win. The highest trump wins outright; otherwise the highest led-suit card takes the trick. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take eight or more of the thirteen tricks dealt. Terziglio's 'Napoli' bonus tradition rewards holding ace-deuce-three of trumps; in this simulator that rich-trump pattern naturally translates into more tricks won. The bot defends adaptively, capturing cheaply and dumping low otherwise. Click any legal card; the bot answers immediately. Strong trump seeds and well-distributed aces in side suits give Terziglio its characteristic decisive results.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: TerziglioGame,
};
