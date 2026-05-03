import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { hanabiDeluxeCoopState, hanabiDeluxeCoopAction, hanabiDeluxeCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { hanabiDeluxeCoopGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hanabiDeluxeCoopPlugin: GamePlugin<hanabiDeluxeCoopState, hanabiDeluxeCoopAction, typeof settings> = {
  id: "hanabi-deluxe-coop",
  title: "Hanabi Deluxe",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Premium Hanabi — cooperative firework-stacking across ten rounds.",
  howToPlay: "Hanabi Deluxe is the premium-edition Hanabi distilled to ten cooperative dice rounds. You and your AI partner light fireworks in five colours by playing perfectly-ordered cards — here represented as dice rolls accumulating into a shared score.\n\nEach round, press Play Round. Two dice tumble; their sum (2-12) joins your firework display score. Press Next Round to advance, Finish on round ten.\n\nThe firework finale target is 70. Reach it and the sky bursts with the +50 Grand Finale bonus. Miss it and the show ends quietly, with reasonable applause.\n\nThe original Hanabi (and the Deluxe edition) has colour-and-number cards, cooperative clue-giving, and limited information sharing. This distillation captures the cooperative-by-rolling tension without the unique reverse-information mechanic — a poor substitute for the original's elegance, but a quick way to feel the cooperation. Average runs land near 70; lucky duos push 80+; star-crossed displays stall at 60.\n\nPress play, light the fuse, and watch the sky.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as hanabiDeluxeCoopSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-hanabi-deluxe-coop-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-hanabi-deluxe-coop-next"]', pulses: 3 };
    return null;
  },
  component: hanabiDeluxeCoopGame,
};
