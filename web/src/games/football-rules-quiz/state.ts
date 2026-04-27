import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FootballRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface FootballRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FootballRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many yards are needed for a first down?", choices: ["5", "7", "10", "15"], correct: 2 },
  { question: "How many players from each team are on the field at once?", choices: ["10", "11", "12", "13"], correct: 1 },
  { question: "A touchdown is worth?", choices: ["3", "6", "7", "8"], correct: 1 },
  { question: "Standard field goal extra point is worth?", choices: ["1", "2", "3", "6"], correct: 0 },
  { question: "How many downs does an offense have to gain 10 yards?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Length of an NFL football field including end zones?", choices: ["100 yards", "110 yards", "120 yards", "130 yards"], correct: 2 },
  { question: "Width of an NFL field?", choices: ["50 yards", "53 1/3 yards", "55 yards", "60 yards"], correct: 1 },
  { question: "Length of a regulation NFL game (excluding overtime)?", choices: ["48 minutes", "60 minutes", "70 minutes", "75 minutes"], correct: 1 },
  { question: "How long is an NFL play clock?", choices: ["25 seconds", "30 seconds", "40 seconds", "45 seconds"], correct: 2 },
  { question: "A safety is worth how many points?", choices: ["1", "2", "3", "6"], correct: 1 },
  { question: "Pass interference (offensive) penalty is what?", choices: ["5 yards", "10 yards", "15 yards", "spot foul"], correct: 1 },
  { question: "Defensive pass interference in the NFL is?", choices: ["5 yards", "10 yards", "15 yards", "spot foul"], correct: 3 },
  { question: "How many timeouts does each team get per half (NFL)?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "What penalty is jumping offside before the snap?", choices: ["False start", "Offside", "Encroachment", "Neutral zone infraction"], correct: 1 },
  { question: "When the offense moves before the snap, the penalty is?", choices: ["Offside", "False start", "Holding", "Encroachment"], correct: 1 },
  { question: "Number of officials on an NFL crew?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "Maximum pass attempt is from where?", choices: ["Anywhere behind the line", "Inside the pocket", "From the endzone", "From the 5-yard line"], correct: 0 },
  { question: "A two-point conversion is attempted from?", choices: ["1-yard line", "2-yard line", "3-yard line", "5-yard line"], correct: 1 },
  { question: "Holding is generally penalized how many yards (offensive)?", choices: ["5", "10", "15", "spot foul"], correct: 1 },
  { question: "NFL overtime length (regular season)?", choices: ["10 minutes", "15 minutes", "20 minutes", "sudden death"], correct: 0 },
  { question: "Intentional grounding causes loss of down and?", choices: ["5 yards", "10 yards", "15 yards or spot of foul", "automatic first down"], correct: 2 },
  { question: "Illegal use of hands penalty is how many yards?", choices: ["5", "10", "15", "spot of foul"], correct: 1 },
  { question: "How long is each quarter in an NFL game?", choices: ["10 minutes", "12 minutes", "15 minutes", "20 minutes"], correct: 2 },
  { question: "A field goal is worth?", choices: ["1 point", "2 points", "3 points", "6 points"], correct: 2 },
  { question: "What is the maximum length for a forward fumble recovery in the last 2 minutes (NFL)?", choices: ["Recovery only by fumbler", "5 yards", "10 yards", "Anywhere"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FootballRulesQuizSettings): FootballRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FootballRulesQuizState, action: FootballRulesQuizAction): FootballRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FootballRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
