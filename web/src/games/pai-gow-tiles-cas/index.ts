import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-pai-gow-tiles-cas-primary"]', pulses: 3 } : null);
export const paiGowTilesCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "pai-gow-tiles-cas",
  title: "Pai Gow Tiles (Casino)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Chinese pai-gow with thirty-two-tile dominoes.",
  howToPlay: "Pai Gow Tiles is the original Chinese pai-gow played with thirty-two domino tiles (not cards). Players receive four tiles and split them into a high pair and a low pair against a banker. The tiles are ranked by traditional Chinese pairs (Gee Joon, Teen, Day, etc.) which take many years to master.\n\nIn this single-player adaptation we abstract the tile rankings into seeded high-low scores. You play twelve rounds against the banker. Press Play each round to deal a four-tile hand for both you and the banker; the engine auto-splits optimally. Winning both pairs pays eight; pushing one and winning one pays three; both push pays one; losing pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to ninety. Pai Gow Tiles is one of the oldest casino-table games still in regular play, dating to the Song Dynasty. The tile rankings are deeply traditional and the game is slow-paced and meditative. Push more often than win or lose.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint, component: CasGame,
};
