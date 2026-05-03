import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const headsUpBjPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "heads-up-bj",
  title: "Heads-Up Blackjack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One-on-one Blackjack against a CPU dealer-player.",
  howToPlay: "Heads-Up Blackjack is one-on-one Blackjack where you and the CPU each play a hand against a shared dealer hand — first to bust loses, otherwise the closest-to-twenty-one wins.\n\nIn this single-player adaptation you play twelve rounds. Press Play each round to deal two cards to you, two to the CPU, and a dealer up-card. The engine resolves all hands using standard Blackjack rules (dealer hits soft 17). Beating both the dealer and the CPU pays twelve; beating only one pays six; pushing pays four; busting or losing both pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Heads-Up Blackjack adds a competitive layer to standard Blackjack — even when you bust the CPU might still beat the dealer, denying you any payout. The game is popular in casino tournaments where multiple players race against a single dealer. Aim for the consistent 17-19 totals that beat both the dealer and a careless CPU.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer, isTerminal, hint, component: CasGame,
};
