import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type {
  PandemicSoloFullState,
  PandemicSoloFullAction,
  PandemicSoloFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal, curesCount } from "./state.js";

const PandemicSoloFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.PandemicSoloFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["introductory", "standard", "heroic"] as const,
    default: "standard" as const,
  },
  roleCount: {
    kind: "number" as const,
    label: "Roles in Play",
    min: 2,
    max: 4,
    step: 1,
    default: 2,
  },
} as const;

type Settings = {
  difficulty: "introductory" | "standard" | "heroic";
  roleCount: number;
};

function normalize(s: Settings): PandemicSoloFullSettings {
  const rc = (s.roleCount < 2 ? 2 : s.roleCount > 4 ? 4 : s.roleCount) as 2 | 3 | 4;
  return { difficulty: s.difficulty, roleCount: rc };
}

export const pandemicSoloFullPlugin: GamePlugin<
  PandemicSoloFullState,
  PandemicSoloFullAction,
  typeof settings
> = {
  id: "pandemic-solo-full",
  title: "Pandemic (Solo, Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Solo Pandemic: one human commands 2–4 cooperating roles to cure four diseases before outbreaks overwhelm the world.",
  howToPlay: `You command 2 to 4 disease-fighting specialists on a single team — every pawn is YOU. On each turn, the active role spends 4 actions, then draws 2 player cards, then infects cities at the current rate. Win by curing all four diseases. Lose if the world racks up 8 outbreaks, runs out of any one cube color, or you run out of player cards.

Actions (pick any combo of 4 per turn):
  - Drive/Ferry: move to an adjacent city.
  - Direct Flight: discard a city card to fly to that city.
  - Charter Flight: discard your current city's card to fly anywhere.
  - Shuttle Flight: move between two research stations.
  - Build a Research Station: discard your current city's card (start at Atlanta).
  - Treat Disease: remove 1 cube of one color from your city. If that disease is cured, OR your role is the Medic, remove ALL cubes of that color.
  - Share Knowledge: pass the current-city player card between two roles standing in that city.
  - Discover a Cure: at a research station, discard 5 same-color city cards. The Scientist only needs 4.
  - Pass: end this turn's remaining actions.

You can swap which role is acting at any time during the action phase — pick the right specialist for the job. Roles include Medic (auto-treat) and Scientist (4-card cures); other roles play with standard powers only.

Difficulty controls how many Epidemic cards are shuffled into the deck:
  - Introductory: 4 epidemics
  - Standard: 5 epidemics
  - Heroic: 6 epidemics

When you draw an Epidemic: the infection rate ticks up, the bottom infection card gets 3 cubes, and the infection discard reshuffles on top — recent hotspots will reinfect.

Advanced rules omitted (L tier): event card effects (the 5 events draw as normal but have no special powers), strict eradication / hand-size limits, and roles beyond Medic + Scientist use baseline turn rules.`,
  settings,
  initialState: (seed: number, s) => initialState(seed, normalize(s as Settings)),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase !== "action") return null;
    const active = state.pawns[state.current];
    if (!active) return null;
    // Suggest curing first if possible.
    const need = active.role === "scientist" ? 4 : 5;
    for (const color of ["blue", "yellow", "black", "red"] as const) {
      if (state.cured[color]) continue;
      const matches = active.hand.filter((c) => c.kind === "city" && (
        state.cityCubes // dummy guard
      )).length;
      void matches;
      const cards = active.hand.filter((c) => c.kind === "city").length;
      void cards;
      const sameColor = active.hand.filter(
        (c) => c.kind === "city" && c.cityId >= 0 && (
          (color === "blue" && c.cityId < 12) ||
          (color === "yellow" && c.cityId >= 12 && c.cityId < 24) ||
          (color === "black" && c.cityId >= 24 && c.cityId < 36) ||
          (color === "red" && c.cityId >= 36)
        ),
      ).length;
      if (sameColor >= need && state.stations.includes(active.cityId)) {
        return { selector: '[data-testid="psf-action-cure"]', pulses: 3 };
      }
    }
    // Suggest treating if cubes are in current city.
    const here = state.cityCubes[active.cityId]!;
    const cubesHere = (here[0] ?? 0) + (here[1] ?? 0) + (here[2] ?? 0) + (here[3] ?? 0);
    if (cubesHere > 0) {
      return { selector: '[data-testid="psf-action-treat"]', pulses: 3 };
    }
    // Default — pass.
    if (curesCount(state) === 4) return null;
    return { selector: '[data-testid="psf-action-pass"]', pulses: 3 };
  },
  component: PandemicSoloFull,
};
