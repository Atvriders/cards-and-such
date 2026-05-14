import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiGoPartyFullState, SushiGoPartyFullAction, SushiGoPartyFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const SushiGoPartyFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.SushiGoPartyFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "Standard rules", default: true },
} as const;

type S = SettingsOf<typeof settings>;

export const sushiGoPartyFullPlugin: GamePlugin<SushiGoPartyFullState, SushiGoPartyFullAction, typeof settings> = {
  id: "sushi-go-party-full",
  title: "Sushi Go Party (Full)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick-and-pass card drafting — three rounds of sushi, plus puddings.",
  howToPlay:
    "Sushi Go Party is a card-drafting game for four. You play against three CPUs over three rounds of nine cards each. Each turn everybody simultaneously picks one card from their hand, places it face-up in their tableau, then passes the rest to the next player. Once the hand is depleted, the round is scored.\n\n" +
    "Scoring per round:\n" +
    "• Nigiri — Egg=1, Salmon=2, Squid=3 (each Wasabi tripled the next Nigiri placed after it).\n" +
    "• Maki rolls — most rolls wins 6 pts (split on ties), 2nd-most wins 3 pts (only awarded if first place is uncontested).\n" +
    "• Sashimi — 3 = 10 pts (sets of 2 or fewer are worthless).\n" +
    "• Tempura — 2 = 5 pts (singletons worthless).\n" +
    "• Dumpling — 1/3/6/10/15 for 1/2/3/4/5 dumplings.\n" +
    "• Soy Sauce — +4 pts each if you collected ≥4 distinct card categories.\n" +
    "• Tea — multiplies by the count of your most-played category.\n" +
    "• Pudding — collected across all rounds; at game end, most = +6, least = -6 (split on ties).\n\n" +
    "Strategy: Sashimi and Tempura sets give the biggest bursts when completed; nigiri is reliable filler; maki and pudding payouts only kick in after others have committed. Watch what cards you're passing — what helps you also gets passed away.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as SushiGoPartyFullSettings),
  reducer,
  isTerminal,
  hint: (state) =>
    state.phase === "picking" && state.hands[0] && state.hands[0].length > 0
      ? { selector: '[data-testid="sgpf-pick-0"]', pulses: 3 }
      : state.phase === "round-scored"
        ? { selector: '[data-testid="sgpf-next"]', pulses: 3 }
        : null,
  component: SushiGoPartyFullGame,
};
