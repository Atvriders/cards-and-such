import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PoeltlNbaState, PoeltlNbaAction, PoeltlNbaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PoeltlNbaGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const poeltlNbaPlugin: GamePlugin<PoeltlNbaState, PoeltlNbaAction, typeof settings> = {
  id: "poeltl-nba", title: "Poeltl NBA", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match NBA players to their team.",
  howToPlay: "Poeltl NBA tests current NBA roster knowledge. Each of fifteen rounds names a player and asks which team they currently play for. Pick from four candidate teams, hit Submit, score ten points. Max 150 points. The pool covers LeBron James (Lakers), Stephen Curry (Warriors), Kevin Durant (Suns), Giannis Antetokounmpo (Bucks), Luka Doncic (Mavericks), Nikola Jokic (Nuggets), Joel Embiid (76ers), Jayson Tatum (Celtics), Devin Booker (Suns), Anthony Davis (Lakers), Jimmy Butler (Heat), Kawhi Leonard (Clippers), Donovan Mitchell (Cavaliers), Trae Young (Hawks), and Ja Morant (Grizzlies) — fifteen stars on early-2024 rosters. NBA fans hit 130+; casual viewers 80-110. The original online Poeltl uses silhouette-and-stats clues; this version tests pure name-team recall. Distractor teams come from the same pool. Hit Submit and Next to advance through all fifteen rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PoeltlNbaSettings),
  reducer, isTerminal, component: PoeltlNbaGame,
};
