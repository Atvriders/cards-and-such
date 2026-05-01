import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarvelMcuQuizSettings { questions: "10" | "20" | "30"; }
export interface MarvelMcuQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarvelMcuQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the first MCU film?", choices: ["Iron Man","Incredible Hulk","Thor","Captain America"], correct: 0 },
  { question: "In what year was Iron Man released?", choices: ["2008","2010","2007","2009"], correct: 0 },
  { question: "Who plays Tony Stark?", choices: ["Robert Downey Jr.","Chris Evans","Chris Hemsworth","Mark Ruffalo"], correct: 0 },
  { question: "Who plays Captain America?", choices: ["Chris Evans","Chris Hemsworth","Anthony Mackie","Sebastian Stan"], correct: 0 },
  { question: "Who plays Thor?", choices: ["Chris Hemsworth","Tom Hiddleston","Chris Evans","Idris Elba"], correct: 0 },
  { question: "Who plays the Hulk?", choices: ["Mark Ruffalo","Edward Norton (one film)","Both played him","Eric Bana"], correct: 2 },
  { question: "Who plays Black Widow?", choices: ["Scarlett Johansson","Florence Pugh","Olga Kurylenko","Cobie Smulders"], correct: 0 },
  { question: "Who plays Spider-Man in MCU?", choices: ["Tom Holland","Tobey Maguire","Andrew Garfield","All in No Way Home"], correct: 0 },
  { question: "Who plays Doctor Strange?", choices: ["Benedict Cumberbatch","Mads Mikkelsen","Tilda Swinton","Chiwetel Ejiofor"], correct: 0 },
  { question: "What's Black Panther's home country?", choices: ["Wakanda","Latveria","Genosha","Sokovia"], correct: 0 },
  { question: "Who plays Black Panther?", choices: ["Chadwick Boseman","Letitia Wright","Daniel Kaluuya","Michael B. Jordan"], correct: 0 },
  { question: "What stones does Thanos seek?", choices: ["Infinity Stones","Soul Stones","Power Stones","Reality Stones"], correct: 0 },
  { question: "How many Infinity Stones are there?", choices: ["6","5","7","8"], correct: 0 },
  { question: "What 2018 film features Thanos's snap?", choices: ["Avengers: Infinity War","Endgame","Civil War","Age of Ultron"], correct: 0 },
  { question: "Who plays Thanos?", choices: ["Josh Brolin","Mark Ruffalo","Vin Diesel","Cary Elwes"], correct: 0 },
  { question: "What's Thor's hammer called?", choices: ["Mjolnir","Stormbreaker","Both wielded by Thor","Gungnir"], correct: 2 },
  { question: "What's Steve Rogers' shield made of (mostly)?", choices: ["Vibranium","Adamantium","Steel","Titanium"], correct: 0 },
  { question: "What's the second Avengers film (2015)?", choices: ["Age of Ultron","Civil War","Infinity War","Avengers (1)"], correct: 0 },
  { question: "Who plays Loki?", choices: ["Tom Hiddleston","Chris Hemsworth","Idris Elba","Anthony Hopkins"], correct: 0 },
  { question: "Who plays Iron Man's friend Rhodey?", choices: ["Don Cheadle (and Terrence Howard)","Don Cheadle only","Terrence Howard only","Anthony Mackie"], correct: 0 },
  { question: "Who's Star-Lord?", choices: ["Peter Quill (Chris Pratt)","Drax","Rocket","Groot"], correct: 0 },
  { question: "What film introduced the Guardians of the Galaxy?", choices: ["Guardians of the Galaxy (2014)","Avengers","Vol 2","Infinity War"], correct: 0 },
  { question: "Who plays Gamora?", choices: ["Zoe Saldana","Karen Gillan","Pom Klementieff","Rooney Mara"], correct: 0 },
  { question: "Who plays Nebula?", choices: ["Karen Gillan","Zoe Saldana","Pom Klementieff","Bryce Dallas Howard"], correct: 0 },
  { question: "What's Bucky Barnes' alter ego?", choices: ["Winter Soldier","Falcon","White Wolf","All used"], correct: 3 },
  { question: "Who plays Bucky?", choices: ["Sebastian Stan","Anthony Mackie","Chris Evans","Daniel Bruhl"], correct: 0 },
  { question: "What's Vision created from?", choices: ["JARVIS, Mind Stone, vibranium","Just Ultron","Ultron's body","Iron Man"], correct: 0 },
  { question: "Who plays Vision?", choices: ["Paul Bettany","James Spader","Don Cheadle","Mark Ruffalo"], correct: 0 },
  { question: "Who plays Wanda Maximoff (Scarlet Witch)?", choices: ["Elizabeth Olsen","Aaron Taylor-Johnson","Both","Just Olsen plays Wanda"], correct: 0 },
  { question: "What's the magic word from Doctor Strange's incantations?", choices: ["Various Latin/Sanskrit phrases","Abracadabra","Open Sesame","Hocus Pocus"], correct: 0 },
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
