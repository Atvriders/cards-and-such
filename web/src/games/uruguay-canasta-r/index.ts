import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UruguayCanastaRState, UruguayCanastaRAction, UruguayCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UruguayCanastaRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UruguayCanastaRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const uruguayCanastaRPlugin: GamePlugin<UruguayCanastaRState, UruguayCanastaRAction, typeof settings> = {
  id: "uruguay-canasta-r", title: "Uruguay Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Early-cut Canasta variant rewarding fast melds.",
  howToPlay: "Uruguay Canasta is a Canasta variant where players may declare an early cut as soon as they have a single canasta, rather than waiting for full hand-out. The variant rewards aggressive early melding.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into sets and runs each round. Aces count one for value, pip cards face value, faces count ten. A canasta-equivalent (seven-or-more card meld) is worth forty-two points alone.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you take a small consolation. Going out earns thirty bonus.\n\nExpected score across five rounds is sixty to one hundred and five. Uruguay's early-cut philosophy is approximated by the standard scoring — taking your meld early and often is the right strategy in concept and in practice. One long meld plus filler each round drives you to the high end of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UruguayCanastaRSettings),
  reducer, isTerminal, 
  hint: (state: UruguayCanastaRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-uruguay-canasta-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-uruguay-canasta-r-next"]', pulses: 3 };
    return null;
  },
  component: UruguayCanastaRGame,
};
