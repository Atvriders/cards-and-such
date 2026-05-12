import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceWizardSpellState, DiceWizardSpellAction, DiceWizardSpellSettings, School } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, SCHOOLS, spellPower, STARTING_MANA } from "./state.js";
import "./Game.css";

const SCHOOL_GLYPH: Record<School, string> = { fire: "FIR", ice: "ICE", arc: "ARC" } as unknown as Record<School, string>;
const SCHOOL_LABEL: Record<School, string> = { fire: "Fire", ice: "Ice", arcane: "Arcane" };

export function DiceWizardSpellGame({ state, dispatch, onGameOver }: GameProps<DiceWizardSpellState, DiceWizardSpellSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ws-wrap">
        <div className="ws-done bounce-in">
          <h2>Spellbook Complete</h2>
          <div className="ws-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ws-wrap">
      <div className="ws-banner">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ws-stats">
        <div className="ws-stat"><div className="ws-stat-label">Mana</div><div className="ws-stat-val">{state.mana} / {STARTING_MANA}</div></div>
        <div className="ws-stat"><div className="ws-stat-label">Score</div><div className="ws-stat-val">{state.score}</div></div>
      </div>

      <div className="ws-runes">
        {state.rolls.length === 0
          ? <div className="ws-empty">Channel the runes…</div>
          : state.rolls.map((r, i) => <div key={i} className={`ws-rune r${r}`}>{r}</div>)
        }
      </div>

      {state.phase === "channel" && (
        <>
          <button
            className="ws-btn"
            data-testid="hint-target-dice-wizard-spell-roll" onClick={() => dispatch({ type: "roll" } as DiceWizardSpellAction)}
            disabled={state.mana <= 0}
          >Channel ({state.mana} mana left)</button>
          <div className="ws-schools">
            {SCHOOLS.map(s => {
              const preview = state.rolls.length > 0 ? spellPower(state.rolls, s).pts : 0;
              return (
                <button
                  key={s}
                  className={`ws-school ${s}`}
                  disabled={state.rolls.length === 0}
                  onClick={() => dispatch({ type: "cast", school: s } as DiceWizardSpellAction)}
                >
                  <span className="ws-school-name">{SCHOOL_LABEL[s]}</span>
                  <span className="ws-school-pts">{preview > 0 ? `+${preview}` : "—"}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {state.phase === "scored" && (
        <>
          <div className="ws-result">+{state.lastPts} pts</div>
          <div className="ws-desc">{state.lastDesc}</div>
          <button className="ws-btn alt" data-testid="hint-target-dice-wizard-spell-next" onClick={() => dispatch({ type: "next" } as DiceWizardSpellAction)}>
            {state.round >= TOTAL_ROUNDS ? "Finish" : "Next Round"}
          </button>
        </>
      )}
    </div>
  );
}

void SCHOOL_GLYPH;
