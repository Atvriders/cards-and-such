import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TarokyGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const tarokyPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "taroky",
  title: "Taroky",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Czech national tarock with strong partnership trick play.",
  howToPlay: "Taroky is the Czech national tarock game, traditionally a four-player partnership played with the 54-card Tarot pack including the famous trump series. This 1v1 simulator distills it into a thirteen-card trick-taking duel; clubs serve as the simplified trump suit (standing in for the trump-card series).\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card takes the trick. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take eight or more of the thirteen tricks dealt. Taroky's classic partnership signaling is abstracted into a clean solo-vs-bot setup, but the trump-management depth remains: a good Taroky seed has at least four trumps and an ace or two in side suits. The bot plays a measured defense. Click any legal card; the bot answers immediately. Taroky rewards patient trick-management.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: TarokyGame,
};
