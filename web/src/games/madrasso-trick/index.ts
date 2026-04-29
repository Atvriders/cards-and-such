import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MadrassoTrickGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const madrassoTrickPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "madrasso-trick",
  title: "Madrasso",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Venetian 40-card partnership game with declarations and trump play.",
  howToPlay: "Madrasso is a Venetian partnership trick-taking game traditionally played with a 40-card Italian deck. This 1v1 simulator distills the trump-and-trick rhythm into a thirteen-card duel; clubs serve as the trump suit, mirroring Madrasso's permanent or called-trump tradition.\n\nFollow the led suit if you can. If you cannot, you may play any card, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card takes the trick. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take eight or more of the thirteen tricks. Madrasso's 'declarations' (showing meld-style combinations) are abstracted here into pure trick-count scoring, but the trump-management feel remains: holding the trump ace plus a few mid-rank trumps usually decides the round. The bot defends adaptively. Click any legal card; the bot responds immediately. Strong trump-rich seeds and ace coverage carry Madrasso to confident wins.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: MadrassoTrickGame,
};
