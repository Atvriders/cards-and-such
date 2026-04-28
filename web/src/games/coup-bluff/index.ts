import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoupBluffState, CoupBluffAction, CoupBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoupBluffGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const coupBluffPlugin: GamePlugin<CoupBluffState, CoupBluffAction, typeof settings> = {
  id: "coup-bluff",
  title: "Coup Bluff",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Solo Coup: CPU claims a character action, you decide whether to challenge.`,
  howToPlay: `Coup is a 2–6 player bluffing game where players secretly hold influence cards (Duke, Assassin, Captain, Ambassador, Contessa) and bluff that they have characters they don't.

In this solo adaptation the CPU declares an action — "I tax as Duke" or "I steal as Captain" — and you decide whether to challenge. If you challenge a real claim, you lose. If you challenge a bluff, the CPU loses. If you trust correctly, no harm; if you let a bluff go, the CPU benefits.

Calm CPUs tend to actually hold the card claimed. Nervous CPUs are likelier bluffing. As in real Coup, your read on the player matters as much as the cards.

Each correct read earns 100 points across ten rounds, for 1000 max. A clean sweep is master spy territory.

Tips: in actual Coup, the Duke (Tax) and Captain (Steal) are the most-claimed roles, so they get bluffed most often. Treat low-frequency claims like Contessa as more likely truthful unless the CPU is on the back foot.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoupBluffSettings),
  reducer,
  isTerminal,
  component: CoupBluffGame,
};
