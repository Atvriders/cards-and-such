import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFantasyBasketballDraftState, DiceFantasyBasketballDraftAction, DiceFantasyBasketballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFantasyBasketballDraftGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFantasyBasketballDraftPlugin: GamePlugin<DiceFantasyBasketballDraftState, DiceFantasyBasketballDraftAction, typeof settings> = {
  id: "dice-fantasy-basketball-draft",
  title: "Fantasy Basketball Draft",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Fantasy Basketball Draft: draft 8 picks; build the highest-rated roster.',
  howToPlay: 'Fantasy Basketball Draft is a real, dice-driven simulation. Fantasy Basketball Draft: draft 8 picks; build the highest-rated roster.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFantasyBasketballDraftSettings),
  reducer,
  isTerminal,
  component: DiceFantasyBasketballDraftGame,
};
