import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeThirteenRState, ThreeThirteenRAction, ThreeThirteenRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeThirteenRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const threeThirteenRPlugin: GamePlugin<ThreeThirteenRState, ThreeThirteenRAction, typeof settings> = {
  id: "three-thirteen-r", title: "Three Thirteen", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Contract rummy with rounds 3 to 13 cards using rotating wild rank.",
  howToPlay: "Three Thirteen is a contract rummy played in increasingly complex rounds. Round one is dealt three cards, round two four cards, and so on, up to round eleven (thirteen cards). The wild card is the rank matching the round number. In this short version we cap at six rounds (3-8 cards).\n\nEach round you are dealt the round-appropriate number of cards. The engine auto-melds your hand into sets (three or more of the same rank) and runs (three or more consecutive same-suit cards). Wild cards (the round's rank) substitute freely.\n\nSix rounds are played. A fully-melded hand (no deadwood) scores forty-five points. A partial-melded hand scores five points per meld. Deadwood is penalised one point per card.\n\nExpected score is around fifty to eighty points across six rounds. Easier early rounds (smaller hands) build deadwood-free easily; tougher later rounds (eight cards) need wilds. The variant rewards saving wild cards; melding flexibly in the back half of the game is what makes Three Thirteen interesting.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeThirteenRSettings),
  reducer, isTerminal, 
  hint: (state: ThreeThirteenRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-three-thirteen-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-three-thirteen-r-next"]', pulses: 3 };
    return null;
  },
  component: ThreeThirteenRGame,
};
