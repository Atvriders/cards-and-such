import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RaveEraQuizSettings { questions: "10" | "20" | "30"; }
export interface RaveEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RaveEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Second Summer of Love was in?",
    "choices": [
      "1985",
      "1988",
      "1991",
      "1994"
    ],
    "correct": 1
  },
  {
    "question": "Acid house was associated with which smiley emblem?",
    "choices": [
      "Yellow smiley",
      "Red heart",
      "Blue star",
      "Green peace"
    ],
    "correct": 0
  },
  {
    "question": "Which UK law in 1994 targeted unlicensed raves?",
    "choices": [
      "Public Order Act",
      "Criminal Justice and Public Order Act",
      "Licensing Act",
      "Misuse of Drugs Act"
    ],
    "correct": 1
  },
  {
    "question": "Roland TB-303 is famous for which sound?",
    "choices": [
      "Acid bass",
      "808 kick",
      "Hi-hat",
      "Pad"
    ],
    "correct": 0
  },
  {
    "question": "The Prodigy's breakthrough album was?",
    "choices": [
      "Music for the Jilted Generation",
      "The Fat of the Land",
      "Experience",
      "Invaders Must Die"
    ],
    "correct": 1
  },
  {
    "question": "'Born Slippy .NUXX' was by which act?",
    "choices": [
      "Underworld",
      "Orbital",
      "Leftfield",
      "Chemical Brothers"
    ],
    "correct": 0
  },
  {
    "question": "'Insomnia' was a 1995 hit by?",
    "choices": [
      "Faithless",
      "Moby",
      "Robert Miles",
      "Sash!"
    ],
    "correct": 0
  },
  {
    "question": "Detroit techno's pioneers include which trio?",
    "choices": [
      "Belleville Three",
      "Chicago Five",
      "Berlin Two",
      "Bristol Posse"
    ],
    "correct": 0
  },
  {
    "question": "Which club is iconic to Berlin's techno scene?",
    "choices": [
      "Berghain",
      "Fabric",
      "Tresor",
      "Both A and C"
    ],
    "correct": 3
  },
  {
    "question": "Goa trance is associated with which country?",
    "choices": [
      "Spain",
      "India",
      "Thailand",
      "Brazil"
    ],
    "correct": 1
  },
  {
    "question": "'Children' was a 1995 dream-trance hit by?",
    "choices": [
      "Robert Miles",
      "BT",
      "Sasha",
      "Tiesto"
    ],
    "correct": 0
  },
  {
    "question": "PLUR stands for?",
    "choices": [
      "Peace Love Unity Respect",
      "People Love Unity Rave",
      "Peace Light Unity Respect",
      "Pray Love Unity Rave"
    ],
    "correct": 0
  },
  {
    "question": "Which UK festival started in 1992 and embraced dance music?",
    "choices": [
      "Creamfields",
      "Glastonbury",
      "Gatecrasher",
      "Tribal Gathering"
    ],
    "correct": 3
  },
  {
    "question": "Cream nightclub was located in?",
    "choices": [
      "Liverpool",
      "Manchester",
      "London",
      "Leeds"
    ],
    "correct": 0
  },
  {
    "question": "The Hacienda was located in?",
    "choices": [
      "Manchester",
      "London",
      "Sheffield",
      "Bristol"
    ],
    "correct": 0
  },
  {
    "question": "Which DJ co-founded Cream and went on to a global career?",
    "choices": [
      "Paul Oakenfold",
      "Sasha",
      "Pete Tong",
      "Carl Cox"
    ],
    "correct": 1
  },
  {
    "question": "'Sandstorm' was a 1999 trance smash by?",
    "choices": [
      "Darude",
      "ATB",
      "Tiesto",
      "Armin van Buuren"
    ],
    "correct": 0
  },
  {
    "question": "Which Aphex Twin album came out in 1995?",
    "choices": [
      "I Care Because You Do",
      "Selected Ambient Works II",
      "Drukqs",
      "Richard D. James Album"
    ],
    "correct": 0
  },
  {
    "question": "Kraftwerk hails from which country?",
    "choices": [
      "UK",
      "Germany",
      "Belgium",
      "France"
    ],
    "correct": 1
  },
  {
    "question": "The genre 'jungle' evolved into?",
    "choices": [
      "Drum and bass",
      "Dubstep",
      "Garage",
      "Techno"
    ],
    "correct": 0
  },
  {
    "question": "UK Garage's vocal-led offshoot is?",
    "choices": [
      "Speed garage",
      "2-step",
      "Bassline",
      "Grime"
    ],
    "correct": 1
  },
  {
    "question": "Daft Punk hails from?",
    "choices": [
      "France",
      "Belgium",
      "Italy",
      "UK"
    ],
    "correct": 0
  },
  {
    "question": "Daft Punk's 1997 debut album was?",
    "choices": [
      "Discovery",
      "Homework",
      "Human After All",
      "Random Access Memories"
    ],
    "correct": 1
  },
  {
    "question": "'Music Sounds Better with You' was by?",
    "choices": [
      "Stardust",
      "Modjo",
      "Cassius",
      "Phoenix"
    ],
    "correct": 0
  },
  {
    "question": "Which festival in the desert started in 1986 and influenced rave culture?",
    "choices": [
      "Burning Man",
      "Coachella",
      "Lollapalooza",
      "Bonnaroo"
    ],
    "correct": 0
  },
  {
    "question": "'Where's Your Head At' was by?",
    "choices": [
      "Basement Jaxx",
      "Chemical Brothers",
      "Fatboy Slim",
      "Underworld"
    ],
    "correct": 0
  },
  {
    "question": "Fatboy Slim's real name is?",
    "choices": [
      "Norman Cook",
      "Liam Howlett",
      "Tom Rowlands",
      "Carl Cox"
    ],
    "correct": 0
  },
  {
    "question": "Vinyl size most associated with 12-inch dance singles is?",
    "choices": [
      "33⅓ rpm",
      "45 rpm",
      "78 rpm",
      "16 rpm"
    ],
    "correct": 1
  },
  {
    "question": "Which drum machine was central to early house music?",
    "choices": [
      "Roland TR-909",
      "Roland TR-808",
      "Linn LM-1",
      "Korg KR-55"
    ],
    "correct": 1
  },
  {
    "question": "Which act released 'Smack My B**** Up' in 1997?",
    "choices": [
      "The Prodigy",
      "Chemical Brothers",
      "Crystal Method",
      "Underworld"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RaveEraQuizSettings): RaveEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RaveEraQuizState, action: RaveEraQuizAction): RaveEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RaveEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
