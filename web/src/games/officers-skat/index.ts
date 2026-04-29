import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OfficersSkatGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const officersSkatPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "officers-skat",
  title: "Officers' Skat",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player Skat variant with open and closed columns.",
  howToPlay: "Officers' Skat (Offiziersskat) is the historical two-player Skat variant where each side maintains face-up and face-down 'columns' of cards. This simulator presents a streamlined adaptation: you and the bot each receive sixteen cards (a full half-deck) and play through all sixteen tricks. Clubs are trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card wins. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take nine or more of the sixteen tricks. Officers' Skat is famously demanding because the larger hand size enables deep planning — every trump played reduces the opponent's options downstream. The bot follows a defensive baseline. Click any legal card; the bot answers immediately. Strong trump density and at least two side-suit aces give a comfortable edge.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: OfficersSkatGame,
};
