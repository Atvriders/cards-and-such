import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type IdleBakerState, type IdleBakerAction } from "./state.js";
import { IdleBaker } from "./IdleBaker.js";

export const idleBakerSettings = {
  goal: { kind: "enum" as const, label: "Pastry Goal", options: ["300", "1500", "8000"] as const, default: "300" as const },
} as const;

export const idleBakerPlugin: GamePlugin<IdleBakerState, IdleBakerAction, typeof idleBakerSettings> = {
  id: "idle-baker",
  title: "Idle Baker",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bake pastries, fire up ovens, hire assistants — run the most productive bakery around.",
  howToPlay: `Idle Baker puts you in charge of a small pastry shop with big ambitions. Your goal is to bake a target number of pastries — 300, 1,500, or 8,000 — by working the counter and upgrading your kitchen.

Click the croissant button to bake manually. Each bake produces pastries equal to your Bake Power multiplied by the number of Ovens in your kitchen. Start with one oven and expand to scale up production dramatically.

Buy additional Ovens to multiply your output. Every oven you add increases how many pastries come out of each bake — both manual clicks and passive assistant production. Ovens get more expensive with each purchase.

Hire Assistants to automate your bakery. Each assistant bakes one unit per oven per second automatically, and also increases your base Bake Power by 1. More assistants with more ovens creates an exponentially growing operation.

There is a 7% chance of a Perfect Batch on each manual bake, doubling your output for that round. Watch the progress bar fill as your bakery grows.

Strategy tip: buy your second oven first, then hire assistants. The oven multiplier means every assistant you hire will be twice as effective with two ovens rather than one.`,
  settings: idleBakerSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".ibk-bake-btn", pulses: 3 }),
  component: IdleBaker,
};
