import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HotTakeState, HotTakeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HotTake } from "./Game.js";

export const hotTakeSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
} as const;

type HotTakeSettingsType = SettingsOf<typeof hotTakeSettings>;

export const hotTakePlugin: GamePlugin<HotTakeState, HotTakeAction, typeof hotTakeSettings> = {
  id: "hot-take",
  title: "Hot Take",
  category: "cards",
  players: { min: 2, max: 20, multiplayer: false },
  description: "Controversial opinions served hot — agree, disagree, debate!",
  howToPlay: `Hot Take serves up spicy opinions one at a time. Each card shows a bold, controversial statement — "Pineapple belongs on pizza," "The book is never better than the movie," or "Running is the most boring form of exercise."

Players read the statement and vote Agree or Disagree. But the real fun is the debate that follows before anyone votes.

How to play: read the hot take out loud. Everyone argues their position for 30 seconds to a minute. Then each person votes — Agree or Disagree — either simultaneously or by tapping the screen one at a time.

See who holds the most contrarian views in your group. Track which takes split the room 50/50 versus unanimous landslides. Use the Skip button for takes where nobody has a strong opinion.

The game tracks how many takes you agreed with personally. Your score reflects how many you sided with — whether that makes you mainstream or delightfully contrary is for your group to decide.

Works brilliantly as a dinner party conversation starter. Pair with beverages for maximum effect.`,
  settings: hotTakeSettings,
  initialState: (seed: number, settings: HotTakeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: HotTake,
};
