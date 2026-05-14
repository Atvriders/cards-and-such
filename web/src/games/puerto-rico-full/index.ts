import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type {
  PuertoRicoState,
  PuertoRicoAction,
  PuertoRicoSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const PuertoRicoFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.PuertoRicoFullGame as unknown as React.ComponentType<unknown>,
  }))
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_", default: false },
} as const;

export const puertoRicoFullPlugin: GamePlugin<
  PuertoRicoState,
  PuertoRicoAction,
  typeof settings
> = {
  id: "puerto-rico-full",
  title: "Puerto Rico (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Plantation-economy role-selection: pick a role, all players act, you get the bonus. Most VP wins.",
  howToPlay: `Puerto Rico (minimal viable, XL tier): you play seat 0 against three CPUs. Each round, players take turns choosing a Role tile. The active player triggers the role action for everyone (round-robin starting with them) but the picker gets a bonus.

Roles:
  - Settler: each player draws a random plantation (crop). 12 plantation slots.
  - Mayor: distribute colonists from the supply (auto-staffs your plantations first, then buildings). Picker takes one extra.
  - Builder: each player may purchase one building (paying doubloons). Picker gets a 1-doubloon discount.
  - Craftsman: every staffed plantation produces one good of its crop. Picker takes 1 extra good of any crop they make.
  - Trader: each player may sell one good for doubloons (corn 0, indigo 1, sugar 2, tobacco 3, coffee 4). Picker earns +1.
  - Captain: round-robin ship goods to one of three ships (capacities 4/5/6). 1 VP per good shipped. Picker gets +1 VP first. Goods on full ships return to supply; unshipped excess spoils at end of phase (warehouses save a type each).
  - Prospector: picker takes 1 doubloon, nobody else does anything.

End-of-round: any role tile not picked this round gets +1 doubloon (bonus for next picker). The governor passes left.

Endgame triggers (XL simplified): any player fills all 12 building slots, the colonist supply empties, or total shipping VP reaches 40. Highest total VP wins (buildings + shipping VP).

Advanced rules omitted (XL): large buildings + their end-game powers (Guild Hall / Residence / Fortress / Customs House / City Hall), production-building gating (corn is fine, but small/large indigo plants, sugar/tobacco/coffee plants are not required to produce), Hospice / University staffing bonuses, harbor / wharf shipping powers, quarry discounts, plantation tile market (we draw random), and manual colonist placement. The CPU is a greedy heuristic: it picks the role that scores highest for itself (most doubloons earnable, most goods shippable, most VP buyable).`,
  settings,
  initialState: (seed: number, s: PuertoRicoSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "select_role" && state.governor === 0) {
      return { selector: '[data-testid="pr-roles"]', pulses: 3 };
    }
    if (state.phase === "resolve_builder" && state.resolveOrder[state.resolveIndex] === 0) {
      return { selector: '[data-testid="pr-builder"]', pulses: 3 };
    }
    if (state.phase === "resolve_trader" && state.resolveOrder[state.resolveIndex] === 0) {
      return { selector: '[data-testid="pr-trader"]', pulses: 3 };
    }
    if (state.phase === "resolve_captain" && state.resolveOrder[state.resolveIndex] === 0) {
      return { selector: '[data-testid="pr-captain"]', pulses: 3 };
    }
    return null;
  },
  component: PuertoRicoFull,
};
