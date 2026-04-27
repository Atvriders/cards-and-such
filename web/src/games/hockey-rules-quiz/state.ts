import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HockeyRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface HockeyRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HockeyRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players (including goalie) per team on the ice?", choices: ["5", "6", "7", "8"], correct: 1 },
  { question: "How many periods in an NHL game?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Length of each NHL period?", choices: ["15 minutes", "20 minutes", "22 minutes", "25 minutes"], correct: 1 },
  { question: "A minor penalty is how many minutes?", choices: ["1", "2", "4", "5"], correct: 1 },
  { question: "A major penalty lasts how many minutes?", choices: ["2", "3", "5", "7"], correct: 2 },
  { question: "Icing occurs when a player shoots from behind?", choices: ["Center line into opposing zone past the goal line", "Their blue line", "The faceoff dot", "Anywhere"], correct: 0 },
  { question: "Offside is called when?", choices: ["Puck enters zone before attacker", "Goalie touches puck", "Skater hits opponent", "Center crosses redline"], correct: 0 },
  { question: "Length of NHL overtime in regular season?", choices: ["3 minutes", "5 minutes", "10 minutes", "20 minutes"], correct: 1 },
  { question: "Number of shooters in an NHL shootout (initial)?", choices: ["1", "3", "5", "7"], correct: 1 },
  { question: "Diameter of a hockey puck?", choices: ["2 inches", "2.5 inches", "3 inches", "3.5 inches"], correct: 2 },
  { question: "Weight of a regulation NHL puck?", choices: ["4 ounces", "5.5-6 ounces", "7 ounces", "8 ounces"], correct: 1 },
  { question: "Standard NHL rink length?", choices: ["180 feet", "200 feet", "220 feet", "250 feet"], correct: 1 },
  { question: "Standard NHL rink width?", choices: ["80 feet", "85 feet", "90 feet", "100 feet"], correct: 1 },
  { question: "International rink (Olympic) width?", choices: ["85 feet", "95 feet", "100 feet", "120 feet"], correct: 2 },
  { question: "NHL playoff overtime length?", choices: ["5 minutes sudden death", "10 minutes", "15 minutes", "20 minutes sudden death"], correct: 3 },
  { question: "Hat trick means?", choices: ["3 goals one game", "3 assists", "3 saves", "3 fights"], correct: 0 },
  { question: "Penalty shot is awarded when?", choices: ["Goalie covers puck", "Shooter on a breakaway is fouled", "Faceoff disagreement", "Two minor penalties"], correct: 1 },
  { question: "How many faceoff dots on an NHL ice surface?", choices: ["7", "8", "9", "10"], correct: 2 },
  { question: "What's the goalie trapezoid for?", choices: ["Restrict goalie puck handling behind net", "Where goalie warms up", "Practice space", "Penalty area"], correct: 0 },
  { question: "A team short two penalized players plays?", choices: ["3-on-5", "4-on-5", "3-on-4", "3-on-3"], correct: 0 },
  { question: "First Stanley Cup was awarded in?", choices: ["1893", "1900", "1917", "1925"], correct: 0 },
  { question: "Number of officials on the ice in NHL?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Goal crease shape (NHL)?", choices: ["Square", "Half-circle", "Trapezoid", "Rectangle"], correct: 1 },
  { question: "Empty net goal happens when?", choices: ["Goalie pulled", "Power play", "Faceoff lost", "First period"], correct: 0 },
  { question: "NHL season regular games?", choices: ["72", "78", "82", "90"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HockeyRulesQuizSettings): HockeyRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HockeyRulesQuizState, action: HockeyRulesQuizAction): HockeyRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HockeyRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
