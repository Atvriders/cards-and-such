import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface UfoSettings {
  humans: "5" | "8" | "10";
}

export interface Human {
  id: number;
  x: number;
  y: number;
  rescued: boolean;
  onShip: boolean;
}

export interface UfoState {
  settings: UfoSettings;
  ufoX: number;
  ufoY: number;
  fieldW: number;
  fieldH: number;
  groundY: number;
  beamActive: boolean;
  humans: Human[];
  rescued: number;
  totalHumans: number;
  score: number;
  lives: number;
  over: boolean;
  ticks: number;
  rngSeed: number;
  nextId: number;
}

export type UfoAction =
  | { type: "tick" }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "beam" };

const FIELD_W = 360;
const FIELD_H = 280;
const GROUND_Y = FIELD_H - 30;
const UFO_SPEED = 6;
const UFO_W = 48;
const UFO_H = 20;
const HUMAN_W = 10;

function spawnHumans(count: number, seed: number): { humans: Human[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const humans: Human[] = [];
  for (let i = 0; i < count; i++) {
    humans.push({
      id: i,
      x: 20 + Math.floor(rng() * (FIELD_W - 40)),
      y: GROUND_Y - HUMAN_W,
      rescued: false,
      onShip: false,
    });
  }
  return { humans, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: UfoSettings): UfoState {
  const count = parseInt(settings.humans, 10);
  const { humans, nextSeed } = spawnHumans(count, seed);
  return {
    settings,
    ufoX: FIELD_W / 2 - UFO_W / 2,
    ufoY: 30,
    fieldW: FIELD_W,
    fieldH: FIELD_H,
    groundY: GROUND_Y,
    beamActive: false,
    humans,
    rescued: 0,
    totalHumans: count,
    score: 0,
    lives: 3,
    over: false,
    ticks: 0,
    rngSeed: nextSeed,
    nextId: count,
  };
}

export function reducer(state: UfoState, action: UfoAction): UfoState {
  if (state.over) return state;

  switch (action.type) {
    case "moveLeft":
      return { ...state, ufoX: Math.max(0, state.ufoX - UFO_SPEED) };

    case "moveRight":
      return { ...state, ufoX: Math.min(state.fieldW - UFO_W, state.ufoX + UFO_SPEED) };

    case "beam":
      return { ...state, beamActive: !state.beamActive };

    case "tick": {
      let { ufoY, beamActive, humans, rescued, score, lives } = state;

      // Move UFO down when beam is active
      if (beamActive && ufoY < GROUND_Y - UFO_H - 20) {
        ufoY = Math.min(ufoY + 3, GROUND_Y - UFO_H - 20);
      } else if (!beamActive && ufoY > 30) {
        ufoY = Math.max(ufoY - 2, 30);
      }

      const ufoCenterX = state.ufoX + UFO_W / 2;
      const beamX = ufoCenterX;

      // Beam pickup: when beam active and UFO is low, pick up nearest human below beam
      let newHumans = humans.map((h) => {
        if (h.rescued || h.onShip) return h;
        if (!beamActive) return h;
        if (Math.abs(h.x - beamX) < 20 && Math.abs(h.y - (ufoY + UFO_H)) < 40) {
          return { ...h, onShip: true };
        }
        return h;
      });

      // Humans on ship rise with UFO
      newHumans = newHumans.map((h) => {
        if (h.onShip && !h.rescued) {
          return { ...h, y: ufoY + UFO_H + 5 };
        }
        return h;
      });

      // When UFO rises enough, rescue all on-ship humans
      if (!beamActive && ufoY <= 35) {
        let gained = 0;
        newHumans = newHumans.map((h) => {
          if (h.onShip && !h.rescued) { gained++; return { ...h, rescued: true, onShip: false }; }
          return h;
        });
        rescued += gained;
        score += gained * 100;
      }

      const over = rescued >= state.totalHumans;

      return {
        ...state,
        ufoY,
        beamActive,
        humans: newHumans,
        rescued,
        score,
        lives,
        over,
        ticks: state.ticks + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: UfoState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
