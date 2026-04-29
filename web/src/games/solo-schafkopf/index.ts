import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SoloSchafkopfGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const soloSchafkopfPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "solo-schafkopf",
  title: "Solo Schafkopf",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Schafkopf solo contract played alone against three (here 1v1).",
  howToPlay: "Solo Schafkopf is the most demanding contract of Bavarian Schafkopf: the declarer plays alone against the three other players, picking a single suit as trump. This 1v1 simulator distills the contract: you are the soloist, the bot represents the unified opposition, and clubs are trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card wins. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take six or more of the ten tricks dealt. Solo Schafkopf is famously punishing — the soloist must come into the round with strong cards. Trump density, plus the trump ace and at least one side-suit ace, gives a workable solo. The bot plays a measured defense. Click any legal card; the bot answers immediately. Solo Schafkopf rewards seeds where trumps concentrate on your side and the bot's hand is starved of high cards.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: SoloSchafkopfGame,
};
