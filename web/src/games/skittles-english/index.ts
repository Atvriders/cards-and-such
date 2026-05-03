import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkittlesEnglishState, SkittlesEnglishAction, SkittlesEnglishSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkittlesEnglishGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesEnglishPlugin: GamePlugin<SkittlesEnglishState, SkittlesEnglishAction, typeof settings> = {
  id: "skittles-english",
  title: "English Skittles",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'English Skittles: 2-die rolls = pins; classic strike/spare scoring across 8 frames.',
  howToPlay: 'English Skittles is a real, dice-driven simulation. English Skittles: 2-die rolls = pins; classic strike/spare scoring across 8 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkittlesEnglishSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-skittles-english-action"]', pulses: 3 }; },
  component: SkittlesEnglishGame,
};
