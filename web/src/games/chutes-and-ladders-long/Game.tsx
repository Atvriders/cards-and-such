import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LongState, LongSettings, LongAction } from "./state.js";
import {
  isTerminal,
  legalChoices,
  SPECIALS,
  HOME,
  MAIN_TRACK_LEN,
  BONUS_START,
  PAWNS_PER_PLAYER,
  NUM_PLAYERS,
} from "./state.js";
import "./Game.css";

const PLAYER_COLORS = ["p0", "p1", "p2", "p3"] as const;
const PLAYER_LABELS = ["You", "CPU 1", "CPU 2", "CPU 3"] as const;

export function ChutesLongGame({ state, dispatch, onGameOver }: GameProps<LongState, LongSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Drive CPU turns automatically with a small delay so the UI can update.
  useEffect(() => {
    if (state.phase !== "rolling") return;
    if (state.turn === 0) return;
    if (isTerminal(state)) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } as LongAction);
    }, 650);
    return () => window.clearTimeout(id);
  }, [state, dispatch]);

  const term = isTerminal(state);

  if (term) {
    const youWon = state.winner === 0;
    return (
      <div className="cll-wrap fade-in">
        <div className="cll-overpanel bounce-in">
          <h2 className={`cll-banner ${youWon ? "cll-win" : "cll-loss"}`}>
            {youWon ? "You completed the Long Edition!" : `${PLAYER_LABELS[state.winner ?? 1]} got all 4 pawns home first.`}
          </h2>
          <div className="cll-finalscore pulse">Final score: {state.score}</div>
          <div className="cll-finalstats">
            Pawns home: {state.positions[0]!.filter((p) => p >= HOME).length} / {PAWNS_PER_PLAYER}
          </div>
        </div>
      </div>
    );
  }

  const isYourTurn = state.turn === 0;
  const youChoices = isYourTurn && state.phase === "moving" ? legalChoices(state, 0, state.die) : [];

  // Build cell list. We render the bonus track separately for clarity.
  const mainCells = Array.from({ length: MAIN_TRACK_LEN }, (_, i) => i + 1); // 1..100
  const bonusCells = Array.from({ length: HOME - BONUS_START + 1 }, (_, i) => BONUS_START + i); // 101..110

  return (
    <div className="cll-wrap fade-in">
      <div className="cll-status" data-testid="cll-status">
        {isYourTurn
          ? state.phase === "rolling"
            ? "Your turn — roll the die."
            : "Pick a pawn to advance."
          : `${PLAYER_LABELS[state.turn]} is thinking...`}
      </div>

      <div className="cll-meta">
        <span className="cll-info">Track: 1-{MAIN_TRACK_LEN} + bonus {BONUS_START}-{HOME}</span>
        <span className="cll-info">4 pawns each</span>
        {state.lastPush && (
          <span className="cll-info cll-bump">
            Pile-up! {PLAYER_LABELS[state.lastPush.player]} pawn #{state.lastPush.pawnIdx + 1} pushed
            from {state.lastPush.from} to {state.lastPush.to}.
          </span>
        )}
      </div>

      <div className="cll-dicerow">
        <div className={`cll-die ${state.die ? "cll-die-shown" : "cll-die-empty"}`}>
          {state.die || "-"}
        </div>
        {isYourTurn && state.phase === "rolling" && (
          <button
            className="cll-btn cll-btn-roll"
            data-testid="cll-roll"
            title="Roll the die for your turn"
            onClick={() => dispatch({ type: "roll" } as LongAction)}
          >
            Roll Die
          </button>
        )}
        {isYourTurn && state.phase === "moving" && (
          <span className="cll-dleft">Rolled {state.die} — pick a pawn below.</span>
        )}
      </div>

      <div className="cll-scoreboard">
        {Array.from({ length: NUM_PLAYERS }, (_, p) => {
          const home = state.positions[p]!.filter((x) => x >= HOME).length;
          return (
            <div key={p} className={`cll-scorecard cll-${PLAYER_COLORS[p]} ${state.turn === p ? "cll-active" : ""}`}>
              <span className="cll-pname">{PLAYER_LABELS[p]}</span>
              <span className="cll-phome">{home}/{PAWNS_PER_PLAYER} home</span>
            </div>
          );
        })}
      </div>

      <div className="cll-tracks">
        <div className="cll-track cll-track-main">
          <div className="cll-track-label">Main Track</div>
          <div className="cll-board">
            {mainCells.map((i) => renderCell(i, state))}
          </div>
        </div>
        <div className="cll-track cll-track-bonus">
          <div className="cll-track-label">Bonus Track (unlocks after 100)</div>
          <div className="cll-board cll-board-bonus">
            {bonusCells.map((i) => renderCell(i, state))}
          </div>
        </div>
      </div>

      {isYourTurn && state.phase === "moving" && (
        <div className="cll-controls">
          <div className="cll-label">Your pawns:</div>
          <div className="cll-pawnrow">
            {state.positions[0]!.map((pos, idx) => {
              const canMove = youChoices.includes(idx);
              const where = pos === 0 ? "(start)" : pos >= HOME ? "(home)" : `@ ${pos}`;
              return (
                <div key={idx} className={`cll-pawncard ${canMove ? "cll-pawn-active" : "cll-pawn-disabled"}`}>
                  <span className="cll-pawnname">Pawn {idx + 1} {where}</span>
                  <button
                    className="cll-movebtn"
                    data-testid={`cll-move-${idx}`}
                    title={canMove ? `Advance pawn ${idx + 1} by ${state.die}` : "Not eligible this roll"}
                    disabled={!canMove}
                    onClick={() => dispatch({ type: "move", pawnIdx: idx } as LongAction)}
                  >
                    +{state.die}
                  </button>
                </div>
              );
            })}
          </div>
          {youChoices.length === 1 && (
            <div className="cll-forced">
              Only your leading pawn can advance without backsliding — forced move.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderCell(i: number, state: LongState): JSX.Element {
  const sp = SPECIALS[i];
  // Find pawns here
  const pawnsHere: { player: number; pawnIdx: number }[] = [];
  for (let p = 0; p < state.positions.length; p++) {
    for (let k = 0; k < state.positions[p]!.length; k++) {
      if (state.positions[p]![k] === i) pawnsHere.push({ player: p, pawnIdx: k });
    }
  }
  const isHome = i === HOME;
  const cls = [
    "cll-cell",
    sp ? `cll-special-${sp.type}` : "",
    isHome ? "cll-cell-home" : "",
    i >= BONUS_START ? "cll-cell-bonus" : "",
  ].filter(Boolean).join(" ");
  return (
    <div key={i} className={cls} title={sp ? `${sp.type === "ladder" ? "Ladder" : "Chute"} ${i} -> ${sp.to}` : `Square ${i}`}>
      <span className="cll-cellnum">{i}</span>
      {sp && (
        <span className={`cll-sptag cll-sp-${sp.type}`}>
          {sp.type === "ladder" ? `L→${sp.to}` : `C→${sp.to}`}
        </span>
      )}
      {isHome && <span className="cll-sptag cll-sp-home">HOME</span>}
      {pawnsHere.length > 0 && (
        <div className="cll-tokens">
          {pawnsHere.map((p) => (
            <span
              key={`${p.player}-${p.pawnIdx}`}
              className={`cll-tok cll-tok-${PLAYER_COLORS[p.player]}`}
              title={`${PLAYER_LABELS[p.player]} pawn ${p.pawnIdx + 1}`}
            >
              {p.pawnIdx + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
