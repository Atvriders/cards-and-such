import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type IdleMinerState, type IdleMinerAction } from "./state.js";
import { IdleMiner } from "./IdleMiner.js";

export const idleMinerSettings = {
  depth: { kind: "enum" as const, label: "Mine Depth", options: ["10", "25", "50"] as const, default: "10" as const },
} as const;

export const idleMinerPlugin: GamePlugin<IdleMinerState, IdleMinerAction, typeof idleMinerSettings> = {
  id: "idle-miner",
  title: "Idle Miner",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dig for gold, hire miners, reach the bottom of the mine.",
  howToPlay: `Idle Miner puts you in charge of a tiny mine. Your goal is to dig down to a target depth — 10, 25, or 50 levels depending on the setting you choose.

Click the pickaxe button to dig one level deeper and earn gold. Each dig earns gold based on your current pick power, and there's a 10% chance of hitting a rich vein that doubles the haul for that dig.

Spend your gold to hire Auto Miners. Each hired miner digs one level per second automatically and also increases your click power by 1. Auto miners stack: two miners dig two levels per second and give you 2 bonus power per click.

The key strategy is timing your first hire. The sooner you hire your first miner, the faster the passive income kicks in. But don't wait too long to hire the second — the cost doubles each time.

Watch the depth progress bar fill up. When you reach the target depth, the game ends. Your score is calculated from total gold collected and depth reached. A skilled miner balances active clicking with smart hiring.

Tip: hire as early as possible. Passive income compounds quickly.`,
  settings: idleMinerSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".im-mine-btn", pulses: 3 }),
  component: IdleMiner,
};
