import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BowlingCandlepinState, BowlingCandlepinAction, BowlingCandlepinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BowlingCandlepinGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const bowlingCandlepinPlugin: GamePlugin<BowlingCandlepinState, BowlingCandlepinAction, typeof settings> = {
  id: "bowling-candlepin",
  title: "Candlepin Bowling",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Candlepin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.',
  howToPlay: 'Candlepin Bowling is a real, dice-driven simulation. Candlepin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BowlingCandlepinSettings),
  reducer,
  isTerminal,
  component: BowlingCandlepinGame,
};
