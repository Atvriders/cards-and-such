import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const hoseCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "hose-cas",
  title: "HOSE (Casino)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mix of Hold'em, Omaha, Stud, Stud Hi-Lo.",
  howToPlay: "HOSE is a four-variant mixed-poker rotation: Hold'em, Omaha, Stud, Stud Hi-Lo. Like HORSE but without Razz, HOSE is slightly more high-side oriented and is a popular cash-game alternative for mixed-game enthusiasts.\n\nIn this single-player adaptation you play fifteen rounds against the dealer, with each round randomly drawing one of the four variants. Press Play each round to deal a hand and resolve the variant. The engine picks a winning side and pays accordingly: a clear win pays ten, a tie pays four, a loss pays zero, with bonus four for each Hi-Lo scoop. Press Next after each result.\n\nExpected score across fifteen rounds is sixty to one hundred fifty. HOSE strips Razz from HORSE and is consequently less brutal on tight low-only players. The mix rewards players comfortable with both draw and stud and scoop opportunities in Stud Hi-Lo. Track the variant indicator each round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  component: CasGame,
};
