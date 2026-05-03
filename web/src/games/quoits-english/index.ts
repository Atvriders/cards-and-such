import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuoitsEnglishState, QuoitsEnglishAction, QuoitsEnglishSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuoitsEnglishGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const quoitsEnglishPlugin: GamePlugin<QuoitsEnglishState, QuoitsEnglishAction, typeof settings> = {
  id: "quoits-english",
  title: "English Quoits",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'English Quoits: throw to score; bag/ring on board = points; race to 21.',
  howToPlay: 'English Quoits is a real, dice-driven simulation. English Quoits: throw to score; bag/ring on board = points; race to 21.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuoitsEnglishSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-quoits-english-action"]', pulses: 3 }; },
  component: QuoitsEnglishGame,
};
