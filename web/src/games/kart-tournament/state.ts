import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KartTournamentSettings {
  tracks: "3" | "5";
}

export type ItemType = "boost" | "shell" | "star" | "banana" | "none";

export interface KartRacer {
  name: string;
  position: number; // 0..100
  speed: number;
  item: ItemType;
  finished: boolean;
  finishTime: number; // lower is better, 0 = DNF
}

export interface KartTournamentState {
  settings: KartTournamentSettings;
  track: number;        // 1-indexed
  totalTracks: number;
  lap: number;          // 1-indexed
  totalLaps: number;
  racers: readonly KartRacer[];
  playerIdx: number;    // index of player racer
  phase: "racing" | "interRace" | "gameOver";
  points: readonly number[]; // accumulated points per racer
  lastEvent: string;
  seed: number;
}

export type KartTournamentAction =
  | { type: "drive"; action: "accelerate" | "brake" | "useItem" }
  | { type: "nextRace" };

const RACER_NAMES = ["Mario", "Luigi", "Peach", "Bowser", "You"];
const POINTS_TABLE = [10, 8, 6, 4, 2, 1, 1, 1];
const TOTAL_LAPS = 3;

export function initialState(seed: number, settings: KartTournamentSettings): KartTournamentState {
  const rng = mulberry32(seed);
  const totalTracks = parseInt(settings.tracks, 10);

  const racers: KartRacer[] = RACER_NAMES.map((name, i) => ({
    name,
    position: 0,
    speed: 2 + Math.floor(rng() * 3),
    item: "none",
    finished: false,
    finishTime: 0,
  }));
  // Player is last index
  racers[racers.length - 1]!.name = "You";

  return {
    settings,
    track: 1,
    totalTracks,
    lap: 1,
    totalLaps: TOTAL_LAPS,
    racers,
    playerIdx: racers.length - 1,
    phase: "racing",
    points: new Array(racers.length).fill(0),
    lastEvent: "Race 1 starts! Accelerate to go faster.",
    seed: seed + 1,
  };
}

function applyItem(rng: () => number, racers: KartRacer[], targetIdx: number, item: ItemType): { racers: KartRacer[]; desc: string } {
  const newRacers = racers.map(r => ({ ...r }));
  if (item === "boost") {
    newRacers[targetIdx]!.position = Math.min(100, newRacers[targetIdx]!.position + 10);
    return { racers: newRacers, desc: "Boost! +10 position." };
  }
  if (item === "star") {
    newRacers[targetIdx]!.speed = Math.min(10, newRacers[targetIdx]!.speed + 3);
    return { racers: newRacers, desc: "Star! Speed boosted." };
  }
  if (item === "shell") {
    // Hit the racer ahead
    const ahead = newRacers
      .map((r, i) => ({ r, i }))
      .filter(({ r, i }) => i !== targetIdx && r.position > newRacers[targetIdx]!.position)
      .sort((a, b) => a.r.position - b.r.position);
    if (ahead.length > 0) {
      newRacers[ahead[0]!.i]!.position = Math.max(0, newRacers[ahead[0]!.i]!.position - 8);
      return { racers: newRacers, desc: `Shell hits ${newRacers[ahead[0]!.i]!.name}!` };
    }
    return { racers: newRacers, desc: "Shell missed, nobody ahead." };
  }
  if (item === "banana") {
    // Drop behind — slow pursuer
    const behind = newRacers
      .map((r, i) => ({ r, i }))
      .filter(({ r, i }) => i !== targetIdx && r.position < newRacers[targetIdx]!.position)
      .sort((a, b) => b.r.position - a.r.position);
    if (behind.length > 0) {
      newRacers[behind[0]!.i]!.speed = Math.max(1, newRacers[behind[0]!.i]!.speed - 2);
      return { racers: newRacers, desc: `Banana slips ${newRacers[behind[0]!.i]!.name}!` };
    }
    return { racers: newRacers, desc: "Banana dropped, nobody behind." };
  }
  void rng;
  return { racers: newRacers, desc: "" };
}

function randomItem(rng: () => number): ItemType {
  const items: ItemType[] = ["boost", "shell", "star", "banana", "none", "none"];
  return items[Math.floor(rng() * items.length)]!;
}

export function reducer(state: KartTournamentState, action: KartTournamentAction): KartTournamentState {
  if (state.phase === "gameOver") return state;

  if (action.type === "nextRace") {
    if (state.phase !== "interRace") return state;
    const rng = mulberry32(state.seed);
    const nextTrack = state.track + 1;
    if (nextTrack > state.totalTracks) {
      return { ...state, phase: "gameOver", lastEvent: "Tournament over!" };
    }
    const racers: KartRacer[] = state.racers.map(r => ({
      ...r,
      position: 0,
      speed: 2 + Math.floor(rng() * 3),
      item: "none",
      finished: false,
      finishTime: 0,
    }));
    return {
      ...state,
      track: nextTrack,
      lap: 1,
      racers,
      phase: "racing",
      lastEvent: `Track ${nextTrack} starts!`,
      seed: state.seed + 1,
    };
  }

  if (action.type !== "drive") return state;

  const rng = mulberry32(state.seed + state.racers[state.playerIdx]!.position);
  const newRacers = state.racers.map(r => ({ ...r }));
  const player = newRacers[state.playerIdx]!;

  let events: string[] = [];

  if (action.action === "accelerate") {
    player.speed = Math.min(10, player.speed + 2);
    events.push("Accelerated!");
  } else if (action.action === "brake") {
    player.speed = Math.max(1, player.speed - 1);
    events.push("Braked.");
  } else if (action.action === "useItem" && player.item !== "none") {
    const { racers: r2, desc } = applyItem(rng, newRacers, state.playerIdx, player.item);
    r2.forEach((r, i) => { newRacers[i] = r; });
    player.item = "none";
    events.push(desc);
  } else {
    events.push("No item to use.");
  }

  // Advance all racers
  for (let i = 0; i < newRacers.length; i++) {
    const r = newRacers[i]!;
    if (r.finished) continue;
    const noise = Math.floor(rng() * 3) - 1;
    const advance = Math.max(0, r.speed + noise + (i === state.playerIdx ? 0 : -1));
    r.position = Math.min(100, r.position + advance);
    // Random item pickup
    if (r.item === "none" && rng() < 0.15) {
      r.item = randomItem(rng);
      if (i === state.playerIdx) events.push(`Got a ${r.item}!`);
    }
    if (r.position >= 100 && !r.finished) {
      r.finished = true;
      r.finishTime = state.racers.filter(x => x.finished).length + 1;
    }
  }

  // Check race end
  const allDone = newRacers.every(r => r.finished);
  if (allDone) {
    // Award points
    const sorted = newRacers
      .map((r, i) => ({ r, i }))
      .sort((a, b) => a.r.finishTime - b.r.finishTime);
    const newPoints = state.points.slice();
    sorted.forEach(({ i }, rank) => {
      newPoints[i] = (newPoints[i] ?? 0) + (POINTS_TABLE[rank] ?? 0);
    });
    const playerRank = sorted.findIndex(({ i }) => i === state.playerIdx) + 1;
    return {
      ...state,
      racers: newRacers,
      points: newPoints,
      phase: "interRace",
      lastEvent: `Race finished! You placed ${playerRank}${["st","nd","rd"][playerRank-1] ?? "th"}. Tap Next Race.`,
      seed: state.seed + 1,
    };
  }

  return {
    ...state,
    racers: newRacers,
    lastEvent: events.join(" "),
    seed: state.seed + 1,
  };
}

export function isTerminal(state: KartTournamentState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  const playerPoints = state.points[state.playerIdx] ?? 0;
  const maxPoints = Math.max(...state.points);
  const base = playerPoints === maxPoints ? 1000 : Math.floor((playerPoints / (maxPoints || 1)) * 800 + 100);
  return { score: Math.max(50, base) };
}
