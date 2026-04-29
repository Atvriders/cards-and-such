import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UltiHungarianGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const ultiHungarianPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "ulti-hungarian",
  title: "Ulti",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hungarian 32-card tarock-style trick game with named contracts.",
  howToPlay: "Ulti is the Hungarian national tarock-style game traditionally played with a 32-card pack and named contracts (such as 'ulti', 'durchmars', and 'betli'). This 1v1 simulator captures Ulti's trump-driven trick play: ten cards each, clubs as trump.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card wins. Ace is high, then king, queen, jack, ten through two.\n\nWin if you take six or more of the ten tricks. Ulti's named contracts are abstracted into a single trick-count goal here, but the trump-strategy feel is preserved: hold trumps for late-round dominance, time aces in side suits to break bot leads, and watch which suits the bot voids itself in. The bot plays a measured defense. Click any legal card; the bot answers immediately. Trump-rich Ulti seeds tend toward decisive wins.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: UltiHungarianGame,
};
