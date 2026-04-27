import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HalloweenQuizSettings { questions: "10" | "20" | "30"; }
export interface HalloweenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HalloweenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Halloween originates from which Celtic festival?",
    "choices": [
      "Beltane",
      "Samhain",
      "Imbolc",
      "Lughnasadh"
    ],
    "correct": 1
  },
  {
    "question": "Jack-o'-lanterns were originally carved from?",
    "choices": [
      "Pumpkins",
      "Apples",
      "Turnips",
      "Squash"
    ],
    "correct": 2
  },
  {
    "question": "What does 'Halloween' mean literally?",
    "choices": [
      "Holy night",
      "All Hallows' Eve",
      "Witches' eve",
      "Dark night"
    ],
    "correct": 1
  },
  {
    "question": "Which country has Dia de los Muertos near Halloween?",
    "choices": [
      "Mexico",
      "Spain",
      "Argentina",
      "Peru"
    ],
    "correct": 0
  },
  {
    "question": "Bram Stoker wrote which Halloween classic?",
    "choices": [
      "Frankenstein",
      "Dracula",
      "Carmilla",
      "The Mummy"
    ],
    "correct": 1
  },
  {
    "question": "Mary Shelley wrote which novel?",
    "choices": [
      "Frankenstein",
      "Dracula",
      "Wuthering Heights",
      "Jekyll and Hyde"
    ],
    "correct": 0
  },
  {
    "question": "Which 1978 film launched modern slasher horror?",
    "choices": [
      "Friday the 13th",
      "Halloween",
      "Scream",
      "The Exorcist"
    ],
    "correct": 1
  },
  {
    "question": "Who plays Michael Myers's pursuer Dr. Loomis?",
    "choices": [
      "Donald Pleasence",
      "Christopher Lee",
      "Vincent Price",
      "Boris Karloff"
    ],
    "correct": 0
  },
  {
    "question": "What is Freddy Krueger's iconic weapon?",
    "choices": [
      "Chainsaw",
      "Bladed glove",
      "Hockey mask",
      "Hatchet"
    ],
    "correct": 1
  },
  {
    "question": "What is Jason Voorhees's signature mask?",
    "choices": [
      "Hockey mask",
      "Skull mask",
      "Pig mask",
      "Plain white"
    ],
    "correct": 0
  },
  {
    "question": "Black cats are a symbol of?",
    "choices": [
      "Good luck",
      "Witches",
      "Death",
      "Ghosts"
    ],
    "correct": 1
  },
  {
    "question": "Halloween falls on what date?",
    "choices": [
      "Oct 30",
      "Oct 31",
      "Nov 1",
      "Nov 2"
    ],
    "correct": 1
  },
  {
    "question": "What candy is the most-sold at Halloween in the US?",
    "choices": [
      "Skittles",
      "Reese's",
      "Snickers",
      "M&Ms"
    ],
    "correct": 1
  },
  {
    "question": "What does 'trick or treat' originate from?",
    "choices": [
      "Souling",
      "Mumming",
      "Guising",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Which film features Sanderson sisters?",
    "choices": [
      "The Witch",
      "Hocus Pocus",
      "Coven",
      "Practical Magic"
    ],
    "correct": 1
  },
  {
    "question": "Headless Horseman is from what story?",
    "choices": [
      "Sleepy Hollow",
      "Frankenstein",
      "Dracula",
      "Edgar Allan Poe"
    ],
    "correct": 0
  },
  {
    "question": "Who wrote 'The Tell-Tale Heart'?",
    "choices": [
      "Lovecraft",
      "Poe",
      "King",
      "Stoker"
    ],
    "correct": 1
  },
  {
    "question": "Vampires reportedly fear which plant?",
    "choices": [
      "Rose",
      "Garlic",
      "Wolfsbane",
      "Mistletoe"
    ],
    "correct": 1
  },
  {
    "question": "Werewolves transform under what?",
    "choices": [
      "Sun",
      "Full moon",
      "Eclipse",
      "Storm"
    ],
    "correct": 1
  },
  {
    "question": "Which film uses 'Tubular Bells'?",
    "choices": [
      "The Omen",
      "The Exorcist",
      "Suspiria",
      "Halloween"
    ],
    "correct": 1
  },
  {
    "question": "Who directed 'Get Out' (2017)?",
    "choices": [
      "Ari Aster",
      "Jordan Peele",
      "James Wan",
      "Mike Flanagan"
    ],
    "correct": 1
  },
  {
    "question": "Pumpkin carving originated in?",
    "choices": [
      "England",
      "Ireland",
      "Scotland",
      "Wales"
    ],
    "correct": 1
  },
  {
    "question": "What was the original 'Trick or Treat for UNICEF' year?",
    "choices": [
      "1947",
      "1950",
      "1955",
      "1962"
    ],
    "correct": 2
  },
  {
    "question": "Which witch household pet is called a 'familiar'?",
    "choices": [
      "A wand",
      "A black cat",
      "A broom",
      "A grimoire"
    ],
    "correct": 1
  },
  {
    "question": "Which holiday came from blending Samhain and Christianity?",
    "choices": [
      "Easter",
      "All Hallows",
      "Christmas",
      "Lent"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HalloweenQuizSettings): HalloweenQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HalloweenQuizState, action: HalloweenQuizAction): HalloweenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HalloweenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
