import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarvelMcuQuizSettings { questions: "10" | "20" | "30"; }
export interface MarvelMcuQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarvelMcuQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who plays Iron Man in the MCU?", choices: ["Chris Evans", "Robert Downey Jr.", "Mark Ruffalo", "Chris Hemsworth"], correct: 1 },
  { question: "What is Captain America's shield made of?", choices: ["Adamantium", "Vibranium", "Uru", "Carbonadium"], correct: 1 },
  { question: "Which film introduced the MCU in 2008?", choices: ["The Incredible Hulk", "Iron Man", "Thor", "Captain America"], correct: 1 },
  { question: "Who plays Thor?", choices: ["Chris Pratt", "Chris Pine", "Chris Hemsworth", "Chris Evans"], correct: 2 },
  { question: "What is Black Widow's real name?", choices: ["Wanda Maximoff", "Natasha Romanoff", "Carol Danvers", "Jennifer Walters"], correct: 1 },
  { question: "Who is the ruler of Wakanda in 'Black Panther'?", choices: ["M'Baku", "T'Challa", "Killmonger", "T'Chaka"], correct: 1 },
  { question: "What infinity stone is in Vision's forehead?", choices: ["Mind", "Soul", "Reality", "Power"], correct: 0 },
  { question: "Who plays Doctor Strange?", choices: ["Mark Ruffalo", "Benedict Cumberbatch", "Tom Hiddleston", "Paul Rudd"], correct: 1 },
  { question: "What is the name of Star-Lord's spaceship?", choices: ["Milano", "Benatar", "Quadrant", "Statesman"], correct: 0 },
  { question: "Who directs the Guardians of the Galaxy films?", choices: ["Joss Whedon", "James Gunn", "Jon Favreau", "Taika Waititi"], correct: 1 },
  { question: "Who is Spider-Man's mentor in the MCU?", choices: ["Captain America", "Tony Stark", "Doctor Strange", "Nick Fury"], correct: 1 },
  { question: "What is Hulk's alter ego's name?", choices: ["Bruce Banner", "Reed Richards", "Hank Pym", "Steve Rogers"], correct: 0 },
  { question: "Who killed half of all life with a snap?", choices: ["Ultron", "Loki", "Thanos", "Kang"], correct: 2 },
  { question: "Who plays Loki?", choices: ["Tom Hiddleston", "Tom Holland", "Idris Elba", "Tom Hardy"], correct: 0 },
  { question: "What planet was Thor's hammer Mjolnir forged on?", choices: ["Asgard", "Vanaheim", "Nidavellir", "Svartalfheim"], correct: 2 },
  { question: "Who is the leader of the Avengers?", choices: ["Thor", "Iron Man", "Captain America", "Black Widow"], correct: 2 },
  { question: "What was the first MCU TV series on Disney+?", choices: ["Loki", "WandaVision", "Hawkeye", "Falcon and the Winter Soldier"], correct: 1 },
  { question: "Who plays Black Panther / T'Challa?", choices: ["Michael B. Jordan", "Chadwick Boseman", "Daniel Kaluuya", "John Boyega"], correct: 1 },
  { question: "Captain Marvel's alter ego is?", choices: ["Carol Danvers", "Jennifer Walters", "Jessica Drew", "Monica Rambeau"], correct: 0 },
  { question: "What is Hawkeye's primary weapon?", choices: ["Sword", "Bow and Arrow", "Twin Pistols", "Whip"], correct: 1 },
  { question: "Who plays Ant-Man?", choices: ["Paul Rudd", "Jeremy Renner", "Mark Ruffalo", "Paul Bettany"], correct: 0 },
  { question: "What's the name of Tony Stark's AI?", choices: ["FRIDAY", "JARVIS", "EDITH", "KAREN"], correct: 1 },
  { question: "What is Bucky Barnes's superhero name?", choices: ["Falcon", "Winter Soldier", "Captain America", "War Machine"], correct: 1 },
  { question: "Which Eternal is portrayed by Angelina Jolie?", choices: ["Sersi", "Thena", "Ajak", "Makkari"], correct: 1 },
  { question: "What did Tony Stark sacrifice in 'Endgame'?", choices: ["His shield", "His life", "Pepper", "Stark Industries"], correct: 1 },
  { question: "Who plays Scarlet Witch?", choices: ["Elizabeth Olsen", "Brie Larson", "Tessa Thompson", "Karen Gillan"], correct: 0 },
  { question: "Spider-Man: No Way Home featured how many Spider-Men?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "What is Wakanda's most precious resource?", choices: ["Adamantium", "Vibranium", "Gold", "Uru"], correct: 1 },
  { question: "Who is Groot's best friend?", choices: ["Rocket", "Drax", "Gamora", "Quill"], correct: 0 },
  { question: "Which villain seeks all six Infinity Stones?", choices: ["Loki", "Ultron", "Thanos", "Hela"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MarvelMcuQuizSettings): MarvelMcuQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarvelMcuQuizState, action: MarvelMcuQuizAction): MarvelMcuQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarvelMcuQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
