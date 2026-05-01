import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface LogicPuzzlesQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LogicPuzzlesQuizSettings { questions: "10" | "20"; }
export interface LogicPuzzlesQuizState { questions: LogicPuzzlesQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LogicPuzzlesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: LogicPuzzlesQuizQuestion[] = [
  { question: "¬(P ∧ Q) is logically equivalent to?", choices: ["¬P ∧ ¬Q","¬P ∨ ¬Q","P ∨ Q","P → Q"], correct: 1 },
  { question: "¬(P ∨ Q) is logically equivalent to?", choices: ["¬P ∨ ¬Q","¬P ∧ ¬Q","P ∧ Q","P → ¬Q"], correct: 1 },
  { question: "P → Q is equivalent to?", choices: ["¬P ∨ Q","P ∧ ¬Q","¬P ∧ Q","Q → P"], correct: 0 },
  { question: "The contrapositive of P → Q is?", choices: ["Q → P","¬P → ¬Q","¬Q → ¬P","P ∧ ¬Q"], correct: 2 },
  { question: "The converse of P → Q is?", choices: ["¬Q → ¬P","Q → P","¬P → Q","¬P → ¬Q"], correct: 1 },
  { question: "Modus ponens infers Q from?", choices: ["P → Q and ¬P","P → Q and P","P → Q and ¬Q","P ∨ Q"], correct: 1 },
  { question: "Modus tollens infers ¬P from?", choices: ["P → Q and Q","P → Q and ¬Q","P ∨ Q","¬P → Q"], correct: 1 },
  { question: "A tautology is a statement that is?", choices: ["Always false","Sometimes true","Always true","Self-referential"], correct: 2 },
  { question: "A contradiction is?", choices: ["Always true","Always false","Sometimes true","Tautology"], correct: 1 },
  { question: "If all A are B and all B are C, then?", choices: ["All C are A","All A are C","No A are C","Some A are not C"], correct: 1 },
  { question: "'∀x P(x)' negates to?", choices: ["∀x ¬P(x)","∃x ¬P(x)","¬∃x P(x)","∃x P(x)"], correct: 1 },
  { question: "'∃x P(x)' negates to?", choices: ["∃x ¬P(x)","∀x ¬P(x)","¬∀x ¬P(x)","∀x P(x)"], correct: 1 },
  { question: "Liar paradox: 'This sentence is false' is?", choices: ["True","False","Neither true nor false","Both"], correct: 2 },
  { question: "In a knights/knaves puzzle, knights always?", choices: ["Lie","Tell the truth","Stay silent","Alternate"], correct: 1 },
  { question: "'If it rains, the ground is wet.' Ground is dry. Conclude?", choices: ["It rained","It did not rain","Cannot tell","Ground is wet"], correct: 1 },
  { question: "'P if and only if Q' is true when?", choices: ["Both true or both false","Exactly one true","P true only","Q true only"], correct: 0 },
  { question: "De Morgan's laws relate?", choices: ["AND/OR with NOT","Implication and OR","Quantifiers only","Equivalence only"], correct: 0 },
  { question: "A valid argument has?", choices: ["True premises only","If premises true, conclusion true","True conclusion always","No assumptions"], correct: 1 },
  { question: "A sound argument is?", choices: ["Valid","Valid with true premises","Has true conclusion","Persuasive"], correct: 1 },
  { question: "XOR (P ⊕ Q) is true when?", choices: ["Both true","Both false","Exactly one true","Neither"], correct: 2 },
  { question: "How many rows in a truth table for 3 variables?", choices: ["6","8","9","16"], correct: 1 },
  { question: "'Some swans are white' negates to?", choices: ["No swans are white","All swans are white","All swans are not white","Some swans are not white"], correct: 2 },
  { question: "In propositional logic, ⊥ denotes?", choices: ["True","False","Unknown","Implication"], correct: 1 },
  { question: "Which is a fallacy?", choices: ["Modus ponens","Modus tollens","Affirming the consequent","Disjunctive syllogism"], correct: 2 },
  { question: "Disjunctive syllogism: P∨Q and ¬P imply?", choices: ["P","Q","¬Q","P∧Q"], correct: 1 },
  { question: "Hypothetical syllogism: P→Q and Q→R imply?", choices: ["P→R","R→P","¬P→R","P∧R"], correct: 0 },
  { question: "'No A are B' is equivalent to?", choices: ["All A are B","All A are not B","Some A are B","Some A are not B"], correct: 1 },
  { question: "In a sequence 2,4,8,16,…, next term?", choices: ["24","28","32","30"], correct: 2 },
  { question: "Logic gate that outputs 1 only if both inputs are 1?", choices: ["OR","AND","XOR","NAND"], correct: 1 },
  { question: "Which is logically equivalent to P → Q?", choices: ["¬Q → ¬P","Q → P","¬P → ¬Q","P ∧ Q"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LogicPuzzlesQuizSettings): LogicPuzzlesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LogicPuzzlesQuizState, action: LogicPuzzlesQuizAction): LogicPuzzlesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LogicPuzzlesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
