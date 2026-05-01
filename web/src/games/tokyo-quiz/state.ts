import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TokyoQuizSettings { questions: "10" | "20"; }
export interface TokyoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TokyoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Tokyo's most famous pedestrian crossing is in?",
    "choices": [
      "Shibuya",
      "Ginza",
      "Akihabara",
      "Roppongi"
    ],
    "correct": 0
  },
  {
    "question": "The Imperial Palace is in which central ward?",
    "choices": [
      "Chiyoda",
      "Shinjuku",
      "Minato",
      "Taito"
    ],
    "correct": 0
  },
  {
    "question": "The tallest tower in Tokyo is?",
    "choices": [
      "Tokyo Tower",
      "Tokyo Skytree",
      "Mori Tower",
      "Sunshine 60"
    ],
    "correct": 1
  },
  {
    "question": "Akihabara is best known for?",
    "choices": [
      "high fashion",
      "electronics & anime",
      "the financial district",
      "the wholesale fish market"
    ],
    "correct": 1
  },
  {
    "question": "Tsukiji was historically famous for the?",
    "choices": [
      "zoo",
      "outer fish market",
      "imperial gardens",
      "Olympic stadium"
    ],
    "correct": 1
  },
  {
    "question": "The Tokyo 2020 Olympics were actually held in?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 2
  },
  {
    "question": "Senso-ji temple is located in?",
    "choices": [
      "Asakusa",
      "Shinjuku",
      "Roppongi",
      "Odaiba"
    ],
    "correct": 0
  },
  {
    "question": "Shinjuku Station is famous as the world's?",
    "choices": [
      "oldest station",
      "busiest station",
      "longest station",
      "smallest station"
    ],
    "correct": 1
  },
  {
    "question": "Harajuku is best known for?",
    "choices": [
      "sumo wrestling",
      "youth street fashion",
      "auto racing",
      "stock trading"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo was previously called?",
    "choices": [
      "Edo",
      "Kyoto",
      "Osaka",
      "Nara"
    ],
    "correct": 0
  },
  {
    "question": "Edo became Tokyo in?",
    "choices": [
      "1603",
      "1868",
      "1923",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "The Great Kanto Earthquake struck Tokyo in?",
    "choices": [
      "1905",
      "1923",
      "1945",
      "1964"
    ],
    "correct": 1
  },
  {
    "question": "Sumo's main Tokyo arena is the?",
    "choices": [
      "Budokan",
      "Ryogoku Kokugikan",
      "Tokyo Dome",
      "Saitama Arena"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo's bullet train network is called?",
    "choices": [
      "Maglev",
      "Shinkansen",
      "JR Express",
      "Tokaido Limited"
    ],
    "correct": 1
  },
  {
    "question": "Ginza is best known for?",
    "choices": [
      "upscale shopping",
      "fishing piers",
      "auto factories",
      "rice paddies"
    ],
    "correct": 0
  },
  {
    "question": "Roppongi is famous for its?",
    "choices": [
      "temples",
      "nightlife",
      "ports",
      "rice terraces"
    ],
    "correct": 1
  },
  {
    "question": "Odaiba is a?",
    "choices": [
      "mountain",
      "man-made island",
      "river valley",
      "ancient ruin"
    ],
    "correct": 1
  },
  {
    "question": "Meiji Shrine honors Emperor Meiji and?",
    "choices": [
      "Empress Shoken",
      "Empress Masako",
      "Empress Michiko",
      "Empress Sadako"
    ],
    "correct": 0
  },
  {
    "question": "Tokyo Tower was modeled after the?",
    "choices": [
      "Eiffel Tower",
      "CN Tower",
      "Empire State Building",
      "Petronas Towers"
    ],
    "correct": 0
  },
  {
    "question": "Tokyo's first subway line was the?",
    "choices": [
      "Marunouchi Line",
      "Ginza Line",
      "Hibiya Line",
      "Yamanote Line"
    ],
    "correct": 1
  },
  {
    "question": "Sushi originated as a way to?",
    "choices": [
      "preserve fish with rice",
      "fry fish quickly",
      "smoke seafood",
      "ferment seaweed"
    ],
    "correct": 0
  },
  {
    "question": "Ramen broth tonkotsu is made primarily from?",
    "choices": [
      "beef bones",
      "pork bones",
      "chicken feet",
      "fish flakes"
    ],
    "correct": 1
  },
  {
    "question": "Wagyu refers to?",
    "choices": [
      "raw fish",
      "Japanese beef",
      "rice wine",
      "buckwheat noodles"
    ],
    "correct": 1
  },
  {
    "question": "Mt. Fuji can be glimpsed from Tokyo on a clear day to the?",
    "choices": [
      "north",
      "south",
      "east",
      "west/southwest"
    ],
    "correct": 3
  },
  {
    "question": "Kabuki theater's main Tokyo venue is the?",
    "choices": [
      "Kabuki-za",
      "National Theatre",
      "Tokyo Dome",
      "Suntory Hall"
    ],
    "correct": 0
  },
  {
    "question": "Yamanote Line forms a loop around?",
    "choices": [
      "central Tokyo",
      "Yokohama",
      "Chiba",
      "Saitama"
    ],
    "correct": 0
  },
  {
    "question": "Shibuya's loyal-dog statue commemorates?",
    "choices": [
      "Hachiko",
      "Saburo",
      "Pochi",
      "Taro"
    ],
    "correct": 0
  },
  {
    "question": "Ueno Park is famous for its?",
    "choices": [
      "surfing",
      "cherry blossoms & museums",
      "ski lifts",
      "amusement park"
    ],
    "correct": 1
  },
  {
    "question": "The Japanese term for cherry-blossom viewing is?",
    "choices": [
      "matsuri",
      "hanami",
      "ikebana",
      "origami"
    ],
    "correct": 1
  },
  {
    "question": "Tokyo's metropolitan population is roughly?",
    "choices": [
      "5 million",
      "14 million",
      "37 million metro area",
      "60 million"
    ],
    "correct": 2
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TokyoQuizSettings): TokyoQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TokyoQuizState, action: TokyoQuizAction): TokyoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TokyoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
