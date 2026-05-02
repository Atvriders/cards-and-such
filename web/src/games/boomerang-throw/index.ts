import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoomerangThrowState, BoomerangThrowAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BoomerangThrow } from "./BoomerangThrow.js";

export const boomerangThrowSettings = {} as const;

type BTSettingsType = SettingsOf<typeof boomerangThrowSettings>;

export const boomerangThrowPlugin: GamePlugin<BoomerangThrowState, BoomerangThrowAction, typeof boomerangThrowSettings> = {
  id: "boomerang-throw",
  title: "Boomerang Throw",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Throw a boomerang with the right power and catch it on the return!",
  howToPlay: `Boomerang Throw is a two-phase skill game played over eight rounds. Each round, you first charge and throw, then time a catch as the boomerang returns.

Phase 1 — Charging: Watch the power bar sweep back and forth. Higher power sends the boomerang on a wider, faster arc. Medium power (40–70%) is usually the best balance between control and catch difficulty. Press Space or click Throw when you're happy with the charge level.

Phase 2 — Catching: Once the boomerang completes its arc and starts returning, a catch-timing indicator begins oscillating. The green zone in the center of the bar marks the perfect catch window. Press Space or click Catch when the indicator is inside the green zone. Catching perfectly awards up to 100 bonus points, while a late or early catch still scores partial credit.

Missing a catch entirely earns no points but does not end the game — you continue to the next round. Successfully catching earns a growing bonus for each consecutive catch in a row.

Tips: The charge power you choose affects the boomerang's flight speed, which in turn affects how quickly the catch indicator sweeps. Practice with medium charge first to learn the timing before experimenting with high power throws.`,
  settings: boomerangThrowSettings,
  initialState: (_seed: number, _settings: BTSettingsType) => initialState(),
  reducer,
  isTerminal,
    hint: (state: BoomerangThrowState) => {
      if (state.phase === "gameover") return null;
      return { selector: '[data-testid="hint-target-boomerang-throw-action"]', pulses: 3 };
    },
  component: BoomerangThrow,
};
