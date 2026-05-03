import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type KeyboardWarriorState, type KeyboardWarriorAction } from "./state.js";
const KeyboardWarrior = /* @__PURE__ */ lazy(() => import("./KeyboardWarrior.js").then((mod) => ({ default: mod.KeyboardWarrior as unknown as React.ComponentType<unknown> })));
export const keyboardWarriorSettings = {
  length: { kind: "enum" as const, label: "Sequence Length", options: ["5", "10", "20"] as const, default: "5" as const },
} as const;

export const keyboardWarriorPlugin: GamePlugin<KeyboardWarriorState, KeyboardWarriorAction, typeof keyboardWarriorSettings> = {
  id: "keyboard-warrior",
  title: "Keyboard Warrior",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Type a random character sequence as accurately as possible.",
  howToPlay: `Keyboard Warrior tests your typing accuracy. A random sequence of letters and digits is displayed. Type each character in order exactly as shown.

Press any key to start the game (or click the Start button). The currently active character blinks so you always know where you are. Type it correctly and it turns green; type the wrong key and it turns red. Either way the game moves on to the next character immediately.

The sequence length depends on your settings: 5, 10, or 20 characters. The characters are randomly generated and include all lowercase letters (a–z) and digits (0–9).

Your score is based on accuracy. A perfect run with no mistakes scores 1000 points. Each error costs 20 points and also reduces your accuracy percentage. Your final score is capped at zero — you can't go negative.

Tips: go slowly and deliberately rather than rushing. It's better to spend an extra half-second finding the right key than to make an error. Errors penalize twice — they cost 20 points directly and reduce your accuracy multiplier.

Try all three difficulty levels: 5 characters is a quick warm-up, 10 is standard, and 20 will really test your focus and stamina.`,
  settings: keyboardWarriorSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-keyboard-warrior-action"]', pulses: 3 }; },
  component: KeyboardWarrior,
};
