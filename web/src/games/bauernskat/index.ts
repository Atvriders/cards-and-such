import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BauernskatGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const bauernskatPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "bauernskat",
  title: "Bauernskat",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified Farmer's Skat with fewer contracts and trump play.",
  howToPlay: "Bauernskat ('Farmer's Skat') is the simplified, rural cousin of full Skat — fewer contracts, gentler rules, more accessible play. This 1v1 simulator strips it down further to a clean trick-taking duel: ten cards each, clubs as trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card wins. Ace is high, then king down to two.\n\nWin if you take five or more of the ten tricks. Bauernskat is forgiving: a roughly even trump split typically produces close games, and a small trump advantage usually carries the round. The bot plays its measured defensive baseline — cheap captures, dumps when out of options. Click any legal card; the bot responds immediately. Bauernskat rewards seeds where trumps cluster on your side, and a strong ace in a side suit provides nice insurance against bot-led tricks.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: BauernskatGame,
};
