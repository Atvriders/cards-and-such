import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SimpsonsSettings { questions: "10" | "20" | "30"; }
export interface SimpsonsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SimpsonsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What town do The Simpsons live in?", choices: ["Springfield","Shelbyville","Capital City","Ogdenville"], correct: 0 },
  { question: "What's Homer's job?", choices: ["Nuclear power plant safety inspector","Engineer","Manager","Scientist"], correct: 0 },
  { question: "What plant does Homer work at?", choices: ["Springfield Nuclear Power Plant","Shelbyville Power","Just plant","Mr Burns plant"], correct: 0 },
  { question: "Who owns the power plant?", choices: ["Mr. Burns","Smithers","Both","Just Burns"], correct: 0 },
  { question: "What's Homer's catchphrase?", choices: ["D'oh!","Why you little","Mmmm donuts","All by him"], correct: 3 },
  { question: "What's Bart's catchphrase?", choices: ["Eat my shorts","Don't have a cow","Cowabunga","All said by Bart"], correct: 3 },
  { question: "What's Bart's age?", choices: ["10","8","12","9"], correct: 0 },
  { question: "What's Lisa's age?", choices: ["8","10","7","9"], correct: 0 },
  { question: "What instrument does Lisa play?", choices: ["Saxophone","Piano","Trumpet","Drums"], correct: 0 },
  { question: "Who's Bart's best friend?", choices: ["Milhouse","Nelson","Martin","Ralph"], correct: 0 },
  { question: "Who's the bully?", choices: ["Nelson","Jimbo","Both","All of them"], correct: 0 },
  { question: "What's Nelson's catchphrase?", choices: ["Ha ha","Eat my shorts","Cowabunga","Hey hey"], correct: 0 },
  { question: "What's Marge's blue hair height?", choices: ["Tall","Short","Medium","Big and tall"], correct: 3 },
  { question: "What's Maggie's signature feature?", choices: ["Pacifier","Bald head","Both","Spike in head"], correct: 2 },
  { question: "What's the bartender at Moe's?", choices: ["Moe Szyslak","Lenny","Carl","Barney"], correct: 0 },
  { question: "What's Apu's store?", choices: ["Kwik-E-Mart","Stop and Shop","Buy More","Apu's Store"], correct: 0 },
  { question: "Who's Apu's wife?", choices: ["Manjula","Sunita","Just Manjula","Sushila"], correct: 0 },
  { question: "How many octuplets does Apu have?", choices: ["Eight","Seven","Six","Twelve"], correct: 0 },
  { question: "What's Bart's chalkboard gag pattern?", choices: ["Writing punishment lines","Drawing","Both","Just writing"], correct: 0 },
  { question: "What's the couch gag?", choices: ["Family arrives at couch","Everyone sits down","Both","Just couch"], correct: 2 },
  { question: "What's Krusty's full name?", choices: ["Krusty the Clown / Herschel Krustofski","Just Krusty","Both","Herschel"], correct: 0 },
  { question: "What's Sideshow Bob's signature feature?", choices: ["Clown hair","Tall","Voice","All"], correct: 0 },
  { question: "Who voices Sideshow Bob?", choices: ["Kelsey Grammer","Hank Azaria","Harry Shearer","Dan Castellaneta"], correct: 0 },
  { question: "Who voices Homer?", choices: ["Dan Castellaneta","Hank Azaria","Harry Shearer","Yeardley Smith"], correct: 0 },
  { question: "Who voices Marge?", choices: ["Julie Kavner","Yeardley Smith","Nancy Cartwright","Tress MacNeille"], correct: 0 },
  { question: "Who voices Bart?", choices: ["Nancy Cartwright","Yeardley Smith","Julie Kavner","Pamela Hayden"], correct: 0 },
  { question: "Who voices Lisa?", choices: ["Yeardley Smith","Nancy Cartwright","Julie Kavner","Pamela Hayden"], correct: 0 },
  { question: "What's Burns' assistant called?", choices: ["Smithers","Carl","Lenny","Just Smithers"], correct: 0 },
  { question: "What's Mr. Burns' catchphrase?", choices: ["Excellent","Release the hounds","Both","Smithers!"], correct: 2 },
  { question: "What year did The Simpsons start?", choices: ["1989","1987","1990","1985"], correct: 0 },
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
