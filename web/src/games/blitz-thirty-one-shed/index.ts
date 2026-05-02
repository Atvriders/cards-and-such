import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BlitzThirtyOneShedState, BlitzThirtyOneShedAction, BlitzThirtyOneShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlitzThirtyOneShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blitzThirtyOneShedPlugin: GamePlugin<BlitzThirtyOneShedState, BlitzThirtyOneShedAction, typeof settings> = {
  id: "blitz-thirty-one-shed", title: "Blitz / Thirty-One", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to 31 in a suit.",
  howToPlay: "Blitz, also called Thirty-One, is a classic shedding-and-swap card game where players race to build a hand totaling thirty-one points in a single suit. Aces count eleven, face cards ten, and number cards their pip value.\n\nIn this single-player version you face the CPU across six rounds. Each round both players are dealt three cards. On your turn you may swap one card with a face-up center pool, or knock to end the round. After a knock everyone reveals; highest single-suit total wins twenty points plus a five-point margin bonus.\n\nIf you reach exactly thirty-one (Blitz!) you score a forty-point bonus instantly. Knocking too early when behind is a common rookie error; knocking too late lets the opponent reach Blitz first.\n\nThe game traces back to seventeenth-century Scandinavia and is the ancestor of Scat and Ride the Bus. A strong total is around eighty across six rounds; a single Blitz can turn a losing game around. Press Play to deal the next round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlitzThirtyOneShedSettings),
  reducer, isTerminal, 
  hint: (state: BlitzThirtyOneShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-blitz-thirty-one-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-blitz-thirty-one-shed-next"]', pulses: 3 };
    return null;
  },
  component: BlitzThirtyOneShedGame,
};
