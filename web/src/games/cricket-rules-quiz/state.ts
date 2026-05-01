import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CricketRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface CricketRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CricketRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players per team in a standard cricket match?", choices: ["9", "10", "11", "12"], correct: 2 },
  { question: "How many balls in a standard over?", choices: ["4", "5", "6", "8"], correct: 2 },
  { question: "How many runs is a boundary that bounces?", choices: ["2", "4", "6", "8"], correct: 1 },
  { question: "How many runs is a boundary hit over the rope on the full?", choices: ["2", "4", "6", "8"], correct: 2 },
  { question: "How many wickets to bowl out a team's innings?", choices: ["8", "9", "10", "11"], correct: 2 },
  { question: "How many innings per side in a Test match?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Maximum length of a Test match?", choices: ["3 days", "4 days", "5 days", "Unlimited"], correct: 2 },
  { question: "ODI stands for?", choices: ["Open Day International", "One Day International", "Overhand Drive Innings", "Overall Defensive Innings"], correct: 1 },
  { question: "How many overs per side in an ODI?", choices: ["20", "30", "40", "50"], correct: 3 },
  { question: "How many overs per side in a T20?", choices: ["10", "15", "20", "25"], correct: 2 },
  { question: "LBW stands for?", choices: ["Late ball walk", "Leg before wicket", "Long boundary win", "Last ball winner"], correct: 1 },
  { question: "Length of the cricket pitch (between wickets)?", choices: ["18 yards", "20 yards", "22 yards", "24 yards"], correct: 2 },
  { question: "How many stumps make up a wicket?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "How many bails sit atop the stumps?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "A 'duck' is when a batsman is dismissed for?", choices: ["1 run", "0 runs", "10 runs", "100 runs"], correct: 1 },
  { question: "A 'century' is when a batsman scores?", choices: ["50 runs", "75 runs", "100 runs", "200 runs"], correct: 2 },
  { question: "A no-ball results in?", choices: ["Free hit and 1 run", "Wicket only", "No result", "Two extra balls"], correct: 0 },
  { question: "A wide is signaled by the umpire how?", choices: ["Both arms straight out", "One arm raised", "Tapping shoulder", "Crossing arms"], correct: 0 },
  { question: "A 'maiden over' is?", choices: ["Six wides", "An over with no runs scored", "First over of innings", "Last over"], correct: 1 },
  { question: "Stumping is performed by whom?", choices: ["Bowler", "Wicketkeeper", "Fielder at point", "Captain"], correct: 1 },
  { question: "Hat trick in cricket is?", choices: ["3 sixes in a row", "3 wickets in 3 consecutive balls", "3 catches in an over", "100 runs in 3 overs"], correct: 1 },
  { question: "DRS stands for?", choices: ["Direct Review System", "Decision Review System", "Dismissal Replay Scoring", "Defensive Run Score"], correct: 1 },
  { question: "How many DRS reviews per innings (typically) in Tests?", choices: ["1", "2", "3", "Unlimited"], correct: 1 },
  { question: "A 'silly' fielding position is named for being?", choices: ["Far from the bat", "Very close to the bat", "Behind the keeper", "On the boundary"], correct: 1 },
  { question: "Powerplay in ODIs limits the number of?", choices: ["Sixes", "Fielders outside the 30-yard circle", "Bowlers used", "Overs"], correct: 1 },
  { question: "A bouncer above shoulder height is generally?", choices: ["Wide", "No-ball if it exceeds the per-over limit", "Always legal", "Always a wicket"], correct: 1 },
  { question: "Run out occurs when?", choices: ["Ball hits stumps with batsman out of crease", "Ball goes over rope", "Bowler bowls 6", "Wicketkeeper drops catch"], correct: 0 },
  { question: "Mankad refers to?", choices: ["Bowler running out non-striker before delivery", "Stumping", "Hitting six", "Catch behind"], correct: 0 },
  { question: "How many on-field umpires are in a Test match?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Test cricket whites are the traditional uniform color?", choices: ["Red", "Blue", "White", "Green"], correct: 2 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CricketRulesQuizSettings): CricketRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CricketRulesQuizState, action: CricketRulesQuizAction): CricketRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CricketRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
