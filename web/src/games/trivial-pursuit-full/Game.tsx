import { useEffect, useMemo, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  TrivialPursuitFullState,
  TrivialPursuitFullSettings,
  TrivialPursuitFullAction,
  Position,
} from "./state.js";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABEL,
  HQ_INDICES,
  HUMAN_SEAT,
  NUM_PLAYERS,
  PLAYER_COLORS,
  PLAYER_NAMES,
  RING_LEN,
  SPOKE_LEN,
  hasAllWedges,
  isTerminal,
  ringCategoryAt,
} from "./state.js";
import "./Game.css";

// ---------------------------------------------------------------------------
// Board layout — pre-computed (x,y) coordinates for ring + spoke + hub squares
// ---------------------------------------------------------------------------

const BOARD_SIZE = 540;
const CENTER = BOARD_SIZE / 2;
const RING_RADIUS_OUTER = 240;
const RING_RADIUS_INNER = 200;
const HUB_RADIUS = 38;

interface Pt { x: number; y: number; r: number }

function ringSquarePos(i: number): Pt {
  // Place 42 squares evenly around the circle.
  const ang = (i / RING_LEN) * Math.PI * 2 - Math.PI / 2;
  const radius = (RING_RADIUS_OUTER + RING_RADIUS_INNER) / 2;
  return { x: CENTER + Math.cos(ang) * radius, y: CENTER + Math.sin(ang) * radius, r: 18 };
}

function spokeSquarePos(spoke: number, depth: number): Pt {
  // Spoke 0..5 maps to the same 6 angles as the HQ outer indices.
  const hqIdx = HQ_INDICES[spoke]!;
  const ang = (hqIdx / RING_LEN) * Math.PI * 2 - Math.PI / 2;
  // depth 0 = adjacent to ring (just inside RING_RADIUS_INNER)
  // depth SPOKE_LEN-1 = adjacent to hub
  const t = (depth + 1) / (SPOKE_LEN + 1); // 1..SPOKE_LEN scaled
  const radius = RING_RADIUS_INNER - 22 - t * (RING_RADIUS_INNER - HUB_RADIUS - 32);
  return { x: CENTER + Math.cos(ang) * radius, y: CENTER + Math.sin(ang) * radius, r: 16 };
}

function positionToPoint(p: Position): Pt {
  if (p.kind === "ring") return ringSquarePos(p.index);
  if (p.kind === "spoke") return spokeSquarePos(p.spoke, p.depth);
  return { x: CENTER, y: CENTER, r: HUB_RADIUS };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrivialPursuitFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TrivialPursuitFullState, TrivialPursuitFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const ringSquares = useMemo(() => Array.from({ length: RING_LEN }, (_, i) => i), []);
  const spokeMatrix = useMemo(() => {
    const out: { spoke: number; depth: number }[] = [];
    for (let s = 0; s < 6; s++) {
      for (let d = 0; d < SPOKE_LEN; d++) out.push({ spoke: s, depth: d });
    }
    return out;
  }, []);

  const t = isTerminal(state);
  const isHumanTurn = state.turn === HUMAN_SEAT;

  // ---- Game-over panel ----
  if (t) {
    const won = state.winner === HUMAN_SEAT;
    return (
      <div className="tpf-wrap fade-in">
        <div className={`tpf-banner bounce-in ${won ? "tpf-win" : "tpf-loss"}`}>
          {won ? "You won the wedge race!" : `${PLAYER_NAMES[state.winner ?? 0]} won the game.`}
        </div>
        <div className="tpf-score pulse">Score: {state.score}</div>
        <div className="tpf-log">
          {state.log.map((l, i) => (
            <div key={i} className="tpf-log-line">{l}</div>
          ))}
        </div>
      </div>
    );
  }

  const currentPlayer = state.players[state.turn]!;

  return (
    <div className="tpf-wrap fade-in">
      <div className="tpf-header">
        <div className="tpf-turn">
          {isHumanTurn ? "Your turn" : `${PLAYER_NAMES[state.turn]}'s turn`}
        </div>
        <div className="tpf-die" data-testid="hint-target-tpf-die">
          {state.die > 0 ? `Die: ${state.die}` : "—"}
        </div>
      </div>

      <div className="tpf-main">
        {/* SVG board */}
        <svg
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          className="tpf-board"
          aria-label="Trivial Pursuit board"
        >
          {/* Outer ring background */}
          <circle cx={CENTER} cy={CENTER} r={RING_RADIUS_OUTER + 6} fill="#1a1a26" stroke="#555" strokeWidth="2" />
          <circle cx={CENTER} cy={CENTER} r={RING_RADIUS_INNER - 6} fill="#1a1a26" stroke="#555" strokeWidth="2" />

          {/* Spoke connector lines */}
          {HQ_INDICES.map((hqIdx, sp) => {
            const ang = (hqIdx / RING_LEN) * Math.PI * 2 - Math.PI / 2;
            const x1 = CENTER + Math.cos(ang) * (RING_RADIUS_INNER - 6);
            const y1 = CENTER + Math.sin(ang) * (RING_RADIUS_INNER - 6);
            const x2 = CENTER + Math.cos(ang) * (HUB_RADIUS + 6);
            const y2 = CENTER + Math.sin(ang) * (HUB_RADIUS + 6);
            return <line key={`spoke-${sp}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#555" strokeWidth="2" />;
          })}

          {/* Ring squares */}
          {ringSquares.map(i => {
            const pos = ringSquarePos(i);
            const cat = ringCategoryAt(i);
            const isHq = HQ_INDICES.indexOf(i as 0 | 7 | 14 | 21 | 28 | 35) >= 0;
            return (
              <g key={`ring-${i}`}>
                {isHq ? (
                  <polygon
                    points={hexPoints(pos.x, pos.y, 22)}
                    fill={CATEGORY_COLORS[cat]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                ) : (
                  <rect
                    x={pos.x - 14}
                    y={pos.y - 14}
                    width={28}
                    height={28}
                    rx={4}
                    ry={4}
                    fill={CATEGORY_COLORS[cat]}
                    stroke="#222"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          {/* Spoke squares */}
          {spokeMatrix.map(({ spoke, depth }) => {
            const pos = spokeSquarePos(spoke, depth);
            const cat = CATEGORIES[spoke]!;
            return (
              <rect
                key={`sp-${spoke}-${depth}`}
                x={pos.x - 12}
                y={pos.y - 12}
                width={24}
                height={24}
                rx={3}
                ry={3}
                fill={CATEGORY_COLORS[cat]}
                stroke="#222"
                strokeWidth="1"
              />
            );
          })}

          {/* Hub */}
          <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} fill="#222" stroke="#fff" strokeWidth="3" />
          <text x={CENTER} y={CENTER + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">HUB</text>

          {/* Pawn tokens */}
          {state.players.map((p, idx) => {
            const pt = positionToPoint(p.pos);
            // Offset pawns by index so they don't fully overlap.
            const off = (idx - 1.5) * 8;
            return (
              <g key={`pawn-${idx}`}>
                <circle
                  cx={pt.x + off}
                  cy={pt.y - 10}
                  r={9}
                  fill={PLAYER_COLORS[idx]}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={pt.x + off}
                  y={pt.y - 7}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Side panel */}
        <div className="tpf-side">
          <div className="tpf-players">
            {state.players.map((p, idx) => {
              const wedgeCount = CATEGORIES.filter(c => p.wedges[c]).length;
              const allWedges = hasAllWedges(p);
              return (
                <div
                  key={idx}
                  className={`tpf-pcard ${state.turn === idx ? "tpf-pcard-active" : ""}`}
                >
                  <div className="tpf-pname" style={{ color: PLAYER_COLORS[idx] }}>
                    {PLAYER_NAMES[idx]} {allWedges && <span className="tpf-pall">★</span>}
                  </div>
                  <div className="tpf-pwedges">
                    {CATEGORIES.map(c => (
                      <span
                        key={c}
                        className="tpf-wedge"
                        title={`${CATEGORY_LABEL[c]} wedge — ${p.wedges[c] ? "won" : "needed"}`}
                        style={{
                          background: p.wedges[c] ? CATEGORY_COLORS[c] : "#333",
                          borderColor: CATEGORY_COLORS[c],
                          opacity: p.wedges[c] ? 1 : 0.35,
                        }}
                      />
                    ))}
                  </div>
                  <div className="tpf-pcount">{wedgeCount}/6 wedges</div>
                </div>
              );
            })}
          </div>

          <div className="tpf-log">
            <div className="tpf-log-title">Log</div>
            {state.log.map((l, i) => (
              <div key={i} className="tpf-log-line">{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="tpf-controls">
        {!isHumanTurn && (
          <div className="tpf-cpu-msg">
            {PLAYER_NAMES[state.turn]} is thinking...
          </div>
        )}

        {isHumanTurn && state.phase === "rolling" && (
          <button
            className="tpf-btn tpf-btn-roll"
            data-testid="hint-target-tpf-roll"
            title="Roll the six-sided die"
            onClick={() => dispatch({ type: "roll" } as TrivialPursuitFullAction)}
          >
            Roll Die
          </button>
        )}

        {isHumanTurn && state.phase === "choosingPath" && (
          <div className="tpf-path">
            <div className="tpf-path-label">Choose your path from this HQ:</div>
            {state.pathChoices.map((c, i) => (
              <button
                key={i}
                className="tpf-btn"
                title={c.kind === "ring" ? "Continue clockwise on the outer ring" : "Descend the spoke toward the hub"}
                onClick={() => dispatch({ type: "choosePath", choice: c } as TrivialPursuitFullAction)}
              >
                {c.kind === "ring" ? "Continue ring" : "Take spoke toward hub"}
              </button>
            ))}
          </div>
        )}

        {isHumanTurn && (state.phase === "question" || state.phase === "finalQuestion") && state.question && (
          <div className="tpf-qpanel">
            <div className="tpf-qcat" style={{ background: CATEGORY_COLORS[state.question.category] }}>
              {CATEGORY_LABEL[state.question.category]}
              {state.phase === "finalQuestion" && " — FINAL QUESTION"}
            </div>
            <div className="tpf-qtext">{state.question.question}</div>
            <div className="tpf-qchoices">
              {state.question.choices.map((choice, i) => (
                <button
                  key={i}
                  className={`tpf-btn tpf-qchoice ${state.selected === i ? "tpf-qchoice-sel" : ""}`}
                  data-testid={`hint-target-tpf-answer-${i}`}
                  title={`Select answer: ${choice}`}
                  onClick={() => dispatch({ type: "selectAnswer", choice: i } as TrivialPursuitFullAction)}
                >
                  {choice}
                </button>
              ))}
            </div>
            <button
              className="tpf-btn tpf-btn-submit"
              title="Submit your selected answer"
              disabled={state.selected === null}
              onClick={() => dispatch({ type: "submitAnswer" } as TrivialPursuitFullAction)}
            >
              Submit Answer
            </button>
          </div>
        )}

        {isHumanTurn && state.phase === "result" && (
          <div className="tpf-result bounce-in">
            <div className={state.lastCorrect ? "tpf-correct" : "tpf-wrong"}>
              {state.lastCorrect ? "Correct!" : "Incorrect."}
            </div>
            {state.question && !state.lastCorrect && (
              <div className="tpf-actual">Correct answer: {state.question.choices[state.question.correct]}</div>
            )}
            <button
              className="tpf-btn tpf-btn-continue"
              title="Continue to the next turn"
              onClick={() => dispatch({ type: "continue" } as TrivialPursuitFullAction)}
            >
              Continue
            </button>
          </div>
        )}
      </div>

      <div className="tpf-status pulse">
        Wedges: {CATEGORIES.filter(c => currentPlayer.wedges[c]).length}/6
        {hasAllWedges(currentPlayer) && " — head to the hub for the final!"}
      </div>
      <div className="tpf-meta">
        Players: {NUM_PLAYERS} • Ring: {RING_LEN} squares • Spokes: 6
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + Math.cos(ang) * r},${cy + Math.sin(ang) * r}`);
  }
  return pts.join(" ");
}
