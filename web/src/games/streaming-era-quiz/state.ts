import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StreamingEraQuizSettings { questions: "10" | "20" | "30"; }
export interface StreamingEraQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StreamingEraQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Spotify was founded in?",
    "choices": [
      "Sweden",
      "USA",
      "UK",
      "Germany"
    ],
    "correct": 0
  },
  {
    "question": "Spotify launched publicly in?",
    "choices": [
      "2006",
      "2008",
      "2010",
      "2012"
    ],
    "correct": 1
  },
  {
    "question": "Apple Music launched in?",
    "choices": [
      "2013",
      "2014",
      "2015",
      "2016"
    ],
    "correct": 2
  },
  {
    "question": "Tidal was relaunched in 2015 by?",
    "choices": [
      "Jay-Z",
      "Kanye West",
      "Drake",
      "Beyonce"
    ],
    "correct": 0
  },
  {
    "question": "Netflix began streaming in?",
    "choices": [
      "2005",
      "2007",
      "2009",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "Disney+ launched in?",
    "choices": [
      "November 2018",
      "November 2019",
      "March 2020",
      "June 2020"
    ],
    "correct": 1
  },
  {
    "question": "HBO Max rebranded in 2023 to?",
    "choices": [
      "Max",
      "HBO Now",
      "Discovery+",
      "Paramount+"
    ],
    "correct": 0
  },
  {
    "question": "YouTube was founded in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "YouTube was acquired by Google in?",
    "choices": [
      "2005",
      "2006",
      "2008",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "TikTok's parent company is?",
    "choices": [
      "ByteDance",
      "Tencent",
      "Alibaba",
      "Baidu"
    ],
    "correct": 0
  },
  {
    "question": "TikTok launched globally in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "Twitch was acquired by which company in 2014?",
    "choices": [
      "Amazon",
      "Google",
      "Microsoft",
      "Facebook"
    ],
    "correct": 0
  },
  {
    "question": "Which Netflix show became its first global breakout in 2013?",
    "choices": [
      "House of Cards",
      "Orange Is the New Black",
      "Stranger Things",
      "Narcos"
    ],
    "correct": 0
  },
  {
    "question": "'Stranger Things' premiered on Netflix in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "'Squid Game' debuted in?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 2
  },
  {
    "question": "Which song was Spotify's first to hit 1 billion streams?",
    "choices": [
      "One Dance",
      "Shape of You",
      "Closer",
      "Rockstar"
    ],
    "correct": 1
  },
  {
    "question": "Bad Bunny topped Spotify's global artist chart for which year first?",
    "choices": [
      "2018",
      "2020",
      "2021",
      "2023"
    ],
    "correct": 1
  },
  {
    "question": "Which platform popularized 'Wrapped' year-end summaries?",
    "choices": [
      "Spotify",
      "Apple Music",
      "Pandora",
      "Amazon Music"
    ],
    "correct": 0
  },
  {
    "question": "Which device line did Roku begin selling in 2008?",
    "choices": [
      "Streaming player",
      "Smart TV",
      "Soundbar",
      "Tablet"
    ],
    "correct": 0
  },
  {
    "question": "Hulu was founded in?",
    "choices": [
      "2007",
      "2009",
      "2011",
      "2013"
    ],
    "correct": 0
  },
  {
    "question": "Paramount+ rebranded from?",
    "choices": [
      "CBS All Access",
      "Showtime Anytime",
      "Pluto TV",
      "Crave"
    ],
    "correct": 0
  },
  {
    "question": "Peacock is owned by?",
    "choices": [
      "NBCUniversal",
      "Disney",
      "WBD",
      "Amazon"
    ],
    "correct": 0
  },
  {
    "question": "Apple TV+ launched in?",
    "choices": [
      "October 2018",
      "November 2019",
      "March 2020",
      "July 2021"
    ],
    "correct": 1
  },
  {
    "question": "Which Apple TV+ show won Best Comedy at the 2021 Emmys?",
    "choices": [
      "Ted Lasso",
      "The Morning Show",
      "Severance",
      "Slow Horses"
    ],
    "correct": 0
  },
  {
    "question": "Which platform popularized short vertical video before TikTok?",
    "choices": [
      "Vine",
      "Snapchat",
      "Periscope",
      "Meerkat"
    ],
    "correct": 0
  },
  {
    "question": "Vine shut down in?",
    "choices": [
      "2014",
      "2017",
      "2019",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Which streaming service offers ad-supported tiers introduced in 2022?",
    "choices": [
      "Netflix",
      "Disney+",
      "Both A and B",
      "Neither"
    ],
    "correct": 2
  },
  {
    "question": "Which short-form vertical feature did YouTube launch in 2020?",
    "choices": [
      "Shorts",
      "Reels",
      "Snippets",
      "Quick"
    ],
    "correct": 0
  },
  {
    "question": "Which Netflix anime hit dominated 2024 charts?",
    "choices": [
      "My Daemon",
      "Blue Eye Samurai",
      "Pluto",
      "All of the above"
    ],
    "correct": 1
  },
  {
    "question": "Spotify acquired which podcast platform in 2019?",
    "choices": [
      "Anchor",
      "SoundCloud",
      "Stitcher",
      "Acast"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StreamingEraQuizSettings): StreamingEraQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StreamingEraQuizState, action: StreamingEraQuizAction): StreamingEraQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StreamingEraQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
