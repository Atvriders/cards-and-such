import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { HamsterHopState, HamsterHopAction, HamsterHopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HamsterHopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hamsterHopPlugin: GamePlugin<HamsterHopState, HamsterHopAction, typeof settings> = {
  id:"hamster-hop", title:"Hamster Hop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap hamsters darting across the screen. 30-second clicker.",
  howToPlay:`Hamster Hop is a 30-second arcade clicker. Hamsters appear in random lanes and drift across the board; tap each one before it disappears to score 10 points.

The game ticks once per beat (about every three-quarters of a second), spawning fresh hamsters in random lanes. Each hamster lingers for a few ticks before vanishing — miss too many and your score suffers, since unattended hamsters count toward your missed tally.

There is no skill ceiling beyond reflexes and accuracy: the more hamsters you tap in 30 seconds, the higher your final score. Average runs land near 200–300 points; sharpshooters routinely push past 500. The clock counts down in the top right corner — when it hits zero, the game ends and your final tally is locked in.

Mash that screen and rack up the hamster count!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HamsterHopSettings),
  reducer, isTerminal,
  hint: (state: HamsterHopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-hamster-hop-target"]', pulses: 3 };
  },
  component: HamsterHopGame,
};
