import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpoonerismQuizSettings { questions: "8" | "10" | "12"; }
export interface SpoonerismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpoonerismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'A blushing crow' is a spoonerism of?",
    "choices": [
      "a crushing blow",
      "a brushing crow",
      "a flushing crow",
      "a rushing brow"
    ],
    "correct": 0
  },
  {
    "question": "'Belly jeans' is a spoonerism of?",
    "choices": [
      "jelly beans",
      "belly beans",
      "jolly jeans",
      "belly jams"
    ],
    "correct": 0
  },
  {
    "question": "'Plaster man' is a spoonerism of?",
    "choices": [
      "master plan",
      "plastic man",
      "pasture man",
      "plaster pan"
    ],
    "correct": 0
  },
  {
    "question": "'Sealing the hick' is a spoonerism of?",
    "choices": [
      "healing the sick",
      "feeling the hick",
      "sealing the kick",
      "sailing the hill"
    ],
    "correct": 0
  },
  {
    "question": "'Tease my ears' is a spoonerism of?",
    "choices": [
      "ease my tears",
      "tease my fears",
      "freeze my ears",
      "tease my years"
    ],
    "correct": 0
  },
  {
    "question": "'Wave the sails' is a spoonerism of?",
    "choices": [
      "save the whales",
      "wave the whales",
      "save the sails",
      "wave the wails"
    ],
    "correct": 0
  },
  {
    "question": "'Trail snacks' is a spoonerism of?",
    "choices": [
      "snail tracks",
      "trail snakes",
      "frail snacks",
      "tail snacks"
    ],
    "correct": 0
  },
  {
    "question": "'Flutter by' is a spoonerism of?",
    "choices": [
      "butterfly",
      "flutter buy",
      "fly by",
      "flatter by"
    ],
    "correct": 0
  },
  {
    "question": "'Lack of pies' is a spoonerism of?",
    "choices": [
      "pack of lies",
      "lack of lies",
      "lack of pi",
      "back of pies"
    ],
    "correct": 0
  },
  {
    "question": "'Bedding wells' is a spoonerism of?",
    "choices": [
      "wedding bells",
      "bedding bells",
      "bedding wills",
      "wedding wells"
    ],
    "correct": 0
  },
  {
    "question": "'Roaring with pain' is a spoonerism of?",
    "choices": [
      "pouring with rain",
      "roaring with rain",
      "soaring with pain",
      "roaring with main"
    ],
    "correct": 0
  },
  {
    "question": "'Chipping the flannel' is a spoonerism of?",
    "choices": [
      "flipping the channel",
      "chipping the channel",
      "flipping the flannel",
      "skipping the channel"
    ],
    "correct": 0
  },
  {
    "question": "'Birthington's washday' is a spoonerism of?",
    "choices": [
      "Washington's birthday",
      "Washington's washday",
      "Birmington's birthday",
      "Burlington's washday"
    ],
    "correct": 0
  },
  {
    "question": "'Mardon me, padam' is a spoonerism of?",
    "choices": [
      "Pardon me, madam",
      "Mardon me, madam",
      "Garden me, padam",
      "Bargain me, madam"
    ],
    "correct": 0
  },
  {
    "question": "'A well-boiled icicle' is a spoonerism of?",
    "choices": [
      "a well-oiled bicycle",
      "a well-cooled icicle",
      "a well-foiled icicle",
      "a well-boiled cycle"
    ],
    "correct": 0
  },
  {
    "question": "'Fighting a liar' is a spoonerism of?",
    "choices": [
      "lighting a fire",
      "lighting a liar",
      "fighting a fire",
      "fighting a friar"
    ],
    "correct": 0
  },
  {
    "question": "'Cop porn' is a spoonerism of?",
    "choices": [
      "popcorn",
      "cop horn",
      "cop borne",
      "top corn"
    ],
    "correct": 0
  },
  {
    "question": "'Soul of ballad' is a spoonerism of?",
    "choices": [
      "bowl of salad",
      "sole of ballad",
      "sole of salad",
      "bowl of ballad"
    ],
    "correct": 0
  },
  {
    "question": "'Tons of soil' is a spoonerism of?",
    "choices": [
      "sons of toil",
      "tons of toil",
      "sons of soil",
      "fans of toil"
    ],
    "correct": 0
  },
  {
    "question": "'Nosey little cook' is a spoonerism of?",
    "choices": [
      "cosy little nook",
      "nosy little nook",
      "cosy little book",
      "rosy little cook"
    ],
    "correct": 0
  },
  {
    "question": "'Know your blows' is a spoonerism of?",
    "choices": [
      "blow your nose",
      "know your nose",
      "blow your blows",
      "know your toes"
    ],
    "correct": 0
  },
  {
    "question": "'Go and shake a tower' is a spoonerism of?",
    "choices": [
      "go and take a shower",
      "go and bake a tower",
      "go and rake a flower",
      "go and shake a flower"
    ],
    "correct": 0
  },
  {
    "question": "'Queer old dean' is a spoonerism of?",
    "choices": [
      "dear old queen",
      "dear old dean",
      "queer old queen",
      "rear old dean"
    ],
    "correct": 0
  },
  {
    "question": "'Hissed all my mystery lectures' is a spoonerism of?",
    "choices": [
      "missed all my history lectures",
      "hissed all my history lectures",
      "kissed all my mystery lectures",
      "missed all my mystery lectures"
    ],
    "correct": 0
  },
  {
    "question": "'Half-warmed fish' is a spoonerism of?",
    "choices": [
      "half-formed wish",
      "half-warmed dish",
      "half-formed fish",
      "half-warm fish"
    ],
    "correct": 0
  },
  {
    "question": "'Nicking your pose' is a spoonerism of?",
    "choices": [
      "picking your nose",
      "kicking your pose",
      "picking your pose",
      "nicking your nose"
    ],
    "correct": 0
  },
  {
    "question": "'Tip of the slung' is a spoonerism of?",
    "choices": [
      "slip of the tongue",
      "tip of the tongue",
      "slip of the slung",
      "tip of the lung"
    ],
    "correct": 0
  },
  {
    "question": "'Roy of the bovers' is a spoonerism of?",
    "choices": [
      "boy of the rovers",
      "roy of the rovers",
      "boy of the bovers",
      "joy of the bovers"
    ],
    "correct": 0
  },
  {
    "question": "'Bunny phone' is a spoonerism of?",
    "choices": [
      "funny bone",
      "bunny bone",
      "funny phone",
      "honey bone"
    ],
    "correct": 0
  },
  {
    "question": "'Ready as a stock' is a spoonerism of?",
    "choices": [
      "steady as a rock",
      "ready as a rock",
      "steady as a stock",
      "heady as a rock"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpoonerismQuizSettings): SpoonerismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpoonerismQuizState, action: SpoonerismQuizAction): SpoonerismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpoonerismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
