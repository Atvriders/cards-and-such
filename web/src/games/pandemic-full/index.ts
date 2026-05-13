import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicFullState, PandemicFullAction, PandemicFullSettings } from "./state.js";
import { initialState, reducer, isTerminal, currentPawn, totalCubesInCity, CITIES } from "./state.js";

const PandemicFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.PandemicFull as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["Introductory", "Standard", "Heroic"] as const,
    default: "Standard" as const,
  },
  numRoles: {
    kind: "number" as const,
    label: "Number of roles",
    min: 2,
    max: 3,
    step: 1,
    default: 2,
  },
} as const;

type S = SettingsOf<typeof settings>;

function toSettings(s: S): PandemicFullSettings {
  const n = s.numRoles === 3 ? 3 : 2;
  return { difficulty: s.difficulty, numRoles: n };
}

export const pandemicFullPlugin: GamePlugin<PandemicFullState, PandemicFullAction, typeof settings> = {
  id: "pandemic-full",
  title: "Pandemic (Full Cooperative)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative disease-eradication race: research cures for 4 outbreaks before the world tips into chaos.",
  howToPlay: `Pandemic — full cooperative. You solo-control 2 or 3 randomly-dealt roles and rotate which role acts each turn. On your turn the active role takes up to 4 actions, then draws 2 player cards (some are Epidemics), then draws infection cards equal to the current infection rate.

Actions (any combination, up to 4):
  • Drive/Ferry — move to an adjacent city.
  • Direct Flight — discard a city card to move to that city.
  • Charter Flight — discard the card of the city you are in to fly anywhere.
  • Shuttle Flight — move between two cities that both have a research station.
  • Build Station — discard the matching city card (free for Operations Expert).
  • Treat Disease — remove one cube of one color in your city (Medic removes all; if the disease is cured, any role removes all).
  • Share Knowledge — give/take the matching city card when two pawns share a city. Researcher may share any city card from her hand.
  • Discover Cure — at a research station, discard 5 same-color cards (Scientist needs only 4).
  • Pass — skip remaining actions and end the turn.

Lose if 8 outbreaks occur, the cube supply for any color runs out, or the player deck empties. Win when all 4 diseases are cured. Outbreaks chain — a city with 3 cubes that receives another spawns a cube in every adjacent city, which may chain further.

Roles available: Medic, Scientist, Researcher, Operations Expert, Dispatcher. 2–3 are dealt randomly at game start.

Advanced rules omitted: event cards, Quarantine Specialist and Contingency Planner roles, eradication tokens, and the Operations Expert's discard-to-fly bonus action.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, toSettings(s)),
  reducer,
  isTerminal,
  hint: (state: PandemicFullState): HintTarget | null => {
    if (state.phase === "won" || state.phase === "lost") return null;
    // Suggest treating in the highest-cube city if pawn is there.
    const p = currentPawn(state);
    if (totalCubesInCity(state, p.cityId) > 0) {
      return { selector: `[data-testid="pf-treat-btn"]`, pulses: 3 };
    }
    // Otherwise pulse the first reachable infected adjacent city.
    for (const cityId of (CITIES.map((c) => c.id))) {
      if (totalCubesInCity(state, cityId) >= 2) {
        return { selector: `[data-testid="pf-city-${cityId}"]`, pulses: 3 };
      }
    }
    return { selector: `[data-testid="pf-pass-btn"]`, pulses: 3 };
  },
  component: PandemicFull,
};

export default pandemicFullPlugin;
