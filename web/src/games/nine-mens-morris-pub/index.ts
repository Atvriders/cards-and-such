import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NineMensMorrisPubState, NineMensMorrisPubAction, NineMensMorrisPubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NineMensMorrisPubGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const nineMensMorrisPubPlugin: GamePlugin<NineMensMorrisPubState, NineMensMorrisPubAction, typeof settings> = {
  id: "nine-mens-morris-pub",
  title: "Nine Men's Morris Pub",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nine Men's Morris: place and slide men to form 3-in-a-row mills; capture and reduce opponent.",
  howToPlay: "Nine Men's Morris Pub is a real, dice-driven simulation. Nine Men's Morris: place and slide men to form 3-in-a-row mills; capture and reduce opponent.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NineMensMorrisPubSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-nine-mens-morris-pub-action"]', pulses: 3 }; },
  component: NineMensMorrisPubGame,
};
