import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FishFeederState, FishFeederAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FishFeeder } from "./FishFeeder.js";

export const fishFeederSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type FishFeederSettingsType = SettingsOf<typeof fishFeederSettings>;

export const fishFeederPlugin: GamePlugin<FishFeederState, FishFeederAction, typeof fishFeederSettings> = {
  id: "fish-feeder",
  title: "Fish Feeder",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eat smaller fish to grow. Avoid bigger ones or you will be swallowed whole.",
  howToPlay: `You are a fish in a crowded ocean. Eat smaller fish to grow larger — but stay away from any fish bigger than yourself, or the game ends immediately.

Guide your fish by moving your mouse (or dragging your finger on touch screens) across the blue ocean. Your fish follows the cursor. Swim into smaller fish to eat them and earn points. The more fish you eat, the bigger you become, and the more fish you can safely attack.

Every eaten fish earns points proportional to its size. As you grow, you can tackle larger prey, but the ocean also generates bigger predators to keep things dangerous. The goal is to survive as long as possible while building the highest score.

Three difficulty settings change fish speed and aggression: Easy gives slow-moving fish with time to react; Hard produces quick fish that converge rapidly. Size is shown as a percentage in the HUD — watch it climb as you eat.

Tips: Target fish that are clearly smaller than you and coming from the side. Never chase a large fish head-on. Circle around to attack from behind. Stay away from the edges of the screen where you can get cornered.`,
  settings: fishFeederSettings,
  initialState: (seed: number, settings: FishFeederSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".ff-player", pulses: 3 }; },
  component: FishFeeder,
};
