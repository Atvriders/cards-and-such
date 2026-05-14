import { useEffect, useRef, useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PictionaryState, PictionarySettings, PictionaryAction } from "./state.js";
import { isTerminal, WORD_BANK, BOARD_SIZE, TURN_SECONDS, SQUARES_PER_CATEGORY } from "./state.js";
import "./Game.css";

type Tool = "pen" | "eraser";

const CATEGORY_LABEL: Record<string, string> = {
  person: "Person",
  object: "Object",
  action: "Action",
  animal: "Animal",
  difficult: "Difficult / All-Play",
};

export function PictionaryGame({ state, dispatch, onGameOver }: GameProps<PictionaryState, PictionarySettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const [tool, setTool] = useState<Tool>("pen");
  const [wordRevealed, setWordRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Timer: tick every second while drawing
  useEffect(() => {
    if (state.phase !== "drawing") return;
    const id = window.setInterval(() => {
      dispatch({ type: "tick" } as PictionaryAction);
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.phase, dispatch]);

  // Reset reveal whenever we leave drawing
  useEffect(() => {
    if (state.phase !== "drawing") setWordRevealed(false);
  }, [state.phase]);

  // Clear canvas at the start of each drawing turn
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (state.phase === "drawing" && state.turnAdvance === 0 && state.turnSkips === 0) {
      // turn just started
      clearCanvas();
    }
  }, [state.phase, state.turnAdvance, state.turnSkips, clearCanvas]);

  // Initialize canvas
  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (state.phase !== "drawing") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPosRef.current = pointerPos(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cur = pointerPos(e);
    const last = lastPosRef.current ?? cur;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "pen") {
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 18;
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
    lastPosRef.current = cur;
  };

  const onPointerUp = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  const term = isTerminal(state);
  if (term) {
    const winTeam = state.winner === 0 ? "Team 1" : "Team 2";
    const margin = Math.max(0, state.teamPositions[state.winner ?? 0] - state.teamPositions[state.winner === 0 ? 1 : 0]);
    return (
      <div className="pict-wrap fade-in">
        <div className="pict-done bounce-in">
          <h2>{winTeam} wins!</h2>
          <div className="pict-score pulse">Score: {term.score}</div>
          <div className="pict-margin">Square margin: {margin}</div>
          <div className="pict-correct-summary">
            Team 1 guessed {state.totalCorrect[0]} | Team 2 guessed {state.totalCorrect[1]}
          </div>
        </div>
      </div>
    );
  }

  const word = state.currentWordIdx >= 0 ? WORD_BANK[state.currentWordIdx] : null;
  const currentTeamLabel = state.currentTeam === 0 ? "Team 1" : "Team 2";

  return (
    <div className="pict-wrap fade-in">
      <header className="pict-header">
        <div className="pict-teams">
          <div className={`pict-team t1 ${state.currentTeam === 0 ? "active" : ""}`}>
            <strong>Team 1</strong>
            <span>Square {state.teamPositions[0]} / {BOARD_SIZE}</span>
          </div>
          <div className={`pict-team t2 ${state.currentTeam === 1 ? "active" : ""}`}>
            <strong>Team 2</strong>
            <span>Square {state.teamPositions[1]} / {BOARD_SIZE}</span>
          </div>
        </div>
        <div className="pict-timer pulse" data-low={state.timeLeft <= 10}>
          {state.phase === "drawing" ? `${state.timeLeft}s` : `${TURN_SECONDS}s`}
        </div>
      </header>

      <div className="pict-board">
        {Array.from({ length: BOARD_SIZE + 1 }, (_, i) => {
          const here1 = state.teamPositions[0] === i;
          const here2 = state.teamPositions[1] === i;
          return (
            <div key={i} className="pict-square" data-finish={i === BOARD_SIZE}>
              <span className="pict-square-num">{i}</span>
              {here1 && <span className="pict-pawn p1" title="Team 1 pawn">1</span>}
              {here2 && <span className="pict-pawn p2" title="Team 2 pawn">2</span>}
            </div>
          );
        })}
      </div>

      {state.phase === "setup" && (
        <div className="pict-panel">
          <div className="pict-status">{currentTeamLabel}'s turn — choose a drawer, then press Start.</div>
          <button
            data-testid="pictionary-start"
            className="pict-btn primary"
            title="Start the 60-second drawing turn"
            onClick={() => dispatch({ type: "start" } as PictionaryAction)}
          >
            Start {currentTeamLabel}'s Turn
          </button>
        </div>
      )}

      {state.phase === "drawing" && word && (
        <>
          <div className="pict-panel">
            <div className="pict-status">
              {currentTeamLabel} drawing — guess the word!
              <span className="pict-tally"> Correct this turn: {state.turnAdvance / Math.max(1, SQUARES_PER_CATEGORY[word.category]) | 0}+ (advanced {state.turnAdvance})</span>
            </div>
            <div className="pict-word-row">
              <span className="pict-category">{CATEGORY_LABEL[word.category]}</span>
              {wordRevealed ? (
                <span className="pict-word">{word.word}</span>
              ) : (
                <button
                  className="pict-btn"
                  title="Drawer only — reveal the secret word"
                  onClick={() => setWordRevealed(true)}
                >
                  Drawer: tap to reveal word
                </button>
              )}
              {wordRevealed && (
                <button
                  className="pict-btn small"
                  title="Hide the word again"
                  onClick={() => setWordRevealed(false)}
                >
                  Hide
                </button>
              )}
            </div>
          </div>

          <div className="pict-canvas-row">
            <div className="pict-tools">
              <button
                className={`pict-tool ${tool === "pen" ? "active" : ""}`}
                title="Pen tool — draw lines"
                aria-label="Pen tool"
                onClick={() => setTool("pen")}
              >
                Pen
              </button>
              <button
                className={`pict-tool ${tool === "eraser" ? "active" : ""}`}
                title="Eraser tool — clear parts of the drawing"
                aria-label="Eraser tool"
                onClick={() => setTool("eraser")}
              >
                Eraser
              </button>
              <button
                className="pict-tool"
                title="Clear the canvas completely"
                onClick={clearCanvas}
              >
                Clear
              </button>
            </div>
            <canvas
              ref={canvasRef}
              className="pict-canvas"
              width={600}
              height={360}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              data-testid="pictionary-canvas"
            />
          </div>

          <div className="pict-actions">
            <button
              data-testid="pictionary-correct"
              className="pict-btn primary"
              title="Mark this word as correctly guessed — advance and draw a new word"
              onClick={() => dispatch({ type: "correct" } as PictionaryAction)}
            >
              Got it!
            </button>
            <button
              className="pict-btn"
              title="Skip this word and draw a new one (no advance)"
              onClick={() => dispatch({ type: "skip" } as PictionaryAction)}
            >
              Skip
            </button>
            <button
              className="pict-btn"
              title="End this turn now"
              onClick={() => dispatch({ type: "timeout" } as PictionaryAction)}
            >
              End Turn
            </button>
          </div>
        </>
      )}

      {state.phase === "turnover" && (
        <div className="pict-panel bounce-in">
          <div className="pict-status">
            Time's up! {currentTeamLabel} advanced {state.turnAdvance} square{state.turnAdvance === 1 ? "" : "s"}
            {state.turnSkips > 0 ? ` (skipped ${state.turnSkips})` : ""}.
          </div>
          <button
            data-testid="pictionary-next-turn"
            className="pict-btn primary"
            title="Pass control to the other team"
            onClick={() => dispatch({ type: "nextTurn" } as PictionaryAction)}
          >
            Pass to {state.currentTeam === 0 ? "Team 2" : "Team 1"}
          </button>
        </div>
      )}
    </div>
  );
}
