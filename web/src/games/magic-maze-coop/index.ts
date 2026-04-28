import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazeCoopState, MagicMazeCoopAction, MagicMazeCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MagicMazeCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const magicMazeCoopPlugin: GamePlugin<MagicMazeCoopState, MagicMazeCoopAction, typeof settings> = {
  id: "magic-maze-coop",
  title: "Magic Maze Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative real-time inspired homage — silent mall-shopping team.",
  howToPlay: "Magic Maze Co-op tributes Sit Down's real-time silent cooperative. In Magic Maze, players each control one direction of movement and must navigate four pawns through a shopping mall — all without speaking. Here, the silent team-up becomes a 10-round dice challenge. You and an AI ally pool rolls to grab loot and escape. Reach 70 to win and earn a 50-point bonus.\n\nPress Play Round each turn. Both dice resolve and their sum joins your team score. Press Next Round to continue, Finish on round 10.\n\nThe full Magic Maze adds an hourglass timer that resets when pawns step on red tiles, and a strict no-speaking rule that creates hilarious panic. This solo homage trades real-time pressure for round-based pacing while keeping the cooperative essence: every action serves both players.\n\nThe Maximum Security expansion adds prison-heist scenarios. This version keeps it clean and focused: shop, escape, score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicMazeCoopSettings),
  reducer, isTerminal, component: MagicMazeCoopGame,
};
