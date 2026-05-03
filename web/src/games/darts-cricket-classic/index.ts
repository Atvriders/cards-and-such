import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartsCricketClassicState, DartsCricketClassicAction, DartsCricketClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DartsCricketClassicGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dartsCricketClassicPlugin: GamePlugin<DartsCricketClassicState, DartsCricketClassicAction, typeof settings> = {
  id: "darts-cricket-classic",
  title: "Classic Cricket Darts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic Cricket Darts: close out 15-20 and bullseye three times each, score on closed numbers.',
  howToPlay: 'Classic Cricket Darts is a real, dice-driven simulation. Classic Cricket Darts: close out 15-20 and bullseye three times each, score on closed numbers.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DartsCricketClassicSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-cricket-classic-action"]', pulses: 3 }; },
  component: DartsCricketClassicGame,
};
