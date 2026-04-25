import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BottleSpinState, BottleSpinAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BottleSpin } from "./BottleSpin.js";

export const bottleSpinSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type BottleSpinSettingsType = SettingsOf<typeof bottleSpinSettings>;

export const bottleSpinPlugin: GamePlugin<BottleSpinState, BottleSpinAction, typeof bottleSpinSettings> = {
  id: "bottle-spin",
  title: "Bottle Spin",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin the bottle and stop it in the green zone to score big!",
  howToPlay: `Bottle Spin is a reaction-timing game. A circular board shows a green target zone and a spinning bottle pointer. Your job is to click Spin to set the bottle whirling, then click Stop at exactly the right moment to land it inside the green zone.

The bottle starts fast and gradually slows due to friction — it will eventually stop on its own if you wait too long. Press Stop when you think the pointer is about to enter or is inside the highlighted arc.

Landing in the green zone earns 100 points. Missing scores nothing. A new randomly placed target zone appears each round, so you cannot memorize positions — you must react to where the green zone actually is.

The game runs for 5, 10, or 15 rounds depending on your choice. Maximum score is 100 times the number of rounds. There is skill involved: the bottle moves fastest right after the spin, making early stops risky and unpredictable. Waiting for the bottle to slow down gives you better control but also shortens your window as friction continually narrows the speed range.

Watch the pointer carefully, anticipate the sweep rate, and time your stop decisively. Perfect scores require both patience and sharp reactions!`,
  settings: bottleSpinSettings,
  initialState: (seed: number, settings: BottleSpinSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: BottleSpin,
};
