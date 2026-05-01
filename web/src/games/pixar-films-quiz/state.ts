import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PixarFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface PixarFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PixarFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was Pixar's first feature film?", choices: ["Toy Story","A Bug's Life","Finding Nemo","Cars"], correct: 0 },
  { question: "In what year did Toy Story premiere?", choices: ["1995","1998","1992","1996"], correct: 0 },
  { question: "Who voices Woody?", choices: ["Tom Hanks","Tim Allen","Billy Crystal","John Goodman"], correct: 0 },
  { question: "Who voices Buzz Lightyear?", choices: ["Tim Allen","Tom Hanks","John Travolta","Chris Evans (Lightyear film)"], correct: 0 },
  { question: "What 2003 Pixar film features a clownfish?", choices: ["Finding Nemo","Finding Dory","Cars","Up"], correct: 0 },
  { question: "Who voices Marlin in Finding Nemo?", choices: ["Albert Brooks","Ellen DeGeneres (Dory)","Both","Just Brooks"], correct: 0 },
  { question: "What 2007 Pixar film features a rat who cooks?", choices: ["Ratatouille","Wall-E","Up","Brave"], correct: 0 },
  { question: "What 2008 Pixar film stars a robot?", choices: ["Wall-E","Toy Story","Cars","Inside Out"], correct: 0 },
  { question: "What 2009 Pixar film starts with a flying house?", choices: ["Up","Wall-E","Inside Out","Brave"], correct: 0 },
  { question: "What 2010 sequel released?", choices: ["Toy Story 3","Cars 2","Monsters U","Brave"], correct: 0 },
  { question: "What's the name of the boy in Monsters Inc?", choices: ["Boo","Riley","Andy","Carl"], correct: 0 },
  { question: "What 2001 Pixar film features Sully?", choices: ["Monsters, Inc.","Cars","Wall-E","A Bug's Life"], correct: 0 },
  { question: "Who voices Sully?", choices: ["John Goodman","Billy Crystal (Mike)","Both","Just Goodman"], correct: 0 },
  { question: "What 2015 Pixar film is about emotions?", choices: ["Inside Out","Coco","Onward","Soul"], correct: 0 },
  { question: "What emotions are characters in Inside Out?", choices: ["Joy, Sadness, Anger, Fear, Disgust","Different emotions","Just Joy and Sadness","Many more"], correct: 0 },
  { question: "What 2017 Pixar film features Day of the Dead?", choices: ["Coco","Soul","Onward","Brave"], correct: 0 },
  { question: "What 2020 Pixar film features jazz musician?", choices: ["Soul","Onward","Coco","Up"], correct: 0 },
  { question: "Who composed Up's score?", choices: ["Michael Giacchino","Randy Newman","Thomas Newman","Patrick Doyle"], correct: 0 },
  { question: "Who composed Toy Story?", choices: ["Randy Newman","Michael Giacchino","Thomas Newman","John Williams"], correct: 0 },
  { question: "What's Carl's wife's name in Up?", choices: ["Ellie","Kevin","Russell","Dug"], correct: 0 },
  { question: "What's the name of the dog in Up?", choices: ["Dug","Kevin","Russell","Charles"], correct: 0 },
  { question: "What 2004 Pixar superhero film?", choices: ["The Incredibles","Ratatouille","Cars","Finding Nemo"], correct: 0 },
  { question: "What family is The Incredibles?", choices: ["Parr family","Smith","Jones","Stone"], correct: 0 },
  { question: "What's Mr. Incredible's name?", choices: ["Bob Parr","Mr. Parr","Just Bob","Robert"], correct: 0 },
  { question: "Who voices Mr. Incredible?", choices: ["Craig T. Nelson","Holly Hunter","Samuel L. Jackson","Brad Bird"], correct: 0 },
  { question: "Who founded Pixar Animation Studios?", choices: ["Ed Catmull, Steve Jobs, John Lasseter (later)","Disney","George Lucas (early Pixar tech)","Both Lucas Films origins and Catmull/Jobs"], correct: 3 },
  { question: "What 2006 Pixar film features cars in Radiator Springs?", choices: ["Cars","Cars 2","Cars 3","Planes"], correct: 0 },
  { question: "Who voices Lightning McQueen?", choices: ["Owen Wilson","Larry the Cable Guy (Mater)","Both","Just Wilson"], correct: 0 },
  { question: "What 2012 Pixar film features Princess Merida?", choices: ["Brave","Coco","Inside Out","Tangled (Disney, not Pixar)"], correct: 0 },
  { question: "What's the Pixar mascot?", choices: ["Luxo Jr (lamp)","Toy Story Sheriff","Buzz","Sully"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PixarFilmsQuizSettings): PixarFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PixarFilmsQuizState, action: PixarFilmsQuizAction): PixarFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PixarFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
