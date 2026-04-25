import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RobotArenaSettings {
  arena: "4" | "5" | "6";
}

export interface Robot {
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
  id: number;
}

export interface RobotArenaState {
  settings: RobotArenaSettings;
  size: number;
  player: Robot;
  enemies: Robot[];
  turn: number;
  score: number;
  over: boolean;
  won: boolean;
  log: string;
}

export type RobotArenaAction = { type: "move"; dr: number; dc: number } | { type: "attack" };

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function makeEnemies(seed: number, size: number, count: number): Robot[] {
  const rng = mulberry32(seed);
  const enemies: Robot[] = [];
  const used = new Set<string>();
  used.add(`${Math.floor(size / 2)},${Math.floor(size / 2)}`); // player start
  let id = 1;
  while (enemies.length < count) {
    const r = Math.floor(rng() * size);
    const c = Math.floor(rng() * size);
    const key = `${r},${c}`;
    if (!used.has(key)) {
      used.add(key);
      enemies.push({ row: r, col: c, hp: 3, maxHp: 3, isPlayer: false, id: id++ });
    }
  }
  return enemies;
}

export function initialState(seed: number, settings: RobotArenaSettings): RobotArenaState {
  const size = parseInt(settings.arena, 10);
  const enemyCount = size - 1;
  const enemies = makeEnemies(seed, size, enemyCount);
  const player: Robot = {
    row: Math.floor(size / 2),
    col: Math.floor(size / 2),
    hp: 5,
    maxHp: 5,
    isPlayer: true,
    id: 0,
  };
  return { settings, size, player, enemies, turn: 0, score: 0, over: false, won: false, log: "Fight!" };
}

function isAdjacent(a: Robot, b: Robot): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function enemyAI(state: RobotArenaState, rng: () => number): RobotArenaState {
  let { player, enemies, score } = state;
  const occupied = new Set<string>(enemies.map(e => `${e.row},${e.col}`));

  enemies = enemies.map((enemy) => {
    if (enemy.hp <= 0) return enemy;
    if (isAdjacent(enemy, player)) {
      // Attack
      player = { ...player, hp: player.hp - 1 };
      return enemy;
    }
    // Move toward player
    const dr = Math.sign(player.row - enemy.row);
    const dc = Math.sign(player.col - enemy.col);
    const moves: [number, number][] = [[dr, 0], [0, dc], [-dr, 0], [0, -dc]];
    for (const [mr, mc] of moves) {
      const nr = clamp(enemy.row + mr, 0, state.size - 1);
      const nc = clamp(enemy.col + mc, 0, state.size - 1);
      const key = `${nr},${nc}`;
      if (nr !== player.row || nc !== player.col) {
        if (!occupied.has(key) || (nr === enemy.row && nc === enemy.col)) {
          occupied.delete(`${enemy.row},${enemy.col}`);
          occupied.add(key);
          return { ...enemy, row: nr, col: nc };
        }
      }
    }
    return enemy;
  });

  const alive = enemies.filter(e => e.hp > 0);
  const playerDead = player.hp <= 0;
  const won = alive.length === 0;
  const log = playerDead ? "Destroyed!" : won ? "All enemies defeated!" : `Turn ${state.turn + 1}`;
  return { ...state, player, enemies, score, over: playerDead || won, won, log };
}

export function reducer(state: RobotArenaState, action: RobotArenaAction): RobotArenaState {
  if (state.over) return state;

  if (action.type === "move") {
    const nr = clamp(state.player.row + action.dr, 0, state.size - 1);
    const nc = clamp(state.player.col + action.dc, 0, state.size - 1);
    const blocked = state.enemies.some(e => e.hp > 0 && e.row === nr && e.col === nc);
    if (blocked) return state;
    const player = { ...state.player, row: nr, col: nc };
    const rng = mulberry32(state.turn * 7919 + 1);
    return enemyAI({ ...state, player, turn: state.turn + 1 }, rng);
  }

  if (action.type === "attack") {
    let hit = false;
    let bonusScore = 0;
    const enemies = state.enemies.map((e) => {
      if (e.hp > 0 && isAdjacent(state.player, e)) {
        hit = true;
        const newHp = e.hp - 2;
        if (newHp <= 0) bonusScore += 100;
        return { ...e, hp: newHp };
      }
      return e;
    });
    if (!hit) return state;
    const rng = mulberry32(state.turn * 7919 + 2);
    return enemyAI({ ...state, enemies, score: state.score + bonusScore, turn: state.turn + 1 }, rng);
  }

  return state;
}

export function isTerminal(state: RobotArenaState): { score: number } | null {
  if (state.over) {
    const finalScore = state.won ? state.score + state.player.hp * 50 : state.score;
    return { score: finalScore };
  }
  return null;
}
