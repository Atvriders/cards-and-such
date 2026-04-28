import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuoitsTossState, QuoitsTossAction, QuoitsTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuoitsTossGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quoitsTossPlugin: GamePlugin<QuoitsTossState, QuoitsTossAction, typeof settings> = {
  id: "quoits-toss",
  title: "Quoits Toss",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ring throw at iron hob. Closest ring or ringer scores.",
  howToPlay: "Quoits Toss is the traditional British ring-throwing pub game. You stand 18 feet from an iron hob (a metal stake) and throw a flat metal quoit at it. A 'ringer' (the quoit lands over the hob) scores three points; nearest-quoit-to-hob otherwise scores one. In this digital version, each turn you press Throw and a precision-roll determines the result: 5% perfect ringer (20 points), descending tiers to an outright miss (0 points). Across ten throws, the typical total is 60-90 with great runs above 130. Press Next after each throw. The original pub game is played on clay or sand pitches and requires real arm strength, quoits weigh 3-5 pounds. The digital version preserves the rhythm of quoit-after-quoit thrown into a ringing iron hob with the same rare bullseye thrill of a real-world ringer.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuoitsTossSettings),
  reducer,
  isTerminal,
  component: QuoitsTossGame,
};
