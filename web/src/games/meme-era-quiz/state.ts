import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MemeEraQuizSettings { questions: "10" | "20" | "30"; }
export interface MemeEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MemeEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The term 'meme' was coined by which scientist?",
    "choices": [
      "Richard Dawkins",
      "Carl Sagan",
      "Stephen Jay Gould",
      "E.O. Wilson"
    ],
    "correct": 0
  },
  {
    "question": "In which 1976 book did 'meme' first appear?",
    "choices": [
      "The Selfish Gene",
      "The Blind Watchmaker",
      "On the Origin",
      "Sociobiology"
    ],
    "correct": 0
  },
  {
    "question": "'Doge' meme features which dog breed?",
    "choices": [
      "Shiba Inu",
      "Akita",
      "Corgi",
      "Husky"
    ],
    "correct": 0
  },
  {
    "question": "'Rickrolling' uses which Rick Astley song?",
    "choices": [
      "Never Gonna Give You Up",
      "Together Forever",
      "Whenever You Need Somebody",
      "Cry for Help"
    ],
    "correct": 0
  },
  {
    "question": "'Distracted Boyfriend' meme originated from which kind of image?",
    "choices": [
      "Stock photo",
      "Movie still",
      "TV screenshot",
      "News photo"
    ],
    "correct": 0
  },
  {
    "question": "'Pepe the Frog' was created by?",
    "choices": [
      "Matt Furie",
      "Trey Parker",
      "Seth MacFarlane",
      "Mike Judge"
    ],
    "correct": 0
  },
  {
    "question": "'LOLcat' captions traditionally use which style?",
    "choices": [
      "Impact font",
      "Comic Sans",
      "Arial",
      "Helvetica"
    ],
    "correct": 0
  },
  {
    "question": "Which site popularized image macros in the 2000s?",
    "choices": [
      "4chan",
      "Reddit",
      "Tumblr",
      "Digg"
    ],
    "correct": 0
  },
  {
    "question": "Which subreddit specializes in memes?",
    "choices": [
      "r/memes",
      "r/dankmemes",
      "Both A and B",
      "r/AskReddit"
    ],
    "correct": 2
  },
  {
    "question": "'Salt Bae' became a meme in?",
    "choices": [
      "2015",
      "2017",
      "2019",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "'Harambe' was a gorilla at which zoo?",
    "choices": [
      "Cincinnati Zoo",
      "Bronx Zoo",
      "San Diego Zoo",
      "Atlanta Zoo"
    ],
    "correct": 0
  },
  {
    "question": "Harambe died in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "'Ice Bucket Challenge' raised awareness for?",
    "choices": [
      "ALS",
      "Cancer",
      "Diabetes",
      "Alzheimer's"
    ],
    "correct": 0
  },
  {
    "question": "'Gangnam Style' broke 1B YouTube views in?",
    "choices": [
      "2010",
      "2012",
      "2014",
      "2016"
    ],
    "correct": 1
  },
  {
    "question": "Who created 'Gangnam Style'?",
    "choices": [
      "Psy",
      "BTS",
      "BIGBANG",
      "2NE1"
    ],
    "correct": 0
  },
  {
    "question": "'Tide Pod Challenge' went viral in?",
    "choices": [
      "2016",
      "2018",
      "2020",
      "2022"
    ],
    "correct": 1
  },
  {
    "question": "'Bernie's Mittens' meme came from which 2021 event?",
    "choices": [
      "Inauguration",
      "SOTU",
      "Debate",
      "Rally"
    ],
    "correct": 0
  },
  {
    "question": "Which Drake meme template uses 'reject/approve' poses?",
    "choices": [
      "Hotline Bling",
      "God's Plan",
      "In My Feelings",
      "Started From the Bottom"
    ],
    "correct": 0
  },
  {
    "question": "'Crying Jordan' meme stems from which event?",
    "choices": [
      "Hall of Fame speech",
      "Final shot",
      "Olympic medal",
      "Retirement"
    ],
    "correct": 0
  },
  {
    "question": "'This Is Fine' dog sits in a?",
    "choices": [
      "Burning room",
      "Flooded room",
      "Car",
      "Office"
    ],
    "correct": 0
  },
  {
    "question": "'Doge' coin spiked due to tweets from?",
    "choices": [
      "Elon Musk",
      "Mark Cuban",
      "Jack Dorsey",
      "Vitalik Buterin"
    ],
    "correct": 0
  },
  {
    "question": "'Wojak' is also known as?",
    "choices": [
      "Feels Guy",
      "Sad Frog",
      "NPC",
      "Pepe"
    ],
    "correct": 0
  },
  {
    "question": "'NPC meme' references which video game term?",
    "choices": [
      "Non-Player Character",
      "New Player Combo",
      "Net Power Charge",
      "No Player Connection"
    ],
    "correct": 0
  },
  {
    "question": "Which platform popularized short looping video memes 2013-2017?",
    "choices": [
      "Vine",
      "TikTok",
      "Periscope",
      "Reels"
    ],
    "correct": 0
  },
  {
    "question": "'Damn Daniel' originated on?",
    "choices": [
      "Twitter",
      "Facebook",
      "Vine",
      "TikTok"
    ],
    "correct": 2
  },
  {
    "question": "'Charlie Bit My Finger' was sold as an NFT in?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 2
  },
  {
    "question": "'Stonks' meme uses which Roman-style character?",
    "choices": [
      "Meme Man",
      "Pepe",
      "Wojak",
      "Doge"
    ],
    "correct": 0
  },
  {
    "question": "'Coffin Dance' originated in which country?",
    "choices": [
      "Ghana",
      "Nigeria",
      "Kenya",
      "South Africa"
    ],
    "correct": 0
  },
  {
    "question": "Know Your Meme is a database owned by?",
    "choices": [
      "Literally Media",
      "BuzzFeed",
      "Vox",
      "Vice"
    ],
    "correct": 0
  },
  {
    "question": "'Among Us' became a meme by which sus phrase?",
    "choices": [
      "Sus",
      "GG",
      "OP",
      "Ez"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MemeEraQuizSettings): MemeEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MemeEraQuizState, action: MemeEraQuizAction): MemeEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MemeEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
