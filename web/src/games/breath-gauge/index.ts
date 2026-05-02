import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type BreathGaugeState, type BreathGaugeAction } from "./state.js";
import { BreathGauge } from "./BreathGauge.js";

export const breathGaugeSettings = {
  target: { kind: "enum" as const, label: "Target Fill", options: ["50", "75", "90"] as const, default: "50" as const },
} as const;

export const breathGaugePlugin: GamePlugin<BreathGaugeState, BreathGaugeAction, typeof breathGaugeSettings> = {
  id: "breath-gauge",
  title: "Breath Gauge",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hold a button to fill a gauge, then release precisely at the target zone.",
  howToPlay: `Breath Gauge is a one-button precision control game. A vertical gauge fills as you hold down the HOLD button. Your goal is to release the button at exactly the right moment — when the fill level hits the yellow target zone.

The yellow band and line show your target zone. Hold too short and you undershot; hold too long and the gauge overfills past the zone. Only releasing inside the yellow zone scores points. The closer to the exact center line, the higher the score — up to 200 points per round.

Play 5 rounds per game. Your total score is the sum of all round scores.

Three difficulty settings change the target fill level and zone width. The 50% target has the widest zone and is the easiest to hit. The 75% target is narrower. The 90% target requires very precise timing — the zone is small and you're near the top of the gauge, so any overshoot spills past it.

Tips: take a breath in slowly and steadily as you hold. Releasing at a consistent pace gives you better control. The gauge fills at a constant rate, so after a few rounds you can develop a feel for the timing. Stay calm — panic makes you release too early or too late.

The game trains fine motor control and mindfulness.`,
  settings: breathGaugeSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-breath-gauge-action"]', pulses: 3 }; },
  component: BreathGauge,
};
