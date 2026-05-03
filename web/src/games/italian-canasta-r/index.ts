import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ItalianCanastaRState, ItalianCanastaRAction, ItalianCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ItalianCanastaRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ItalianCanastaRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const italianCanastaRPlugin: GamePlugin<ItalianCanastaRState, ItalianCanastaRAction, typeof settings> = {
  id: "italian-canasta-r", title: "Italian Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant where the discard pile is fully accessible.",
  howToPlay: "Italian Canasta is a Canasta variant in which the entire discard pile is accessible at once when taken, producing dramatic round-on-round score swings. The accessibility rewards card counting and timing.\n\nIn this single-player drill, four rounds are played from an eleven-card hand. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more of a rank; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you receive a small consolation. Clearing your hand earns thirty bonus.\n\nExpected score across four rounds is fifty-five to ninety. Italian's open-pile flavour is approximated by the deeper eleven-card hand, giving you broad meld options every round. Two melds per round on average keeps you in the upper band; three melds in any single round is a strong run.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ItalianCanastaRSettings),
  reducer, isTerminal, 
  hint: (state: ItalianCanastaRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-italian-canasta-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-italian-canasta-r-next"]', pulses: 3 };
    return null;
  },
  component: ItalianCanastaRGame,
};
