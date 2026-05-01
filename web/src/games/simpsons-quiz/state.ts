import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SimpsonsSettings { questions: "10" | "20" | "30"; }
export interface SimpsonsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SimpsonsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What town do The Simpsons live in?", choices: ["Springfield","Shelbyville","Capital City","Ogdenville"], correct: 0 },
  { question: "What is Homer's catchphrase?", choices: ["D'oh!","Cowabunga!","Ay caramba!","Excellent"], correct: 0 },
  { question: "What is Bart's catchphrase?", choices: ["Ay caramba!","D'oh!","Woo-hoo!","Okily dokily"], correct: 0 },
  { question: "What is Homer's job?", choices: ["Safety inspector at nuclear plant","Plumber","Teacher","Mechanic"], correct: 0 },
  { question: "Who owns the nuclear power plant?", choices: ["Mr. Burns","Moe","Ned Flanders","Krusty"], correct: 0 },
  { question: "Who is Mr. Burns's assistant?", choices: ["Smithers","Lenny","Carl","Moe"], correct: 0 },
  { question: "Who is the bartender at Moe's Tavern?", choices: ["Moe Szyslak","Barney","Lenny","Carl"], correct: 0 },
  { question: "Who is the Simpsons' next-door neighbor?", choices: ["Ned Flanders","Apu","Krusty","Skinner"], correct: 0 },
  { question: "Who runs the Kwik-E-Mart?", choices: ["Apu","Moe","Comic Book Guy","Cletus"], correct: 0 },
  { question: "What is Lisa's instrument?", choices: ["Saxophone","Trumpet","Piano","Clarinet"], correct: 0 },
  { question: "What is Maggie always doing?", choices: ["Sucking a pacifier","Talking","Reading","Singing"], correct: 0 },
  { question: "Who is Bart's best friend?", choices: ["Milhouse","Nelson","Martin","Ralph"], correct: 0 },
  { question: "Who is the school principal?", choices: ["Seymour Skinner","Edna Krabappel","Chalmers","Willie"], correct: 0 },
  { question: "What is Krusty's full stage name?", choices: ["Krusty the Clown","Krusty the Klown","Krusty Koolaid","Herschel Krusty"], correct: 0 },
  { question: "What is Groundskeeper Willie's nationality?", choices: ["Scottish","Irish","English","Welsh"], correct: 0 },
  { question: "What is Ned Flanders's catchphrase ending?", choices: ["-diddly-","-eroni","-wocka","-ish"], correct: 0 },
  { question: "What is the name of the Simpsons' cat?", choices: ["Snowball","Santa's Little Helper","Whiskers","Mittens"], correct: 0 },
  { question: "What is the name of the Simpsons' dog?", choices: ["Santa's Little Helper","Snowball","Rex","Buddy"], correct: 0 },
  { question: "Who voices Homer Simpson?", choices: ["Dan Castellaneta","Hank Azaria","Harry Shearer","Nancy Cartwright"], correct: 0 },
  { question: "Who voices Bart Simpson?", choices: ["Nancy Cartwright","Yeardley Smith","Julie Kavner","Pamela Hayden"], correct: 0 },
  { question: "Who voices Lisa Simpson?", choices: ["Yeardley Smith","Nancy Cartwright","Julie Kavner","Tress MacNeille"], correct: 0 },
  { question: "Who voices Marge Simpson?", choices: ["Julie Kavner","Yeardley Smith","Nancy Cartwright","Pamela Hayden"], correct: 0 },
  { question: "What year did The Simpsons premiere as a half-hour show?", choices: ["1989","1987","1991","1985"], correct: 0 },
  { question: "Who created The Simpsons?", choices: ["Matt Groening","Seth MacFarlane","Mike Judge","Trey Parker"], correct: 0 },
  { question: "What is the name of the local TV news anchor?", choices: ["Kent Brockman","Tom Tucker","Bill O'Reilly","Ted Baxter"], correct: 0 },
  { question: "What is Bart's chalkboard signature?", choices: ["He writes lines","He doodles","He erases","He paints"], correct: 0 },
  { question: "What is Comic Book Guy's catchphrase?", choices: ["Worst. Episode. Ever.","Excelsior!","Holy smokes","Ay caramba"], correct: 0 },
  { question: "Who is Lisa's saxophone idol?", choices: ["Bleeding Gums Murphy","Lionel Hutz","Krusty","Apu"], correct: 0 },
  { question: "What is Itchy & Scratchy?", choices: ["Cartoon within the show","A band","A book","A ride"], correct: 0 },
  { question: "What is the Springfield rival town?", choices: ["Shelbyville","Capital City","Ogdenville","North Haverbrook"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SimpsonsSettings): SimpsonsState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SimpsonsState, action: SimpsonsAction): SimpsonsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SimpsonsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
