import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SouthParkSettings { questions: "10" | "20" | "30"; }
export interface SouthParkState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SouthParkAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What state is South Park set in?", choices: ["Colorado","Wyoming","Montana","Idaho"], correct: 0 },
  { question: "Who created South Park?", choices: ["Trey Parker and Matt Stone","Seth MacFarlane","Matt Groening","Mike Judge"], correct: 0 },
  { question: "Who is the loud-mouthed, anti-Semitic kid?", choices: ["Eric Cartman","Stan","Kyle","Kenny"], correct: 0 },
  { question: "Who is Cartman's frequent target?", choices: ["Kyle","Stan","Butters","Token"], correct: 0 },
  { question: "Who dies in nearly every early episode?", choices: ["Kenny","Butters","Kyle","Cartman"], correct: 0 },
  { question: "Who is the parka-wearing kid with muffled speech?", choices: ["Kenny","Cartman","Tweek","Craig"], correct: 0 },
  { question: "Who is Stan's best friend?", choices: ["Kyle","Cartman","Kenny","Butters"], correct: 0 },
  { question: "Who is the school's chef in early seasons?", choices: ["Chef","Mr. Mackey","Mr. Garrison","Big Gay Al"], correct: 0 },
  { question: "Who voices Chef?", choices: ["Isaac Hayes","Trey Parker","Matt Stone","Tim Curry"], correct: 0 },
  { question: "What is Mr. Garrison's catchphrase ending?", choices: ["m'kay (no, Mackey)","Howdy ho!","Respect my authoritah","Oh my god, they killed Kenny"], correct: 0 },
  { question: "Whose catchphrase is 'Respect my authoritah'?", choices: ["Cartman","Stan","Kyle","Butters"], correct: 0 },
  { question: "Whose catchphrase is 'Howdy ho!'?", choices: ["Mr. Hankey","Towelie","Big Gay Al","Mr. Mackey"], correct: 0 },
  { question: "What is Mr. Mackey's signature word?", choices: ["M'kay","Howdy","Respect","Sweet"], correct: 0 },
  { question: "Who is the talking towel?", choices: ["Towelie","Mr. Hankey","Cthulhu","Manbearpig"], correct: 0 },
  { question: "What year did South Park premiere?", choices: ["1997","1995","1999","2001"], correct: 0 },
  { question: "What network airs South Park?", choices: ["Comedy Central","Fox","Cartoon Network","HBO"], correct: 0 },
  { question: "Who is Butters' last name?", choices: ["Stotch","Marsh","Broflovski","McCormick"], correct: 0 },
  { question: "What is Stan's last name?", choices: ["Marsh","Broflovski","McCormick","Stotch"], correct: 0 },
  { question: "What is Kyle's last name?", choices: ["Broflovski","Marsh","McCormick","Stotch"], correct: 0 },
  { question: "What is Kenny's last name?", choices: ["McCormick","Marsh","Broflovski","Stotch"], correct: 0 },
  { question: "What is the name of Stan's sister?", choices: ["Shelly","Wendy","Bebe","Heidi"], correct: 0 },
  { question: "Who is Stan's frequent girlfriend?", choices: ["Wendy Testaburger","Bebe","Heidi","Lola"], correct: 0 },
  { question: "What is the South Park elementary school called?", choices: ["South Park Elementary","South Park Academy","Park Elementary","Cartman Junior High"], correct: 0 },
  { question: "Who is the bus driver?", choices: ["Mrs. Crabtree","Mr. Garrison","Chef","Officer Barbrady"], correct: 0 },
  { question: "What is the name of the goth kid leader?", choices: ["Henrietta","Pete","Michael","Firkle"], correct: 0 },
  { question: "Who is Cartman's mom?", choices: ["Liane Cartman","Sharon","Sheila","Carol"], correct: 0 },
  { question: "What does PC Principal stand for?", choices: ["Politically Correct","Personal Computer","Public Citizen","Perfectly Cool"], correct: 0 },
  { question: "Who is the boss of Hell?", choices: ["Satan","Saddam Hussein","The Devil's son","Mr. Garrison"], correct: 0 },
  { question: "Who is Satan's on-and-off boyfriend?", choices: ["Saddam Hussein","Damien","Chris","Phillip"], correct: 0 },
  { question: "What is the name of the South Park movie (1999)?", choices: ["Bigger, Longer & Uncut","Beyond Reason","Goes to Hell","South Park: The Movie"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SouthParkSettings): SouthParkState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SouthParkState, action: SouthParkAction): SouthParkState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SouthParkState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
