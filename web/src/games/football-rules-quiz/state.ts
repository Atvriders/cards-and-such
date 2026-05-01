import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FootballRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface FootballRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FootballRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players per team on the field in American football?", choices: ["10", "11", "12", "13"], correct: 1 },
  { question: "Length of an NFL field between goal lines?", choices: ["80 yards", "90 yards", "100 yards", "120 yards"], correct: 2 },
  { question: "Depth of each NFL end zone?", choices: ["5 yards", "10 yards", "15 yards", "20 yards"], correct: 1 },
  { question: "How many downs to make a first down?", choices: ["3", "4", "5", "2"], correct: 1 },
  { question: "Yards needed for a first down?", choices: ["5", "8", "10", "15"], correct: 2 },
  { question: "Points for a touchdown?", choices: ["3", "6", "7", "2"], correct: 1 },
  { question: "Points for a successful PAT (extra-point kick)?", choices: ["1", "2", "3", "6"], correct: 0 },
  { question: "Points for a field goal?", choices: ["2", "3", "4", "6"], correct: 1 },
  { question: "Points for a safety?", choices: ["1", "2", "3", "6"], correct: 1 },
  { question: "Length of an NFL regular-season quarter?", choices: ["12 minutes", "15 minutes", "20 minutes", "30 minutes"], correct: 1 },
  { question: "NFL play clock length on most plays?", choices: ["25 seconds", "30 seconds", "40 seconds", "45 seconds"], correct: 2 },
  { question: "How many timeouts per half does each NFL team get?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Encroachment, false start, and offsides are typically what?", choices: ["10-yard penalties", "5-yard penalties", "15-yard penalties", "Loss of down"], correct: 1 },
  { question: "Defensive pass interference in the NFL is what kind of penalty?", choices: ["10 yards", "15 yards", "Spot foul", "Loss of down only"], correct: 2 },
  { question: "Roughing the passer is typically how many yards?", choices: ["5", "10", "15", "20"], correct: 2 },
  { question: "How many officials work an NFL game?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "Width of an NFL field?", choices: ["40 yards", "45 yards", "53 1/3 yards", "60 yards"], correct: 2 },
  { question: "Standard NFL active roster size?", choices: ["46", "48", "53", "58"], correct: 2 },
  { question: "A two-point conversion is attempted from which yard line (NFL)?", choices: ["1", "2", "5", "10"], correct: 1 },
  { question: "On most plays, the play clock starts at how many seconds?", choices: ["25", "40", "45", "60"], correct: 1 },
  { question: "Overtime in the NFL regular season is how long?", choices: ["10 minutes", "15 minutes", "20 minutes", "Sudden death only"], correct: 0 },
  { question: "A fair catch on a punt is signaled by?", choices: ["One arm raised", "Both arms raised", "Hand wave", "One arm waved overhead"], correct: 3 },
  { question: "How long does an NFL halftime last (regular season)?", choices: ["10 minutes", "12 minutes", "13 minutes", "20 minutes"], correct: 1 },
  { question: "Offensive holding is what penalty?", choices: ["5 yards", "10 yards", "15 yards", "Loss of down"], correct: 1 },
  { question: "Intentional grounding penalty is?", choices: ["5 yards and loss of down", "10 yards and loss of down", "15 yards", "Spot foul and loss of down"], correct: 3 },
  { question: "Kickoffs in the NFL take place from which yard line?", choices: ["20", "25", "30", "35"], correct: 3 },
  { question: "How many players must be on the line of scrimmage for offense?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "On a kickoff, the receiving team typically must travel at least how far for a live ball?", choices: ["5 yards", "10 yards", "15 yards", "20 yards"], correct: 1 },
  { question: "Unnecessary roughness is what penalty?", choices: ["5 yards", "10 yards", "15 yards", "Ejection only"], correct: 2 },
  { question: "How many points is a defensive two-point conversion?", choices: ["1", "2", "3", "6"], correct: 1 }

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
