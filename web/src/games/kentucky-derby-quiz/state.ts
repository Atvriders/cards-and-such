import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KentuckyDerbyQuizSettings { questions: "10" | "20" | "30"; }
export interface KentuckyDerbyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KentuckyDerbyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In which state is the Kentucky Derby held?",
    "choices": [
      "Kentucky",
      "Tennessee",
      "Virginia",
      "Indiana"
    ],
    "correct": 0
  },
  {
    "question": "At which track is the Derby held?",
    "choices": [
      "Churchill Downs",
      "Belmont Park",
      "Pimlico",
      "Saratoga"
    ],
    "correct": 0
  },
  {
    "question": "How long is the Kentucky Derby race?",
    "choices": [
      "1 mile",
      "1.25 miles",
      "1.5 miles",
      "2 miles"
    ],
    "correct": 1
  },
  {
    "question": "Which horse won the 1973 Triple Crown including the Derby?",
    "choices": [
      "Secretariat",
      "Affirmed",
      "Seattle Slew",
      "Citation"
    ],
    "correct": 0
  },
  {
    "question": "In which month is the Derby traditionally run?",
    "choices": [
      "April",
      "May",
      "June",
      "July"
    ],
    "correct": 1
  },
  {
    "question": "Which flower is associated with the Derby?",
    "choices": [
      "Rose",
      "Tulip",
      "Lily",
      "Daisy"
    ],
    "correct": 0
  },
  {
    "question": "Which horse won the 2024 Kentucky Derby?",
    "choices": [
      "Mystik Dan",
      "Sierra Leone",
      "Forever Young",
      "Fierceness"
    ],
    "correct": 0
  },
  {
    "question": "Which jockeys have the most Derby wins (5 each)?",
    "choices": [
      "Arcaro and Hartack",
      "Borel and Smith",
      "Shoemaker and Stevens",
      "Velazquez and Prat"
    ],
    "correct": 0
  },
  {
    "question": "To whom is the 'garland of roses' presented?",
    "choices": [
      "Winning horse",
      "Winning jockey",
      "Owner",
      "Trainer"
    ],
    "correct": 0
  },
  {
    "question": "In which year did Secretariat win the Derby?",
    "choices": [
      "1971",
      "1972",
      "1973",
      "1974"
    ],
    "correct": 2
  },
  {
    "question": "Which trainer is nicknamed 'The Coach'?",
    "choices": [
      "Bob Baffert",
      "Wayne Lukas",
      "Todd Pletcher",
      "Steve Asmussen"
    ],
    "correct": 1
  },
  {
    "question": "Which 2019 Derby horse was disqualified after crossing the line first?",
    "choices": [
      "Maximum Security",
      "Country House",
      "Code of Honor",
      "Tacitus"
    ],
    "correct": 0
  },
  {
    "question": "How old must horses be to run the Derby?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "Which song is sung before the Derby?",
    "choices": [
      "My Old Kentucky Home",
      "Dixie",
      "Rocky Top",
      "America the Beautiful"
    ],
    "correct": 0
  },
  {
    "question": "What is the official Derby cocktail?",
    "choices": [
      "Mint Julep",
      "Old Fashioned",
      "Whiskey Sour",
      "Bourbon Smash"
    ],
    "correct": 0
  },
  {
    "question": "Which horse won the 2018 Triple Crown including the Derby?",
    "choices": [
      "Justify",
      "American Pharoah",
      "California Chrome",
      "Always Dreaming"
    ],
    "correct": 0
  },
  {
    "question": "Which horse won the 2015 Triple Crown including the Derby?",
    "choices": [
      "American Pharoah",
      "Justify",
      "Pioneerof the Nile",
      "Authentic"
    ],
    "correct": 0
  },
  {
    "question": "In what year was the first Kentucky Derby?",
    "choices": [
      "1875",
      "1880",
      "1900",
      "1925"
    ],
    "correct": 0
  },
  {
    "question": "What is the maximum number of horses in a Derby field?",
    "choices": [
      "18",
      "20",
      "22",
      "24"
    ],
    "correct": 1
  },
  {
    "question": "Which fashion accessory is iconic at the Derby?",
    "choices": [
      "Hats",
      "Gloves",
      "Capes",
      "Tiaras"
    ],
    "correct": 0
  },
  {
    "question": "Which horse won the 2020 Derby (delayed to September)?",
    "choices": [
      "Authentic",
      "Tiz the Law",
      "Honor A. P.",
      "Max Player"
    ],
    "correct": 0
  },
  {
    "question": "Who has the most Derby wins as a trainer?",
    "choices": [
      "Bob Baffert",
      "Todd Pletcher",
      "Wayne Lukas",
      "Ben A. Jones"
    ],
    "correct": 0
  },
  {
    "question": "Which jockey won the 2024 Derby?",
    "choices": [
      "Brian Hernandez Jr.",
      "John Velazquez",
      "Mike Smith",
      "Flavien Prat"
    ],
    "correct": 0
  },
  {
    "question": "How many legs are in the Triple Crown?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 1
  },
  {
    "question": "What is the second leg of the Triple Crown?",
    "choices": [
      "Preakness Stakes",
      "Belmont Stakes",
      "Travers",
      "Breeders' Cup"
    ],
    "correct": 0
  },
  {
    "question": "What is the third leg of the Triple Crown?",
    "choices": [
      "Belmont Stakes",
      "Preakness Stakes",
      "Travers",
      "Florida Derby"
    ],
    "correct": 0
  },
  {
    "question": "Which famous filly won the Derby in 1988?",
    "choices": [
      "Winning Colors",
      "Genuine Risk",
      "Ruffian",
      "Rachel Alexandra"
    ],
    "correct": 0
  },
  {
    "question": "Which Derby winner died of laminitis after the 2006 Preakness?",
    "choices": [
      "Barbaro",
      "Smarty Jones",
      "Funny Cide",
      "Big Brown"
    ],
    "correct": 0
  },
  {
    "question": "By how many lengths did Secretariat win the 1973 Derby?",
    "choices": [
      "2.5",
      "5",
      "7",
      "10"
    ],
    "correct": 0
  },
  {
    "question": "What is the Derby's nickname?",
    "choices": [
      "Run for the Roses",
      "The Big One",
      "Bluegrass Run",
      "Spring Sprint"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KentuckyDerbyQuizSettings): KentuckyDerbyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KentuckyDerbyQuizState, action: KentuckyDerbyQuizAction): KentuckyDerbyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KentuckyDerbyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
