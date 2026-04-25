import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface UfoShooterSettings {
  waves: "3" | "5";
}

export interface Ufo {
  id: number;
  x: number;       // 0..9
  speed: number;   // 1..3
  hp: number;
  destroyed: boolean;
}

export interface UfoShooterState {
  settings: UfoShooterSettings;
  wave: number;
  totalWaves: number;
  ufos: Ufo[];
  gunPosition: number;   // 0..9
  score: number;
  shotsRemaining: number;
  message: string;
  gameOver: boolean;
  seed: number;
}

export type UfoShooterAction =
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "shoot" }
  | { type: "nextWave" }
  | { type: "restart" };

function spawnUfos(rng: () => number, wave: number): Ufo[] {
  const count = 2 + wave;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.floor(rng() * 10),
    speed: Math.min(3, Math.floor(rng() * wave) + 1),
    hp: wave >= 3 ? 2 : 1,
    destroyed: false,
  }));
}

export function initialState(seed: number, settings: UfoShooterSettings): UfoShooterState {
  const rng = mulberry32(seed);
  const totalWaves = parseInt(settings.waves, 10);
  return {
    settings,
    wave: 1,
    totalWaves,
    ufos: spawnUfos(rng, 1),
    gunPosition: 5,
    score: 0,
    shotsRemaining: 10,
    message: "Shoot the UFOs! Aim carefully.",
    gameOver: false,
    seed,
  };
}

export function reducer(state: UfoShooterState, action: UfoShooterAction): UfoShooterState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "moveLeft") {
    return { ...state, gunPosition: Math.max(0, state.gunPosition - 1) };
  }
  if (action.type === "moveRight") {
    return { ...state, gunPosition: Math.min(9, state.gunPosition + 1) };
  }

  if (action.type === "shoot") {
    if (state.shotsRemaining <= 0) return { ...state, message: "No shots left! Wait for next wave." };
    const hitUfo = state.ufos.find(u => !u.destroyed && u.x === state.gunPosition);
    let newUfos = state.ufos;
    let pts = 0;
    let msg = "";
    if (hitUfo) {
      const newHp = hitUfo.hp - 1;
      const destroyed = newHp <= 0;
      newUfos = state.ufos.map(u => u.id === hitUfo.id ? { ...u, hp: newHp, destroyed } : u);
      pts = destroyed ? 100 : 40;
      msg = destroyed ? `UFO destroyed! +100` : `Hit! UFO damaged! +40`;
    } else {
      msg = "Missed!";
    }

    // Move ufos
    const rng = mulberry32(state.seed + state.shotsRemaining);
    const movedUfos = newUfos.map(u => {
      if (u.destroyed) return u;
      const dir = rng() > 0.5 ? 1 : -1;
      return { ...u, x: Math.max(0, Math.min(9, u.x + dir)) };
    });

    const allDestroyed = movedUfos.every(u => u.destroyed);
    const newShots = state.shotsRemaining - 1;

    if (allDestroyed) {
      return {
        ...state,
        ufos: movedUfos,
        score: state.score + pts,
        shotsRemaining: newShots,
        message: `Wave ${state.wave} cleared! +${pts}`,
        seed: state.seed + 5,
      };
    }

    if (newShots <= 0 && !allDestroyed) {
      const survived = movedUfos.filter(u => !u.destroyed).length;
      return {
        ...state,
        ufos: movedUfos,
        score: state.score + pts,
        shotsRemaining: 0,
        message: `Out of shots! ${survived} UFO(s) escaped.`,
        seed: state.seed + 5,
      };
    }

    return {
      ...state,
      ufos: movedUfos,
      score: state.score + pts,
      shotsRemaining: newShots,
      message: msg,
      seed: state.seed + 5,
    };
  }

  if (action.type === "nextWave") {
    const nextWave = state.wave + 1;
    if (nextWave > state.totalWaves) {
      return { ...state, wave: nextWave, gameOver: true, message: `All waves defeated! Final score: ${state.score}` };
    }
    const rng = mulberry32(state.seed + nextWave * 71);
    return {
      ...state,
      wave: nextWave,
      ufos: spawnUfos(rng, nextWave),
      shotsRemaining: 10,
      message: `Wave ${nextWave} incoming!`,
      seed: state.seed + 31,
    };
  }

  return state;
}

export function isTerminal(state: UfoShooterState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, state.score) };
}
