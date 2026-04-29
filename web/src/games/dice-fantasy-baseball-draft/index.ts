import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFantasyBaseballDraftState, DiceFantasyBaseballDraftStateAction, DiceFantasyBaseballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFantasyBaseballDraftGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFantasyBaseballDraftPlugin: GamePlugin<DiceFantasyBaseballDraftState, DiceFantasyBaseballDraftStateAction, typeof settings> = {
  id: "dice-fantasy-baseball-draft", title: "Dice Fantasy Baseball Draft", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Auction draft fantasy baseball; weekly stats.",
  howToPlay: "Dice Fantasy Baseball Draft models a season-long fantasy baseball league with auction drafting. Players bid for stars, fill out rosters, and track HR, RBI, R, SB, AVG hitting categories plus W, K, ERA, WHIP, SV pitching categories. Weekly head-to-head battles play out over a 22-week regular season.\n\nThis dice-only sim treats each round as one fantasy week. Each round, you Roll three dice. Outcomes: triple (sweep week +12), sum >= 14 (winning week +8), sum <= 6 (losing week, opp +8), otherwise tied week (+4 each).\n\nGame ends at 80 your points or 15 rounds. Final score formula: 80 + (2 × your points) - (1 × opponent points) + (3 × rounds remaining if you finish early). Fantasy baseball is a marathon — weekly variance smooths out, but injuries and trades reshape rosters. Average runs 130 to 180. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceFantasyBaseballDraftSettings),
  reducer, isTerminal, component: DiceFantasyBaseballDraftGame,
};
