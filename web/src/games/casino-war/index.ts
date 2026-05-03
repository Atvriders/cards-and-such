import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasinoWarState, CasinoWarAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasinoWar } from "./Game.js";

export const casinoWarSettings = {
  startingBankroll: {
    kind: "number" as const,
    label: "Starting Bankroll",
    min: 100,
    max: 5000,
    step: 100,
    default: 1000,
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 50,
    step: 5,
    default: 20,
  },
} as const;

type CasinoWarSettingsType = SettingsOf<typeof casinoWarSettings>;

export const casinoWarPlugin: GamePlugin<CasinoWarState, CasinoWarAction, typeof casinoWarSettings> = {
  id: "casino-war",
  title: "Casino War",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One card each. High card wins. On a tie: surrender half, or go to war and match your bet.",
  howToPlay: `Casino War is the simplest casino card game — you and the dealer each get one card, and the higher rank wins.

Card ranks follow standard order with Aces high: 2 is lowest, Ace is highest. Suit does not matter. If your card outranks the dealer's card, you win 1:1 — even money on your ante. If the dealer's card outranks yours, you lose your ante.

The exciting part is the Tie. When both cards match in rank, you have two choices:

Surrender: Forfeit half your ante and the hand ends. You recover the other half.

Go to War: Match your ante with an equal raise bet. Three cards are burned from each side, then one final card is dealt to each. If your final card is greater than or equal to the dealer's final card, you win 1:1 on the raise bet — your original ante just pushes (returns). If the dealer's final card beats yours, both bets are lost.

This is played with a 6-deck shoe, matching casino standard.

The house edge comes primarily from ties. Mathematically, going to war is slightly better than surrendering in most cases.

Settings: Choose starting bankroll, ante size, and how many hands to play per session. Score equals your final bankroll.`,
  settings: casinoWarSettings,
  initialState: (seed: number, settings: CasinoWarSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "tie-decision") return { selector: '[data-testid="hint-target-casino-war-war"]', pulses: 3 };
    if (state.phase === "betting" || state.phase === "settled") return { selector: '[data-testid="hint-target-casino-war-deal"]', pulses: 3 };
    return null;
  },
  component: CasinoWar,
};
