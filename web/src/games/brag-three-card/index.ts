import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BragThreeCardState, BragThreeCardAction, BragThreeCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BragThreeCardGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const bragThreeCardPlugin: GamePlugin<BragThreeCardState, BragThreeCardAction, typeof settings> = {
  id: "brag-three-card",
  title: "Three Card Brag",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Three Card Brag: 3-card hands; classic British rankings (Prial > Run > Flush).',
  howToPlay: 'Three Card Brag is a real, dice-driven simulation. Three Card Brag: 3-card hands; classic British rankings (Prial > Run > Flush).\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BragThreeCardSettings),
  reducer,
  isTerminal,
  component: BragThreeCardGame,
};
