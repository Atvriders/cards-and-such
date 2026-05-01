import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CartoonsQuizSettings { questions: "10" | "20" | "30"; }
export interface CartoonsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CartoonsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's Bugs Bunny's catchphrase?", choices: ["What's up, doc?","That's all folks","Th-th-that's all","Wabbit season"], correct: 0 },
  { question: "What studio produced Bugs Bunny?", choices: ["Warner Bros (Looney Tunes)","Disney","Hanna-Barbera","Fleischer"], correct: 0 },
  { question: "What pig says th-th-that's all folks?", choices: ["Porky Pig","Wilbur","Babe","Pig Pen"], correct: 0 },
  { question: "What duck is Bugs's frequent rival?", choices: ["Daffy","Donald","Plucky","Howard"], correct: 0 },
  { question: "What hunter chases Bugs Bunny?", choices: ["Elmer Fudd","Yosemite Sam","Both","Just Fudd"], correct: 2 },
  { question: "What roadrunner says beep beep?", choices: ["Road Runner","Speedy Gonzales","Just Road Runner","Both"], correct: 0 },
  { question: "Who chases the Road Runner?", choices: ["Wile E. Coyote","Sylvester","Yosemite Sam","Marvin Martian"], correct: 0 },
  { question: "What 60s primetime cartoon featured a Stone Age family?", choices: ["The Flintstones","Yogi Bear","Top Cat","Jetsons"], correct: 0 },
  { question: "What show featured a futuristic family?", choices: ["The Jetsons","The Flintstones","Astro Boy","Futurama"], correct: 0 },
  { question: "What cartoon features Yogi Bear?", choices: ["The Yogi Bear Show / Hanna-Barbera","Disney","Warner","Pixar"], correct: 0 },
  { question: "What's Yogi's friend bear?", choices: ["Boo Boo","Cindy","Both","Smokey"], correct: 0 },
  { question: "What 1969 mystery cartoon features a Great Dane?", choices: ["Scooby-Doo","Snoopy","Lassie","Goofy"], correct: 0 },
  { question: "What's Scooby's owner-friend?", choices: ["Shaggy","Fred","Velma","Daphne"], correct: 0 },
  { question: "What show features Tom and Jerry?", choices: ["Tom and Jerry","Tom & Jerry tales","Both","Original 1940 MGM"], correct: 3 },
  { question: "What does Charlie Brown often say?", choices: ["Good grief","Aaugh","Both","Wishy washy"], correct: 2 },
  { question: "What's Charlie Brown's beagle?", choices: ["Snoopy","Woodstock","Both characters","Just Snoopy"], correct: 0 },
  { question: "What 90s Nickelodeon cartoon features Arnold (football head)?", choices: ["Hey Arnold!","Doug","Rugrats","CatDog"], correct: 0 },
  { question: "What 90s Nickelodeon cartoon features Tommy Pickles?", choices: ["Rugrats","Doug","Hey Arnold","CatDog"], correct: 0 },
  { question: "What 90s Cartoon Network show features Powerpuff Girls?", choices: ["The Powerpuff Girls","Dexter's Lab","Johnny Bravo","CatDog"], correct: 0 },
  { question: "Who created Powerpuff Girls?", choices: ["Craig McCracken","Genndy Tartakovsky","Tom McGrath","Butch Hartman"], correct: 0 },
  { question: "What 90s show features Dexter's secret lab?", choices: ["Dexter's Laboratory","Powerpuff","Johnny Bravo","Cow and Chicken"], correct: 0 },
  { question: "What Cartoon Network show features Finn and Jake?", choices: ["Adventure Time","Regular Show","Steven Universe","Gumball"], correct: 0 },
  { question: "What Cartoon Network show features Mordecai and Rigby?", choices: ["Regular Show","Adventure Time","Both","Annoying Orange"], correct: 0 },
  { question: "What 90s show is South Park?", choices: ["1997-present","2000-present","Different","Same since 97"], correct: 0 },
  { question: "Who created South Park?", choices: ["Trey Parker and Matt Stone","Seth MacFarlane","Mike Judge","Both creators"], correct: 0 },
  { question: "What 1999-present Fox cartoon features Stewie?", choices: ["Family Guy","American Dad","Cleveland","Bobs Burgers"], correct: 0 },
  { question: "Who created Family Guy?", choices: ["Seth MacFarlane","Mike Judge","Matt Groening","Trey Parker"], correct: 0 },
  { question: "Who created The Simpsons?", choices: ["Matt Groening","Seth MacFarlane","Mike Judge","Both Groening and others"], correct: 0 },
  { question: "What 90s MTV cartoon features Beavis?", choices: ["Beavis and Butt-Head","Daria","Liquid TV","Aeon Flux"], correct: 0 },
  { question: "What 80s GI Joe cartoon featured?", choices: ["A Real American Hero","Sigma 6","Both eras","Just Joe"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CartoonsQuizSettings): CartoonsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CartoonsQuizState, action: CartoonsQuizAction): CartoonsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CartoonsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
