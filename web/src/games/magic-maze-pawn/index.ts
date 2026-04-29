import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicMazePawnState, MagicMazePawnAction, MagicMazePawnSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MagicMazePawnGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const magicMazePawnPlugin: GamePlugin<MagicMazePawnState, MagicMazePawnAction, typeof settings> = {
  id: "magic-maze-pawn",
  title: "Magic Maze: Pawn Whisper",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real-time co-op variant — pawns share one action type, no talking.",
  howToPlay: "Magic Maze: Pawn Whisper is a real-time cooperative variant. You control one direction (north), your AI ally controls another (east); together you guide pawns through a maze under a shared timer. Combined dice over ten rounds represent successful coordination.\n\nPress Play Round to nudge pawns toward exits. Then press Next Round, or Finish on round 10. Hit 60 for the Whisper Bonus.\n\nIn the original Magic Maze, players cannot speak — they tap a wooden pawn to grab attention. This distillation simulates that silent coordination via dice. Your AI partner's choices feel intuitive when rolls align, frustrating when they don't. The maze is shrinking. The clock is ticking. Find every exit.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MagicMazePawnSettings),
  reducer, isTerminal, component: MagicMazePawnGame,
};
