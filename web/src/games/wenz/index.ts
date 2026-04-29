import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WenzGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const wenzPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "wenz",
  title: "Wenz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Schafkopf contract where only Jacks are trump.",
  howToPlay: "Wenz is the Schafkopf solo contract where only the four Jacks form the trump suit. In this 1v1 simulator you and the bot each receive ten cards. No suit-trump applies — instead, jacks (rank 11) effectively dominate when played, since they're high in their own suits and give the player a structural edge.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only led-suit cards can win the trick (the 'jack-trump' nature is reflected by jack rank dominance within suits in this adaptation). The highest card of the led suit wins — ace high, then king, queen, jack, ten through two.\n\nWin if you take five or more of the ten tricks. Wenz rewards seeds with multiple jacks, since each jack dominates its own suit. The bot plays a measured defense, capturing cheaply and dumping otherwise. Click any legal card; the bot responds immediately. Concentrated jack seeds make Wenz a confident, fast-rolling solo win.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: WenzGame,
};
