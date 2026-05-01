import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TennisRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface TennisRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TennisRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many points to win a standard game?", choices: ["3 outright", "4 with at least 2 ahead", "5", "6"], correct: 1 },
  { question: "Score after winning the first point?", choices: ["10", "15", "30", "40"], correct: 1 },
  { question: "Score after winning the second point?", choices: ["15", "30", "40", "Game"], correct: 1 },
  { question: "Score after winning the third point?", choices: ["30", "40", "Deuce", "Game"], correct: 1 },
  { question: "Tied at 40-40 is called?", choices: ["Deuce", "Match point", "Tiebreak", "Advantage"], correct: 0 },
  { question: "Winning the next point after deuce gives you?", choices: ["Game", "Advantage", "Set", "Match"], correct: 1 },
  { question: "How many games to win a standard set?", choices: ["4", "5", "6 with at least 2 ahead", "7"], correct: 2 },
  { question: "A standard tiebreak is played to?", choices: ["5 points", "7 points (win by 2)", "10 points", "12 points"], correct: 1 },
  { question: "Best-of-3 sets is common in?", choices: ["Men's Grand Slams", "Women's professional matches", "Davis Cup finals", "Olympic men's finals"], correct: 1 },
  { question: "Best-of-5 sets is used in?", choices: ["WTA tour", "Men's Grand Slams", "Mixed doubles", "ATP 250 events"], correct: 1 },
  { question: "How many serves per point?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Two consecutive faults equal?", choices: ["Let", "Double fault, point lost", "Replay", "Warning"], correct: 1 },
  { question: "A serve that hits the net and lands in is?", choices: ["Fault", "Let", "Ace", "Point"], correct: 1 },
  { question: "A serve untouched by the receiver is an?", choices: ["Ace", "Let", "Winner", "Volley"], correct: 0 },
  { question: "Standard tennis court length?", choices: ["72 feet", "78 feet", "84 feet", "90 feet"], correct: 1 },
  { question: "Singles court width?", choices: ["27 feet", "30 feet", "36 feet", "40 feet"], correct: 0 },
  { question: "Doubles court width?", choices: ["27 feet", "30 feet", "36 feet", "40 feet"], correct: 2 },
  { question: "Net height at the center?", choices: ["3 feet", "3 feet 6 inches", "4 feet", "2 feet 6 inches"], correct: 0 },
  { question: "Net height at the posts?", choices: ["3 feet", "3 feet 6 inches", "4 feet", "4 feet 6 inches"], correct: 1 },
  { question: "How many ball changes typically in a Grand Slam match?", choices: ["Every 7 games then every 9", "Every 5 games", "Every 11 games", "Once per set"], correct: 0 },
  { question: "Server stands behind which line?", choices: ["Service line", "Baseline", "Net", "Sideline"], correct: 1 },
  { question: "Foot fault is called when?", choices: ["Server's foot crosses baseline before contact", "Server falls", "Server is too slow", "Player slips"], correct: 0 },
  { question: "In doubles, partners alternate serving how often?", choices: ["Every game", "Every set", "Every point", "Every other point"], correct: 0 },
  { question: "Final set tiebreak at all four Slams (since 2022) is to?", choices: ["7 points", "10 points (win by 2)", "12 points", "No tiebreak"], correct: 1 },
  { question: "Match point means?", choices: ["First point of match", "Point that wins the match", "Tiebreak point", "Halfway point"], correct: 1 },
  { question: "Hawk-Eye is used to review?", choices: ["Foot faults", "Line calls", "Time violations", "Foot positions"], correct: 1 },
  { question: "Time between points (most tours) is up to?", choices: ["10 seconds", "15 seconds", "25 seconds", "45 seconds"], correct: 2 },
  { question: "A let cord on a serve results in?", choices: ["Replay the serve", "Fault", "Point to server", "Point to receiver"], correct: 0 },
  { question: "In a tiebreak, players change ends every?", choices: ["3 points", "6 points", "8 points", "Set"], correct: 1 },
  { question: "Grand Slam tournaments per year?", choices: ["3", "4", "5", "6"], correct: 1 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TennisRulesQuizSettings): TennisRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TennisRulesQuizState, action: TennisRulesQuizAction): TennisRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TennisRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
