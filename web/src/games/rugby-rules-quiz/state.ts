import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RugbyRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface RugbyRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RugbyRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players per side in rugby union?", choices: ["13", "14", "15", "16"], correct: 2 },
  { question: "How many players per side in rugby league?", choices: ["11", "12", "13", "15"], correct: 2 },
  { question: "How many points is a try in rugby union?", choices: ["3", "4", "5", "7"], correct: 2 },
  { question: "How many points is a try in rugby league?", choices: ["3", "4", "5", "7"], correct: 1 },
  { question: "How many points is a successful conversion in rugby union?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "How many points is a penalty kick in rugby union?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "How many points is a drop goal in rugby union?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Length of a rugby union match (regulation)?", choices: ["60 minutes", "70 minutes", "80 minutes", "90 minutes"], correct: 2 },
  { question: "Length of each half in rugby union?", choices: ["30 minutes", "35 minutes", "40 minutes", "45 minutes"], correct: 2 },
  { question: "Length of a rugby pitch (try-line to try-line)?", choices: ["80 meters", "100 meters", "120 meters", "150 meters"], correct: 1 },
  { question: "Width of a rugby pitch?", choices: ["60 meters", "70 meters", "80 meters", "90 meters"], correct: 1 },
  { question: "How is a scrum formed?", choices: ["Mass tackle", "8 forwards from each side bind", "Captains shake hands", "Goalkeeper places ball"], correct: 1 },
  { question: "How is a lineout formed?", choices: ["Touchline restart", "In scrum", "In conversion", "At kickoff"], correct: 0 },
  { question: "Forward pass is?", choices: ["Ball thrown forward", "Ball backward", "Ball laterally", "Ball into stand"], correct: 0 },
  { question: "A knock-on is?", choices: ["Ball forward off body", "Foot pass", "Lineout call", "Scrum win"], correct: 0 },
  { question: "Sin-bin in rugby union is how long?", choices: ["5 minutes", "7 minutes", "10 minutes", "15 minutes"], correct: 2 },
  { question: "A red card means?", choices: ["Warning", "Off for the rest of match", "5-min sin bin", "Penalty"], correct: 1 },
  { question: "How many points is a try in rugby sevens?", choices: ["3", "5", "7", "10"], correct: 1 },
  { question: "Length of a sevens match (regulation, per half)?", choices: ["5 minutes", "7 minutes", "10 minutes", "15 minutes"], correct: 1 },
  { question: "How many tackles before turnover in rugby league?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "A 22 dropout occurs in rugby union when?", choices: ["Defending team grounds ball in own in-goal", "Coin toss", "Halftime", "After conversion"], correct: 0 },
  { question: "Where is the ball placed at start of half?", choices: ["Halfway line", "22", "Try line", "5 meter line"], correct: 0 },
  { question: "Maul is?", choices: ["Tackle situation", "Standing players bound with ball carrier on feet", "Lineout call", "Scrum"], correct: 1 },
  { question: "Ruck is?", choices: ["Standing maul", "One or more players from each team meet over the ball on the ground", "Lineout", "Scrum"], correct: 1 },
  { question: "How often is the Rugby World Cup held?", choices: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RugbyRulesQuizSettings): RugbyRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RugbyRulesQuizState, action: RugbyRulesQuizAction): RugbyRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RugbyRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
