import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DamaTurkishGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const damaTurkishPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "dama-turkish",
  title: "Dama (Turkish)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish Dama — orthogonal moves and captures. Place vs random CPU.",
  howToPlay: "Dama is the traditional Turkish form of Draughts, played on an 8x8 board where pieces move and capture orthogonally (forward, left, right) rather than diagonally — a major departure from European Checkers. Promoted dama (kings) move any distance along ranks and files. In this compact placement variant, those orthogonal mechanics are streamlined.\n\nClick any empty cell to place a P piece. If your new P piece sits orthogonally adjacent to a C piece with another P directly past it (orthogonal sandwich), that C is captured and removed. After you move, a random CPU places a C piece that may symmetrically capture P pieces along ranks or files.\n\nGameplay lasts up to 22 moves or until one side has no remaining pieces. You earn 100 points for eliminating all CPU pieces, 50 for ending with more pieces, 25 for a tie, and 4 points per surviving P piece. Orthogonal capture geometry rewards control of full rows and columns rather than diagonal lanes — guard your axis lines and seek orthogonal sandwich opportunities along the edges.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".dtk-board")) ? { selector: ".dtk-board", pulses: 3 } : null,
  component: DamaTurkishGame,
};
