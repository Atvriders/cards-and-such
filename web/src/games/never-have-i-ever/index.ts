import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NHIEState, NHIEAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NeverHaveIEver } from "./Game.js";

export const neverHaveIEverSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["all-ages", "adult"] as const,
    default: "all-ages" as const,
  },
} as const;

type NHIESettingsType = SettingsOf<typeof neverHaveIEverSettings>;

export const neverHaveIEverPlugin: GamePlugin<NHIEState, NHIEAction, typeof neverHaveIEverSettings> = {
  id: "never-have-i-ever",
  title: "Never Have I Ever",
  category: "cards",
  players: { min: 2, max: 10, multiplayer: false },
  description: "Classic party card game — tap if you've done it!",
  howToPlay: `Never Have I Ever is the classic party icebreaker. One player reads the statement on screen. Anyone in the group who HAS done that thing raises their hand (or takes a sip if playing the drinking version). Anyone who has NEVER done it stays still.

Tap "I've Done It!" if the statement applies to you, or "Never!" if it does not. The game tracks how many statements applied to you over the session.

This is best played as a group: pass the device around or prop it up so everyone can read the screen. After each statement, discuss! The best part is the stories people share when they admit to something embarrassing or wild.

The All Ages mode keeps statements light and fun. Adult mode adds a few edgier statements for grown-up groups.

There is no winner or loser — the score simply reflects how many of the statements applied to you. The real prize is the laughter and revelations along the way. Choose 10, 20, or 30 rounds depending on how long you want to play.`,
  settings: neverHaveIEverSettings,
  initialState: (seed: number, settings: NHIESettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: NeverHaveIEver,
};
