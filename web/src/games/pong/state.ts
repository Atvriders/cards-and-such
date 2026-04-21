// ─── Pong state ───────────────────────────────────────────────────────────────
// Normalized coordinates [0, 1] for both axes.
// Paddle left = player, right = bot.

export interface PongSettings {
  difficulty: "easy" | "medium" | "hard";
  targetScore: "5" | "7" | "11";
}

export interface PongState {
  settings: PongSettings;
  // Ball
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  // Paddles (Y = center of paddle, range [PADDLE_HALF, 1 - PADDLE_HALF])
  playerY: number;
  botY: number;
  // Scores
  playerScore: number;
  botScore: number;
  targetScore: number;
  // Status
  started: boolean;
  over: boolean;
  winner: "player" | "bot" | null;
}

export type PongAction =
  | { type: "tick"; dt: number }
  | { type: "move"; y: number }
  | { type: "start" };

// ─── Constants ────────────────────────────────────────────────────────────────
export const PADDLE_HALF = 0.08; // half-height of paddle
export const PADDLE_WIDTH = 0.02;
export const BALL_RADIUS = 0.015;
export const PLAYER_X = 0.04;
export const BOT_X = 0.96;
const BASE_SPEED = 0.55; // units/sec

/** Bot lag (higher = slower/easier) in seconds */
const BOT_LAG: Record<string, number> = {
  easy: 0.18,
  medium: 0.09,
  hard: 0.03,
};

function clampPaddleY(y: number): number {
  return Math.max(PADDLE_HALF, Math.min(1 - PADDLE_HALF, y));
}

function serveVelocity(towardBot: boolean): { vx: number; vy: number } {
  const vx = towardBot ? BASE_SPEED : -BASE_SPEED;
  // Small random-ish angle (deterministic: alternate)
  const vy = BASE_SPEED * 0.4;
  return { vx, vy };
}

export function initialState(seed: number, settings: PongSettings): PongState {
  const targetScore = parseInt(settings.targetScore, 10);
  // Use seed parity to choose initial serve direction
  const towardBot = seed % 2 === 0;
  const { vx, vy } = serveVelocity(towardBot);
  return {
    settings,
    ballX: 0.5,
    ballY: 0.5,
    ballVx: vx,
    ballVy: vy,
    playerY: 0.5,
    botY: 0.5,
    playerScore: 0,
    botScore: 0,
    targetScore,
    started: false,
    over: false,
    winner: null,
  };
}

export function reducer(state: PongState, action: PongAction): PongState {
  switch (action.type) {
    case "start": {
      if (state.over) return state;
      return { ...state, started: true };
    }

    case "move": {
      const y = clampPaddleY(action.y);
      return { ...state, playerY: y };
    }

    case "tick": {
      if (!state.started || state.over) return state;

      const { dt } = action;
      let { ballX, ballY, ballVx, ballVy, playerY, botY, playerScore, botScore } = state;

      // ── Bot tracking ──────────────────────────────────────────────────────
      const lag = BOT_LAG[state.settings.difficulty] ?? 0.09;
      const botDelta = (ballY - botY) * (dt / lag);
      botY = clampPaddleY(botY + botDelta);

      // ── Advance ball ──────────────────────────────────────────────────────
      let newX = ballX + ballVx * dt;
      let newY = ballY + ballVy * dt;

      // Top/bottom wall bounce
      if (newY - BALL_RADIUS < 0) {
        newY = BALL_RADIUS;
        ballVy = Math.abs(ballVy);
      } else if (newY + BALL_RADIUS > 1) {
        newY = 1 - BALL_RADIUS;
        ballVy = -Math.abs(ballVy);
      }

      // ── Player paddle collision ───────────────────────────────────────────
      if (
        ballVx < 0 &&
        newX - BALL_RADIUS <= PLAYER_X + PADDLE_WIDTH / 2 &&
        newX + BALL_RADIUS >= PLAYER_X - PADDLE_WIDTH / 2 &&
        Math.abs(newY - playerY) <= PADDLE_HALF + BALL_RADIUS
      ) {
        newX = PLAYER_X + PADDLE_WIDTH / 2 + BALL_RADIUS;
        ballVx = Math.abs(ballVx);
        // Add english
        const offset = (newY - playerY) / PADDLE_HALF;
        ballVy += offset * BASE_SPEED * 0.4;
        // Cap vertical speed
        const mag = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
        ballVx = (ballVx / mag) * BASE_SPEED;
        ballVy = (ballVy / mag) * BASE_SPEED;
      }

      // ── Bot paddle collision ──────────────────────────────────────────────
      if (
        ballVx > 0 &&
        newX + BALL_RADIUS >= BOT_X - PADDLE_WIDTH / 2 &&
        newX - BALL_RADIUS <= BOT_X + PADDLE_WIDTH / 2 &&
        Math.abs(newY - botY) <= PADDLE_HALF + BALL_RADIUS
      ) {
        newX = BOT_X - PADDLE_WIDTH / 2 - BALL_RADIUS;
        ballVx = -Math.abs(ballVx);
        const offset = (newY - botY) / PADDLE_HALF;
        ballVy += offset * BASE_SPEED * 0.4;
        const mag = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
        ballVx = (ballVx / mag) * -BASE_SPEED;
        ballVy = (ballVy / mag) * BASE_SPEED;
      }

      // ── Scoring ───────────────────────────────────────────────────────────
      let scored = false;
      if (newX < 0) {
        // Bot scores
        botScore += 1;
        scored = true;
      } else if (newX > 1) {
        // Player scores
        playerScore += 1;
        scored = true;
      }

      if (scored) {
        const over = playerScore >= state.targetScore || botScore >= state.targetScore;
        const winner = over ? (playerScore >= state.targetScore ? "player" : "bot") : null;
        // Serve toward whoever just got scored on
        const nextToward = newX < 0; // ball went past player's side → serve toward bot? no: serve toward the one who lost
        // Serve toward bot if player scored (ball went right past bot), serve toward player if bot scored
        const serveTowardBot = newX > 1; // player scored → next serve toward player (toward left) — let's do: serve toward scorer
        const { vx: svx, vy: svy } = serveVelocity(!serveTowardBot);
        return {
          ...state,
          ballX: 0.5,
          ballY: 0.5,
          ballVx: svx,
          ballVy: svy,
          playerY,
          botY,
          playerScore,
          botScore,
          started: !over,
          over,
          winner,
        };
      }

      return {
        ...state,
        ballX: newX,
        ballY: newY,
        ballVx,
        ballVy,
        playerY,
        botY,
        playerScore,
        botScore,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PongState): { score: number } | null {
  if (!state.over) return null;
  if (state.winner === "player") {
    return {
      score: state.playerScore * 50 + (state.targetScore - state.botScore) * 10,
    };
  }
  return { score: 0 };
}
