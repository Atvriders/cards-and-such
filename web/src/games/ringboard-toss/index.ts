import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RingboardTossState, RingboardTossAction, RingboardTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RingboardTossGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ringboardTossPlugin: GamePlugin<RingboardTossState, RingboardTossAction, typeof settings> = {
  id: "ringboard-toss",
  title: "Ringboard Toss",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swing rubber ring on string to hook onto board hook.",
  howToPlay: "Ringboard Toss is the classic tavern dexterity game where a rubber ring is swung on a string to hook onto a peg fixed to the wall. A clean catch is satisfying; a near-miss often sends the ring swinging back. In this digital version, each turn you press Swing and a precision-roll resolves the outcome: 5% perfect hook (20 points), descending tiers to a swing-and-miss (0 points). Across ten turns, average totals are 60-90 with strong runs above 130. Press Next after each swing. The traditional pub game requires pure timing, release the ring at the swing's apex for the cleanest arc. The digital version captures the rhythm of swing-and-watch with the same rare bullseye thrill. Score equals total points across ten swings.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RingboardTossSettings),
  reducer,
  isTerminal,
  component: RingboardTossGame,
};
