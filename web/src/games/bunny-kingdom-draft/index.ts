import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BunnyKingdomState, BunnyKingdomAction, BunnyKingdomSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BunnyKingdomGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bunnyKingdomPlugin: GamePlugin<BunnyKingdomState, BunnyKingdomAction, typeof settings> = {
  id: "bunny-kingdom-draft",
  title: "Bunny Kingdom",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft cards to claim fiefs and build towers. Parchment bonus cards.",
  howToPlay: "Bunny Kingdom is a card-drafting territorial game where you claim fiefs and build towers across a kingdom. Each round, three offers appear and you pick one; the CPU takes the highest-rank remaining. Eight rounds total. Cards represent four territory types: sun-meadows, moon-forests, star-mountains, leaf-plains. Score combines suits (territory types) and ranks (tower heights): three same-territory earn +10, five same-territory earn another +15, pairs of same height earn +5, triples earn +10. Raw rank values sum too. Final score equals tableau plus +25 bonus if you beat the CPU. Strategy: in the original, you build adjacent territories for cluster bonuses. Here, suit-focus mimics that, pick same-suit cards early to lock the +10 bonus. Then chase high-rank towers late. Aim for 70-110 with bonus. The CPU's greedy rank-grab strategy means suit-focused cards keep slipping past you.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BunnyKingdomSettings),
  reducer,
  isTerminal,
  component: BunnyKingdomGame,
};
