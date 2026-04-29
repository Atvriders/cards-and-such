import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingdominoGiantsState, KingdominoGiantsAction, KingdominoGiantsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingdominoGiantsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kingdominoGiantsPlugin: GamePlugin<KingdominoGiantsState, KingdominoGiantsAction, typeof settings> = {
  id: "kingdomino-giants",
  title: "Kingdomino: Age of Giants",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Giant meeples roam Kingdomino terrain with crown-displacement scoring.",
  howToPlay: "Kingdomino: Age of Giants adds giant meeples that displace crowns and shift scoring. In this adaptation you place 16 themed tiles on a 5x5 grid: giants, wheat, forest, mountain, and sea. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-type tile. Giant tiles thematically threaten crowns but here they form their own scoring cluster — group giants together for an adjacency bonanza. Other terrain follows the classic Kingdomino rule: cluster same-type tiles for big payoffs. Plan placements ahead by checking the next tile in the queue. After all 16 tiles are placed the game finalises including every adjacency bonus. A typical score is 28-38 points; an excellent clusterer reaches 45+. Random queues provide replay variety.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingdominoGiantsSettings),
  reducer,
  isTerminal,
  component: KingdominoGiantsGame,
};
