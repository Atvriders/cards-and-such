import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WrestlingRulesQuizSettings { questions: "10" | "20"; }
export interface WrestlingRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WrestlingRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What are the two main Olympic wrestling styles?", choices: ["Freestyle and Greco-Roman", "Sumo and Greco", "Judo and Freestyle", "Folkstyle and BJJ"], correct: 0 },
  { question: "In Greco-Roman, which is forbidden?", choices: ["Holds below the waist", "Throws", "Lifts", "Pinning"], correct: 0 },
  { question: "How is a pin (fall) achieved in wrestling?", choices: ["Both shoulders on mat", "One shoulder pinned", "10-second hold", "Verbal submission"], correct: 0 },
  { question: "How many periods in an Olympic wrestling match?", choices: ["1", "2", "3", "5"], correct: 1 },
  { question: "How long is each period?", choices: ["2 min", "3 min", "5 min", "8 min"], correct: 1 },
  { question: "How is a 'technical superiority' victory achieved?", choices: ["Lead by 10 points (free) or 8 (Greco)", "First fall", "20 points", "Submission"], correct: 0 },
  { question: "What is a takedown worth (typically)?", choices: ["1 point", "2 points", "3 points", "5 points"], correct: 1 },
  { question: "How many points for a 'high amplitude throw'?", choices: ["2", "3", "4", "5"], correct: 3 },
  { question: "Which mat is used in Olympic wrestling?", choices: ["Rectangular ring", "Octagon", "Circular wrestling mat", "Square ring"], correct: 2 },
  { question: "What's the diameter of the central wrestling area?", choices: ["5m", "7m", "9m", "12m"], correct: 2 },
  { question: "Greco-Roman wrestling features bouts where?", choices: ["Only upper body", "Only lower body", "Both", "Only standing"], correct: 0 },
  { question: "Wrestling is one of the original Olympic sports from?", choices: ["1896 modern", "Ancient Greece (708 BC)", "Both", "1900"], correct: 2 },
  { question: "Women's freestyle wrestling debuted in Olympics in?", choices: ["1996", "2000", "2004", "2008"], correct: 2 },
  { question: "What does 'passivity' mean?", choices: ["Wrestler not actively attacking", "Aggressive attack", "Pin held", "Score doubled"], correct: 0 },
  { question: "What outcome is a 'fall'?", choices: ["Loss by pin", "Slip from boundary", "Time expiry", "Score tie"], correct: 0 },
  { question: "How is overtime decided if scores tied?", choices: ["Higher value last move wins", "Coin flip", "Sudden death", "No tiebreaker"], correct: 0 },
  { question: "What singlet is required at Olympics?", choices: ["Red or blue (assigned)", "Always white", "Color of choice", "No singlet"], correct: 0 },
  { question: "Which wrestler dominates 'Pound for Pound' lists?", choices: ["Aleksandr Karelin", "Buvaisar Saitiev", "Both legendary", "Jordan Burroughs"], correct: 2 },
  { question: "How many weight classes exist for men's freestyle wrestling at Olympics?", choices: ["3", "5", "6 (currently)", "10"], correct: 2 },
  { question: "Freestyle differs from Greco-Roman by?", choices: ["Allowing leg attacks", "No mat use", "Different time", "No singlet"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WrestlingRulesQuizSettings): WrestlingRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WrestlingRulesQuizState, action: WrestlingRulesQuizAction): WrestlingRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WrestlingRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
