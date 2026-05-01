import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HockeyRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface HockeyRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HockeyRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many skaters from one team are on the ice during even strength (excluding goalie)?", choices: ["4", "5", "6", "7"], correct: 1 },
  { question: "Length of an NHL regulation period?", choices: ["15 minutes", "18 minutes", "20 minutes", "25 minutes"], correct: 2 },
  { question: "How many periods in an NHL game?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Length of an NHL regular-season overtime?", choices: ["3 minutes", "5 minutes", "10 minutes", "15 minutes"], correct: 1 },
  { question: "Regular-season OT is played at what strength?", choices: ["5-on-5", "4-on-4", "3-on-3", "6-on-6"], correct: 2 },
  { question: "A minor penalty in the NHL is how long?", choices: ["1 minute", "2 minutes", "4 minutes", "5 minutes"], correct: 1 },
  { question: "A major penalty is how long?", choices: ["2 minutes", "3 minutes", "5 minutes", "10 minutes"], correct: 2 },
  { question: "A misconduct penalty is how long?", choices: ["2 minutes", "5 minutes", "10 minutes", "Game"], correct: 2 },
  { question: "Icing is called when the puck is shot from behind the center red line and?", choices: ["Crosses center", "Goes out of bounds", "Crosses the goal line untouched", "Hits a player"], correct: 2 },
  { question: "Offside is called when an attacker enters the offensive zone before?", choices: ["The puck", "The center", "The goalie", "Any teammate"], correct: 0 },
  { question: "How many on-ice officials are typical in an NHL game?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Width of an NHL goal mouth?", choices: ["4 feet", "5 feet", "6 feet", "8 feet"], correct: 2 },
  { question: "Height of an NHL goal?", choices: ["3 feet", "4 feet", "5 feet", "6 feet"], correct: 1 },
  { question: "NHL rink length?", choices: ["180 feet", "200 feet", "220 feet", "240 feet"], correct: 1 },
  { question: "NHL rink width?", choices: ["70 feet", "80 feet", "85 feet", "100 feet"], correct: 2 },
  { question: "A shootout in the NHL regular season has how many initial rounds?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "How many timeouts does each team get in an NHL game?", choices: ["0", "1", "2", "3"], correct: 1 },
  { question: "Length of an NHL timeout?", choices: ["30 seconds", "45 seconds", "60 seconds", "2 minutes"], correct: 0 },
  { question: "Hooking is what kind of penalty?", choices: ["Minor", "Major", "Misconduct", "Match"], correct: 0 },
  { question: "A penalty shot is awarded for what?", choices: ["Any minor", "A breakaway foul from behind", "Fighting", "Icing"], correct: 1 },
  { question: "Power play means the opposing team has?", choices: ["Extra player", "Fewer players due to penalty", "A timeout", "A goalie pulled"], correct: 1 },
  { question: "How many players are on an NHL active roster (typical)?", choices: ["18", "20", "23", "26"], correct: 2 },
  { question: "A delayed penalty is called when?", choices: ["Both teams commit fouls", "Non-offending team has the puck", "After overtime", "On a goal"], correct: 1 },
  { question: "A goalie may handle the puck in?", choices: ["Anywhere", "His crease only", "The crease and the trapezoid", "Nowhere"], correct: 2 },
  { question: "Two-line pass rule is currently?", choices: ["Enforced", "Not enforced", "Only on power plays", "Only in OT"], correct: 1 },
  { question: "Fighting in the NHL typically results in?", choices: ["Game misconduct", "5-minute major", "2-minute minor", "Match penalty"], correct: 1 },
  { question: "Empty-net goal often happens when?", choices: ["Goalie scores", "A team pulls the goalie for an extra attacker", "Puck deflects", "After a faceoff"], correct: 1 },
  { question: "Number of faceoff dots on an NHL rink?", choices: ["5", "7", "9", "11"], correct: 2 },
  { question: "Offside is reviewable via?", choices: ["Replay challenge", "Coach's challenge", "Captain's request", "Not reviewable"], correct: 1 },
  { question: "A hat trick is?", choices: ["3 assists", "3 goals by one player in a game", "3 saves", "3 penalties"], correct: 1 }

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
