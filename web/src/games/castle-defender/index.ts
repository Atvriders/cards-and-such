import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CastleState, CastleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CastleDefender } from "./CastleDefender.js";

export const castleDefenderSettings = {
  waves: {
    kind: "enum" as const,
    label: "Waves",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type CastleDefenderSettingsType = SettingsOf<typeof castleDefenderSettings>;

export const castleDefenderPlugin: GamePlugin<CastleState, CastleAction, typeof castleDefenderSettings> = {
  id: "castle-defender",
  title: "Castle Defender",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hire archers and defend your castle against waves of incoming enemies.",
  howToPlay: `Command a medieval castle under siege. Waves of enemies march from the left toward your castle wall on the right. Your archers fire automatically at the nearest threats — your job is to manage resources and reinforce your defenses in time.

Each enemy that reaches the castle drains 15 HP from your walls. If castle HP reaches zero, the game ends in defeat. Surviving all waves wins.

Killing enemies earns gold (5g each). Use gold to hire additional archers. Each new archer targets a separate enemy, increasing your damage output per wave. Archers are permanent: invest early to handle bigger later waves.

Between waves a "Next Wave" button appears once all enemies are defeated. You receive 20 bonus gold when advancing. Use the gap to hire more archers before the next wave begins.

Later waves send more enemies with higher HP, so plan ahead. Balance buying archers now versus saving gold for upgrades mid-wave. A good opening is to hire a second archer immediately, then a third after wave one's bounty.`,
  settings: castleDefenderSettings,
  initialState: (seed: number, settings: CastleDefenderSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CastleDefender,
};
