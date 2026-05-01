import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MlbLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface MlbLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MlbLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who's the all-time MLB home run leader?", choices: ["Barry Bonds (762)","Hank Aaron","Babe Ruth","Albert Pujols"], correct: 0 },
  { question: "Who held the record before Barry Bonds?", choices: ["Hank Aaron (755)","Babe Ruth","Just Aaron","Both"], correct: 0 },
  { question: "Who held the record before Hank Aaron?", choices: ["Babe Ruth (714)","Just Ruth","Both","Maris"], correct: 0 },
  { question: "Who's the MLB single-season HR record holder?", choices: ["Barry Bonds (73)","Mark McGwire (70)","Aaron Judge (62 AL)","Bonds"], correct: 0 },
  { question: "Who's known as the Sultan of Swat?", choices: ["Babe Ruth","Just Ruth","Both","DiMaggio"], correct: 2 },
  { question: "What team is most associated with Babe Ruth?", choices: ["Yankees","Red Sox","Both teams","Just Yankees"], correct: 2 },
  { question: "How many World Series titles do the Yankees have?", choices: ["27","30","25","23"], correct: 0 },
  { question: "Who's known as Mr. October?", choices: ["Reggie Jackson","Just Reggie","Both","Berra"], correct: 2 },
  { question: "Who broke the color barrier in baseball?", choices: ["Jackie Robinson","Larry Doby (AL)","Both","Just Jackie in NL"], correct: 2 },
  { question: "In what year did Jackie Robinson debut?", choices: ["1947","1942","1950","1937"], correct: 0 },
  { question: "Who's the all-time hits leader?", choices: ["Pete Rose (4,256)","Ty Cobb","Just Rose","Both"], correct: 0 },
  { question: "Who has the most career strikeouts as pitcher?", choices: ["Nolan Ryan","Randy Johnson","Just Ryan","Both"], correct: 2 },
  { question: "How many no-hitters did Nolan Ryan throw?", choices: ["7","6","5","8"], correct: 0 },
  { question: "Who's known as the Iron Horse?", choices: ["Lou Gehrig","Cal Ripken Jr","Just Gehrig","Both"], correct: 0 },
  { question: "Who's known as Iron Man (consecutive games)?", choices: ["Cal Ripken Jr","Lou Gehrig","Both","Different terms"], correct: 2 },
  { question: "How many consecutive games did Cal Ripken play?", choices: ["2,632","2,500","2,800","2,200"], correct: 0 },
  { question: "Whose record did Cal Ripken break?", choices: ["Lou Gehrig's","Babe Ruth's","Joe DiMaggio's","Just Gehrig"], correct: 2 },
  { question: "What's Joe DiMaggio's famous streak?", choices: ["56-game hitting streak","Just streak","Both","Records"], correct: 2 },
  { question: "Who's known as the Splendid Splinter?", choices: ["Ted Williams","Joe DiMaggio","Just Williams","Both"], correct: 0 },
  { question: "Who's the last MLB hitter to hit .400?", choices: ["Ted Williams (1941)","Just Williams","Both","DiMaggio"], correct: 2 },
  { question: "Who's known as Mr. Cub?", choices: ["Ernie Banks","Sammy Sosa","Just Banks","Both"], correct: 0 },
  { question: "Who's known as the Say Hey Kid?", choices: ["Willie Mays","Just Mays","Both","Hank Aaron"], correct: 2 },
  { question: "Who made the famous over-the-shoulder catch in 1954 World Series?", choices: ["Willie Mays","Just Mays","Both","DiMaggio"], correct: 2 },
  { question: "Who's the all-time RBI leader?", choices: ["Hank Aaron","Albert Pujols","Babe Ruth","Just Aaron"], correct: 0 },
  { question: "Who's the all-time pitcher wins leader?", choices: ["Cy Young (511)","Just Cy Young","Both","Walter Johnson"], correct: 0 },
  { question: "What award is named for Cy Young?", choices: ["Pitcher of the year award","Just Cy Young","Both","Pitching honor"], correct: 2 },
  { question: "Who's known as the Big Unit?", choices: ["Randy Johnson","Just Randy Johnson","Both","Roger Clemens"], correct: 0 },
  { question: "Who's the Greek God of Walks?", choices: ["Kevin Youkilis","Joey Votto","Just Youk (per Moneyball)","Both"], correct: 2 },
  { question: "Who's the MLB stolen base leader?", choices: ["Rickey Henderson","Just Rickey","Both","Lou Brock"], correct: 0 },
  { question: "Who's the modern triple-crown winner (2012)?", choices: ["Miguel Cabrera","Mike Trout","Just Cabrera","Both"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MlbLegendsQuizSettings): MlbLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MlbLegendsQuizState, action: MlbLegendsQuizAction): MlbLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MlbLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
