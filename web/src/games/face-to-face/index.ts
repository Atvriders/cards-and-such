import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FaceToFaceState, FaceToFaceAction, FaceToFaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FaceToFaceGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const faceToFacePlugin: GamePlugin<FaceToFaceState, FaceToFaceAction, typeof settings> = {
  id: "face-to-face", title: "Face to Face", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the highest number from four.",
  howToPlay: "Face to Face is the simultaneous reveal duel distilled to twenty quick rounds. Each round shows you four cards numbered 2 through 14 — pick the highest, hit Submit, score ten points if you grabbed the maximum. Max 200 points across twenty rounds. The original Face to Face has two players reveal cards simultaneously with the higher number winning; this digital version tests pure speed-comparison without an opponent. Repeated values are deduplicated during generation, so there is always exactly one max. Solid players score perfect 200 in under two minutes. First-timers 170-190 from rare misreads. Hit Submit and Next. Total run is about a minute. Face to Face works as a number-comparison warm-up before card-counting games (poker, bridge, cribbage) or as a kids arithmetic drill. A perfect score is just standard fluency — the challenge is speed alone in real games.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FaceToFaceSettings),
  reducer, isTerminal, component: FaceToFaceGame,
};
