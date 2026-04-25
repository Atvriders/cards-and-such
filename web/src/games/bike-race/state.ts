import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BikeRaceSettings {
  distance: "500" | "1000";
}

export type Terrain = "flat" | "uphill" | "downhill" | "obstacle";

export interface BikeRaceState {
  settings: BikeRaceSettings;
  totalDistance: number;
  distanceCovered: number;
  stamina: number;        // 0..100
  speed: number;          // 1..10
  score: number;
  terrain: Terrain;
  nextTerrain: Terrain;
  message: string;
  gameOver: boolean;
  won: boolean;
  seed: number;
}

export type BikeRaceAction =
  | { type: "pedal" }
  | { type: "coast" }
  | { type: "sprint" }
  | { type: "restart" };

function randomTerrain(rng: () => number): Terrain {
  const r = rng();
  if (r < 0.35) return "flat";
  if (r < 0.6) return "uphill";
  if (r < 0.8) return "downhill";
  return "obstacle";
}

export function initialState(seed: number, settings: BikeRaceSettings): BikeRaceState {
  const rng = mulberry32(seed);
  return {
    settings,
    totalDistance: parseInt(settings.distance, 10),
    distanceCovered: 0,
    stamina: 100,
    speed: 3,
    score: 0,
    terrain: "flat",
    nextTerrain: randomTerrain(rng),
    message: "Race begins! Pedal to start moving.",
    gameOver: false,
    won: false,
    seed,
  };
}

export function reducer(state: BikeRaceState, action: BikeRaceAction): BikeRaceState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  const rng = mulberry32(state.seed + state.distanceCovered);

  let speed = state.speed;
  let stamina = state.stamina;
  let msg = "";
  let staminaDrain = 0;
  let advance = 0;

  if (action.type === "pedal") {
    staminaDrain = state.terrain === "uphill" ? 10 : 6;
    speed = Math.min(10, state.speed + (state.terrain === "downhill" ? 2 : 1));
    advance = speed * 10;
    msg = `Pedaling hard! +${advance}m`;
  } else if (action.type === "coast") {
    staminaDrain = 2;
    speed = Math.max(1, state.speed - 1);
    advance = speed * 8;
    msg = `Coasting... +${advance}m`;
  } else if (action.type === "sprint") {
    staminaDrain = 20;
    speed = Math.min(10, state.speed + 3);
    advance = speed * 12;
    msg = `SPRINTING! +${advance}m`;
  } else {
    return state;
  }

  if (state.terrain === "obstacle") {
    const hit = rng() < 0.35;
    if (hit) {
      stamina = Math.max(0, stamina - 15);
      speed = Math.max(1, speed - 2);
      advance = Math.floor(advance * 0.4);
      msg = `Hit an obstacle! Slowed down. +${advance}m`;
    }
  }

  stamina = Math.max(0, stamina - staminaDrain);
  if (stamina === 0) {
    speed = Math.max(1, speed - 2);
    msg += " (exhausted!)";
  }

  const newDist = state.distanceCovered + advance;
  const newTerrain = state.nextTerrain;
  const nextTerrain = randomTerrain(rng);
  const terrainMsg = ` Next: ${nextTerrain}.`;

  if (newDist >= state.totalDistance) {
    const finalScore = Math.min(1000, Math.floor(500 + stamina * 5));
    return {
      ...state,
      distanceCovered: state.totalDistance,
      stamina,
      speed,
      score: finalScore,
      terrain: newTerrain,
      nextTerrain,
      message: "Finish line crossed! Race complete!",
      gameOver: true,
      won: true,
    };
  }

  if (stamina === 0 && speed <= 1) {
    return {
      ...state,
      distanceCovered: newDist,
      stamina: 0,
      speed: 1,
      score: Math.floor((newDist / state.totalDistance) * 400),
      message: "Completely exhausted! DNF.",
      gameOver: true,
      won: false,
      terrain: newTerrain,
      nextTerrain,
      seed: state.seed + 5,
    };
  }

  return {
    ...state,
    distanceCovered: newDist,
    stamina,
    speed,
    terrain: newTerrain,
    nextTerrain,
    message: msg + terrainMsg,
    seed: state.seed + 7,
  };
}

export function isTerminal(state: BikeRaceState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
