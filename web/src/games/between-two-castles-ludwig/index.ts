import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BetweenTwoCastlesLudwigState, BetweenTwoCastlesLudwigAction, BetweenTwoCastlesLudwigSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BetweenTwoCastlesLudwigGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const betweenTwoCastlesLudwigPlugin: GamePlugin<BetweenTwoCastlesLudwigState, BetweenTwoCastlesLudwigAction, typeof settings> = {
  id: "between-two-castles-ludwig",
  title: "Between Two Castles: Ludwig",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hybrid draft-placement; rooms drafted then shared castle built.",
  howToPlay: "Between Two Castles: Ludwig is a card draft of castle rooms across eight rounds. Suits represent room types — Bedchamber, Hall, Garden, and Tower.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a castle tableau where adjacency (set count) drives scoring.\n\nScoring per tableau:\n- Sum of room ranks (1-9 each).\n- +10 per room type with 3+ rooms (wing complete).\n- +15 additional per room type with 5+ rooms.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Ludwig rewards connected wings — three Garden rooms earns +10 even at low ranks. The greedy CPU takes rank-9, leaving rank-2-7 in your wing for cheap picks. Lock a wing early; chase rank later. Aim for 60-100 points. Between Two Castles: Ludwig captures the hybrid draft-placement of its tableau cousin in a quick eight-round drafting flow.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BetweenTwoCastlesLudwigSettings),
  reducer,
  isTerminal,
  component: BetweenTwoCastlesLudwigGame,
};
