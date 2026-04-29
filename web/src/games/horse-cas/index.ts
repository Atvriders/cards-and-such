import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const horseCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "horse-cas",
  title: "HORSE (Casino)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mix of Hold'em, Omaha Hi-Lo, Razz, Stud, Stud Hi-Lo.",
  howToPlay: "HORSE is the classic five-game mixed-poker rotation where each round changes variant: Hold'em, Omaha Hi-Lo, Razz, Stud, Stud Hi-Lo. Each variant requires different strategy and HORSE players must master five at once.\n\nIn this single-player adaptation you play fifteen rounds against the dealer, with each round randomly drawing one of the five variants. Press Play each round to deal a hand and resolve the variant. The engine picks a winning side and pays accordingly: a clear win pays ten, a tie pays four, a loss pays zero, with bonus four for each Hi-Lo scoop. Press Next after each result.\n\nExpected score across fifteen rounds is sixty to one hundred fifty. HORSE was the World Series of Poker's main mixed-game championship from 2006 onward, replaced by Eight-Game and Ten-Game later. The variant rewards balanced players who can pivot between draw and stud quickly. Watch the variant indicator each round and adjust your reading.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  component: CasGame,
};
