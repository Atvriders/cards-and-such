import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ContractRummyState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ContractRummy } from "./ContractRummy.js";

export const contractRummySettings = {
  contractRound: {
    kind: "number" as const,
    label: "Contract Round",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
  numBots: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type ContractRummySettingsRaw = SettingsOf<typeof contractRummySettings>;
type ContractRummyAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "open"; groups: string[][] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string };

export const contractRummyPlugin: GamePlugin<ContractRummyState, ContractRummyAction, typeof contractRummySettings> = {
  id: "contract-rummy",
  title: "Contract Rummy",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Progressive rummy where each round has a specific meld contract to fulfill.",
  howToPlay: `Contract Rummy is a progressive rummy variant where players must fulfill a specific "contract" — a required set of melds — before going out.

Setup: Cards are dealt from a double deck plus jokers. The number of cards dealt depends on the contract round (10 for rounds 1–2, 12 for round 3). One card starts the discard pile.

Contracts:
• Round 1: Two sets of 3 (groups of 3 same-rank cards)
• Round 2: One set of 3 plus one run of 4 (consecutive same-suit)
• Round 3: Two sets of 3 plus one run of 4

On your turn: Draw from the stock or discard pile. You may then "open" by fulfilling the contract — select your cards into groups matching the contract parts, then click Open Contract. After opening, you can also lay off cards onto existing melds. End your turn by discarding.

Going out: After opening the contract, if you can empty your hand by discarding (or laying off all remaining cards), you go out and win the round.

Wilds: 2s and Jokers act as wild cards and can substitute in sets or runs.

Controls: Draw from stock or click discard. Click cards to select, "Add Group" to stage contract groups, "Open Contract" to fulfill the contract. After opening, select one card and click Lay Off to add it to a table meld. Discard to end your turn.`,
  settings: contractRummySettings,
  initialState: (seed: number, s: ContractRummySettingsRaw) => initialState(seed, { contractRound: s.contractRound - 1, numBots: s.numBots }),
  reducer,
  isTerminal,
  component: ContractRummy,
};
