import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NHIESettings {
  rounds: "10" | "20" | "30";
  mode: "all-ages" | "adult";
}

const STATEMENTS_ALL: string[] = [
  "Never have I ever fallen asleep in a movie theater.",
  "Never have I ever eaten an entire pizza by myself.",
  "Never have I ever been on a blind date.",
  "Never have I ever sung karaoke in public.",
  "Never have I ever gotten lost in a city I live in.",
  "Never have I ever cried at a commercial.",
  "Never have I ever sent a text to the wrong person.",
  "Never have I ever lied about my age.",
  "Never have I ever gone skinny dipping.",
  "Never have I ever been in a fistfight.",
  "Never have I ever cheated on a test.",
  "Never have I ever stolen something (even small).",
  "Never have I ever been on TV.",
  "Never have I ever faked being sick to skip work or school.",
  "Never have I ever talked to myself out loud in public.",
  "Never have I ever binge-watched an entire TV series in one day.",
  "Never have I ever eaten food off the floor.",
  "Never have I ever skipped a workout I planned.",
  "Never have I ever gotten a parking ticket.",
  "Never have I ever fallen asleep at work or school.",
  "Never have I ever been caught talking behind someone's back.",
  "Never have I ever accidentally broken something and blamed someone else.",
  "Never have I ever pretended to know a song and just mumbled along.",
  "Never have I ever re-gifted a present.",
  "Never have I ever ghosted someone.",
  "Never have I ever ugly-cried in front of strangers.",
  "Never have I ever eaten cereal as a meal after age 18.",
  "Never have I ever walked into a glass door.",
  "Never have I ever stayed up past 3 a.m. with no good reason.",
  "Never have I ever been on a roller coaster and screamed.",
  "Never have I ever pretended to be on the phone to avoid someone.",
  "Never have I ever forgotten a close friend's birthday.",
  "Never have I ever cancelled plans at the last minute.",
  "Never have I ever lied about reading a book I never finished.",
  "Never have I ever accidentally liked an old photo while stalking someone online.",
];

const STATEMENTS_ADULT: string[] = [
  ...STATEMENTS_ALL,
  "Never have I ever told a lie on a first date.",
  "Never have I ever kissed someone I just met.",
  "Never have I ever flirted to get something for free.",
  "Never have I ever drunk-texted my ex.",
  "Never have I ever been in a relationship with two people at once.",
];

export interface NHIEState {
  settings: NHIESettings;
  statements: string[];
  currentIndex: number;
  drankCount: number;
  phase: "playing" | "done";
}

export type NHIEAction =
  | { type: "did-it" }
  | { type: "never" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: NHIESettings): NHIEState {
  const rng = mulberry32(seed);
  const pool = settings.mode === "adult" ? STATEMENTS_ADULT : STATEMENTS_ALL;
  const count = parseInt(settings.rounds, 10);
  const statements = shuffle(pool, rng).slice(0, Math.min(count, pool.length));
  return { settings, statements, currentIndex: 0, drankCount: 0, phase: "playing" };
}

export function reducer(state: NHIEState, action: NHIEAction): NHIEState {
  if (state.phase === "done") return state;
  const nextIndex = state.currentIndex + 1;
  const done = nextIndex >= state.statements.length;

  switch (action.type) {
    case "did-it":
      return { ...state, currentIndex: nextIndex, drankCount: state.drankCount + 1, phase: done ? "done" : "playing" };
    case "never":
      return { ...state, currentIndex: nextIndex, phase: done ? "done" : "playing" };
    default:
      return state;
  }
}

export function isTerminal(state: NHIEState): { score: number } | null {
  if (state.phase === "done") return { score: state.drankCount };
  return null;
}
