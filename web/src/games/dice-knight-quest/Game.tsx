import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKnightQuestState, DiceKnightQuestAction, DiceKnightQuestSettings } from "./state.js";
import { isTerminal, KNIGHT_MAX_HP } from "./state.js";
import "./Game.css";

export function DiceKnightQuestGame({ state, dispatch, onGameOver }: GameProps<DiceKnightQuestState, DiceKnightQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const won = state.knightHp > 0;
    return (
      <div className="kq-wrap">
        <div className="kq-done">
          <h2>{won ? "Quest Complete" : "The Knight Falls"}</h2>
          <div className="kq-final">{state.score} pts</div>
          <div className="kq-foe-meta" style={{ marginTop: 10 }}>{state.log}</div>
        </div>
      </div>
    );
  }

  const monster = state.monsters[state.current]!;
  const knightPct = (state.knightHp / KNIGHT_MAX_HP) * 100;
  const foePct = (monster.hp / monster.maxHp) * 100;

  return (
    <div className="kq-wrap">
      <div className="kq-banner">Knight Quest — Foe {state.current + 1} of {state.monsters.length}</div>

      <div className="kq-stats">
        <div className="kq-stat">
          <div className="kq-stat-label">Knight HP</div>
          <div className="kq-stat-val">{state.knightHp} / {KNIGHT_MAX_HP}</div>
          <div className="kq-hpbar knight"><span style={{ width: knightPct + "%" }} /></div>
        </div>
        <div className="kq-stat">
          <div className="kq-stat-label">Score</div>
          <div className="kq-stat-val">{state.score}</div>
        </div>
      </div>

      <div className="kq-arena">
        <div className="kq-foe-name">{monster.name}</div>
        <div className="kq-foe-meta">DEF {monster.def} · Bounty {monster.reward}</div>
        <div className="kq-hpbar foe" style={{ marginTop: 8 }}><span style={{ width: foePct + "%" }} /></div>
        <div className="kq-foe-meta" style={{ marginTop: 4 }}>{monster.hp} / {monster.maxHp} HP</div>

        {state.lastAttack !== null && (
          <div className="kq-roll">
            <div className="kq-d20">{state.lastAttack}</div>
            {state.lastDamageDealt > 0 && <div className="kq-d6">{state.lastDamageDealt}</div>}
          </div>
        )}

        <div className="kq-log">{state.log || "Strike with d20 vs DEF, then deal d6 damage on hit."}</div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          {state.phase === "attack" && (
            <button className="kq-btn" onClick={() => dispatch({ type: "attack" } as DiceKnightQuestAction)}>Attack</button>
          )}
          {(state.phase === "result" || state.phase === "victory" || state.phase === "defeat") && (
            <button className="kq-btn alt" onClick={() => dispatch({ type: "next" } as DiceKnightQuestAction)}>
              {state.phase === "victory" ? (state.current + 1 >= state.monsters.length ? "Finish" : "Next Foe") :
                state.phase === "defeat" ? "End" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
