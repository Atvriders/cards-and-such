import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RamschSkatGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const ramschSkatPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "ramsch-skat",
  title: "Ramsch",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Anti-trick Skat side game where lowest score wins.",
  howToPlay: "Ramsch is the 'rubbish' Skat side-game traditionally played when no one bids: the goal inverts to taking as FEW points as possible. In this 1v1 misère simulator you and the bot each receive ten cards (echoing Skat's 32-card foundation, halved per player). No trump applies.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only led-suit cards can win the trick (since there is no trump in this Ramsch variant). The highest card of the led suit wins — ace high, then king, queen, jack, ten through two.\n\nWin by taking four or fewer of the ten tricks (six or more for the bot). Ramsch strategy inverts trick play: dump high cards onto bot-led tricks, save low cards for forced leads, and never capture an ace if you can avoid it. The bot plays its standard defensive baseline, occasionally accidentally helping you. Click any legal card; the bot answers immediately.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: RamschSkatGame,
};
