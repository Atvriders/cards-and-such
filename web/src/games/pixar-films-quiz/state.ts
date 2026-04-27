import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PixarFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface PixarFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PixarFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pixar's first feature film?", choices: ["Toy Story", "A Bug's Life", "Monsters Inc.", "Finding Nemo"], correct: 0 },
  { question: "Who voices Woody in 'Toy Story'?", choices: ["Tim Allen", "Tom Hanks", "John Goodman", "Owen Wilson"], correct: 1 },
  { question: "Who voices Buzz Lightyear?", choices: ["Tom Hanks", "Tim Allen", "Billy Crystal", "John Ratzenberger"], correct: 1 },
  { question: "Year 'Finding Nemo' was released?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Who voices Sulley in 'Monsters Inc.'?", choices: ["Tom Hanks", "John Goodman", "Tim Allen", "Robin Williams"], correct: 1 },
  { question: "Mike Wazowski's voice actor?", choices: ["Billy Crystal", "Robin Williams", "Eddie Murphy", "John Leguizamo"], correct: 0 },
  { question: "Pixar's first sequel was?", choices: ["Toy Story 2", "Cars 2", "Monsters University", "Finding Dory"], correct: 0 },
  { question: "What was Pixar's 2008 sci-fi film?", choices: ["Up", "WALL-E", "Brave", "Inside Out"], correct: 1 },
  { question: "Carl Fredricksen's house is lifted by?", choices: ["A tornado", "Balloons", "Magic", "A spaceship"], correct: 1 },
  { question: "Who voices Dory in 'Finding Dory'?", choices: ["Ellen DeGeneres", "Wanda Sykes", "Tina Fey", "Amy Poehler"], correct: 0 },
  { question: "'Ratatouille' is set in what city?", choices: ["Paris", "Rome", "London", "Milan"], correct: 0 },
  { question: "What animal is Remy in 'Ratatouille'?", choices: ["Mouse", "Rat", "Squirrel", "Hamster"], correct: 1 },
  { question: "Lightning McQueen is a what?", choices: ["Plane", "Race car", "Truck", "Boat"], correct: 1 },
  { question: "Best Animated Feature won by 'Inside Out'?", choices: ["2014", "2015", "2016", "2017"], correct: 1 },
  { question: "Riley's emotion in red?", choices: ["Anger", "Fear", "Disgust", "Sadness"], correct: 0 },
  { question: "Year 'The Incredibles' was released?", choices: ["2002", "2004", "2006", "2008"], correct: 1 },
  { question: "Mr. Incredible's superhero name?", choices: ["Frozone", "Dash", "Mr. Incredible", "Syndrome"], correct: 2 },
  { question: "Pixar's 2017 film about Día de Muertos?", choices: ["Coco", "Onward", "Soul", "Luca"], correct: 0 },
  { question: "'Soul' jazz pianist's name?", choices: ["Joe Gardner", "Miguel Rivera", "Tony Stark", "Bob Parr"], correct: 0 },
  { question: "Brave's protagonist?", choices: ["Anna", "Merida", "Moana", "Elsa"], correct: 1 },
  { question: "Pixar's parent company?", choices: ["Warner Bros", "Disney", "Universal", "Sony"], correct: 1 },
  { question: "Who founded Pixar with Steve Jobs?", choices: ["John Lasseter", "Ed Catmull", "Both", "Neither"], correct: 2 },
  { question: "'A Bug's Life' protagonist?", choices: ["Flik", "Heimlich", "Atta", "Hopper"], correct: 0 },
  { question: "Toy Story 4's new character was?", choices: ["Bo Peep", "Forky", "Duke Caboom", "All of these"], correct: 1 },
  { question: "Director of 'Toy Story'?", choices: ["John Lasseter", "Andrew Stanton", "Pete Docter", "Brad Bird"], correct: 0 },
  { question: "'WALL-E' refers to a what?", choices: ["Robot", "Spaceship", "Cockroach", "Plant"], correct: 0 },
  { question: "EVE's mission in 'WALL-E'?", choices: ["Find life", "Build robots", "Save humans", "Eat trash"], correct: 0 },
  { question: "What animal kicks off 'Up'?", choices: ["Dog Dug", "Bird Kevin", "Cat", "Squirrel"], correct: 1 },
  { question: "Pixar short before 'Toy Story'?", choices: ["Luxo Jr.", "Tin Toy", "Both early shorts", "Knick Knack"], correct: 2 },
  { question: "Pixar's 2020 elf-brother movie?", choices: ["Onward", "Soul", "Luca", "Turning Red"], correct: 0 },
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
