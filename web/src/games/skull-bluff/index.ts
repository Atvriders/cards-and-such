import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkullBluffState, SkullBluffAction, SkullBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkullBluffGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const skullBluffPlugin: GamePlugin<SkullBluffState, SkullBluffAction, typeof settings> = {
  id: "skull-bluff",
  title: "Skull Bluff",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Solo Skull: CPU places a tile claiming flower, you decide if it's actually a skull.`,
  howToPlay: `Skull (originally "Skull and Roses") is a coaster-flipping bluff game. Players secretly place flower or skull discs face-down. Bidding the flowers safely without flipping a skull wins the round.

In this solo adaptation, each round the CPU silently places a single coaster face-down and tells you "I placed a flower." You decide whether to trust (it really is a flower, safe) or to call bluff (it's actually a skull and the CPU is lying).

The CPU's body language is your only tell. Confident body language tends to mean a flower. Hesitation hints at a skull bluff — but skilled CPUs invert the tells.

Each correct decision scores 100 points across ten rounds. A perfect 1000 means you've read every coaster like a Vegas pro.

Tips: in real Skull, players bluff aggressively when low on tiles. Lean slightly toward trusting calm bids and calling nervous bids, but don't get stuck in patterns — the CPU adapts seed-by-seed.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkullBluffSettings),
  reducer,
  isTerminal,
  component: SkullBluffGame,
};
