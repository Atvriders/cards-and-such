import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapWellingtonState, NapWellingtonAction, NapWellingtonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapWellingtonGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const napWellingtonPlugin: GamePlugin<NapWellingtonState, NapWellingtonAction, typeof settings> = {
  id: "nap-wellington",
  title: "Nap Wellington",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Nap Wellington: bid for tricks 1-5 plus Wellington (10x) and Blücher (20x) overcalls.',
  howToPlay: 'Nap Wellington is a real, dice-driven simulation. Nap Wellington: bid for tricks 1-5 plus Wellington (10x) and Blücher (20x) overcalls.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NapWellingtonSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-nap-wellington-action"]', pulses: 3 }; },
  component: NapWellingtonGame,
};
