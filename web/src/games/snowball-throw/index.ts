import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnowballThrowState, SnowballThrowAction, SnowballThrowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnowballThrow } from "./Game.js";

const snowballThrowSettings = {
  throws: { kind: "enum" as const, label: "Throws", options: ["8", "12"] as const, default: "8" as const },
} as const;

type SnowballThrowSettingsType = SettingsOf<typeof snowballThrowSettings>;

export const snowballThrowPlugin: GamePlugin<SnowballThrowState, SnowballThrowAction, typeof snowballThrowSettings> = {
  id: "snowball-throw",
  title: "Snowball Throw",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A snowflake target bounces around the field — click it to hit it with a snowball for big points!",
  howToPlay: `Snowball Throw is a click-the-target arcade game. A snowflake bounces around a blue field, changing direction when it hits the walls. Your job is to click directly on it to throw a snowball.

Click anywhere on the field to throw. If your click lands within the target's hit zone, you score 100 points — a direct hit! If you're close but slightly off, you score 40 consolation points. A wide miss scores zero.

The target moves faster with each new throw, so timing and anticipation become more important as the game progresses. Lead the target — click where it's going, not where it was!

Use Settings to choose 8 or 12 throws per game. Maximum score is 800 or 1,200 with perfect hits every throw.

Watch the target's path, predict where it will be, and click there at just the right moment. A perfect snowball thrower never misses!`,
  settings: snowballThrowSettings,
  initialState: (seed: number, settings: SnowballThrowSettingsType) => initialState(seed, settings as SnowballThrowSettings),
  reducer,
  isTerminal,
    hint: (state: SnowballThrowState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-snowball-throw-action"]', pulses: 3 };
    },
  component: SnowballThrow,
};
