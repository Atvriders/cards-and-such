import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { InnovationAgesState, InnovationAgesAction, InnovationAgesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InnovationAgesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const innovationAgesPlugin: GamePlugin<InnovationAgesState, InnovationAgesAction, typeof settings> = {
  id: "innovation-ages",
  title: "Innovation Ages",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card draft through ages. Share and steal achievements.",
  howToPlay: "Innovation Ages compresses Carl Chudyk's Innovation game across eight quick rounds. Each round, three offers appear and you pick one; the CPU takes the highest-rank remaining. Cards represent four innovation types: sun (agriculture), moon (philosophy), star (science), leaf (culture). Score combines suits (innovation kinds) and ranks (age levels): three same-innovation earn +10, five same earn another +15, pairs of same age earn +5, triples earn +10. Raw rank values sum too. Final score equals tableau plus +25 bonus if you beat the CPU. Strategy: in the original, you 'meld' cards to gain icons and dominate eras. Here, suit-focus drives the bonus economy, lock a single innovation suit early. The CPU greedily takes high-rank cards, leaving suit-focused low-rank cards for you. Aim for 70-110 with bonus. Pure rank-grabbing usually loses to a focused suit-collector.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as InnovationAgesSettings),
  reducer,
  isTerminal,
  component: InnovationAgesGame,
};
