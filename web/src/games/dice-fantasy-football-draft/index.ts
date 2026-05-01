import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFantasyFootballDraftState, DiceFantasyFootballDraftAction, DiceFantasyFootballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFantasyFootballDraftGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFantasyFootballDraftPlugin: GamePlugin<DiceFantasyFootballDraftState, DiceFantasyFootballDraftAction, typeof settings> = {
  id: "dice-fantasy-football-draft",
  title: "Fantasy Football Draft",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Fantasy Football Draft: draft 8 picks; build the highest-rated roster.',
  howToPlay: 'Fantasy Football Draft is a real, dice-driven simulation. Fantasy Football Draft: draft 8 picks; build the highest-rated roster.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFantasyFootballDraftSettings),
  reducer,
  isTerminal,
  component: DiceFantasyFootballDraftGame,
};
