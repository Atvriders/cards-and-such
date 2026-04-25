import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PickleJarState, PickleJarAction, PickleJarSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PickleJar } from "./Game.js";

const pickleJarSettings = {
  jars: { kind: "enum" as const, label: "Jars", options: ["3", "5"] as const, default: "3" as const },
} as const;

type PickleJarSettingsType = SettingsOf<typeof pickleJarSettings>;

export const pickleJarPlugin: GamePlugin<PickleJarState, PickleJarAction, typeof pickleJarSettings> = {
  id: "pickle-jar",
  title: "Pickle Jar",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Twist open a stubborn jar! Click in the sweet spot 5 times to open each jar.",
  howToPlay: `Pickle Jar is a rhythmic timing arcade game. Each jar requires 5 successful clicks to open. A meter oscillates back and forth — click when the meter is in the center green zone.

A good click (meter in the 35 to 65 range) advances your progress by one pip and scores 20 points. A bad click (meter outside the zone) sends you back one pip. Fill all 5 pips to open the jar and earn a 50-point bonus.

The oscillation speed varies randomly for each jar — some jars wiggle fast and some wiggle slowly. Time your twists carefully!

After opening a jar, press Next Jar to tackle the next one. Each jar has its own speed, so stay focused.

Use Settings to choose 3 or 5 jars per game. Maximum score with 3 jars is around 450 points — 5 good clicks per jar plus 50 bonus per opened jar. Can you open every jar without a single bad click?`,
  settings: pickleJarSettings,
  initialState: (seed: number, settings: PickleJarSettingsType) => initialState(seed, settings as PickleJarSettings),
  reducer,
  isTerminal,
  component: PickleJar,
};
