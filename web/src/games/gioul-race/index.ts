import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gioulRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "gioul-race",
  title: "Gioul",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish race-only variant — doubles unlock all higher pip values too.",
  howToPlay: "Gioul is a Turkish backgammon variant where rolling doubles unlocks not only the doubled value but every higher doubled value as well. Doubles cascade into very large multi-piece advances. There is no hitting; the focus is purely on racing checkers home.\n\nThis simplified single-player edition models the race component. You play white against a random CPU on a 24-point linear track with 15 checkers per side. Click Roll to throw two dice, then click any of your checkers and select a die or the combined sum to advance it.\n\nThe board displays as a horizontal track of 25 cells. Cell 24 is the bear-off zone. White checkers race from cell 0 toward 24; black CPU checkers race in the opposite direction internally and are tracked separately.\n\nGioul rewards quick decisive play. Push your runners hard from turn one — cascade-doubles can decide a game in three rolls. The CPU picks random legal moves, so a clear pip-management strategy reliably wins. Final score equals your pip-count lead at game end. Aim for +30 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-gioul-race-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
