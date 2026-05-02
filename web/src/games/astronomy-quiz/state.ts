import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface AstronomyQuizSettings { questions: "10" | "20" | "30"; }
export interface AstronomyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AstronomyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many planets are in our solar system?", choices: ["8","9","7","10"], correct: 0, explanation: "Since the IAU's 2006 reclassification of Pluto as a dwarf planet, there are 8 official planets." },
  { question: "What is the closest star to Earth (besides Sun)?", choices: ["Proxima Centauri","Alpha Centauri","Sirius","Barnard's Star"], correct: 0, explanation: "Proxima Centauri is about 4.24 light-years away, part of the Alpha Centauri system." },
  { question: "What is the largest planet in our solar system?", choices: ["Jupiter","Saturn","Neptune","Earth"], correct: 0, explanation: "Jupiter is so massive it could fit all other planets inside it twice over." },
  { question: "What is the smallest planet?", choices: ["Mercury","Mars","Venus","Pluto (now dwarf)"], correct: 0, explanation: "Mercury, the closest planet to the Sun, is only slightly larger than Earth's Moon." },
  { question: "What planet is known for its rings?", choices: ["Saturn","Jupiter","Uranus","Neptune"], correct: 0, explanation: "Saturn's rings are made of ice and rock; all four gas giants have rings, but Saturn's are most prominent." },
  { question: "What's the hottest planet in our solar system?", choices: ["Venus","Mercury","Mars","Earth"], correct: 0, explanation: "Venus's runaway greenhouse effect creates surface temps around 465°C, hotter than Mercury." },
  { question: "What galaxy is Earth in?", choices: ["Milky Way","Andromeda","Triangulum","Sombrero"], correct: 0, explanation: "The Milky Way is a barred spiral galaxy roughly 100,000 light-years across." },
  { question: "What is the largest galaxy near ours?", choices: ["Andromeda","Milky Way","Triangulum","M82"], correct: 0, explanation: "Andromeda (M31) is on a collision course with the Milky Way, expected to merge in ~4.5 billion years." },
  { question: "How long is a light-year?", choices: ["Distance light travels in a year (~9.46 trillion km)","Time","Speed","Mass"], correct: 0, explanation: "One light-year equals about 9.46 trillion km — the distance light travels in a vacuum in one Julian year." },
  { question: "What's the speed of light in vacuum?", choices: ["~300,000 km/s","~150,000 km/s","~3,000 km/s","~30,000 km/s"], correct: 0, explanation: "Light travels at 299,792,458 m/s (about 300,000 km/s) — a universal speed limit per relativity." },
  { question: "What was the first man-made satellite?", choices: ["Sputnik 1","Vanguard","Explorer 1","Pioneer"], correct: 0, explanation: "Sputnik 1, launched by the USSR on October 4, 1957, ignited the Space Race." },
  { question: "In what year was Sputnik launched?", choices: ["1957","1961","1969","1953"], correct: 0, explanation: "October 4, 1957 — the date many consider the dawn of the Space Age." },
  { question: "Who was first human in space?", choices: ["Yuri Gagarin","Neil Armstrong","Alan Shepard","John Glenn"], correct: 0, explanation: "Cosmonaut Yuri Gagarin orbited Earth aboard Vostok 1 on April 12, 1961." },
  { question: "In what year did Apollo 11 land on the Moon?", choices: ["1969","1971","1968","1972"], correct: 0, explanation: "On July 20, 1969, Apollo 11's Eagle lander touched down in the Sea of Tranquility." },
  { question: "Who was the first man on the Moon?", choices: ["Neil Armstrong","Buzz Aldrin","Michael Collins","Yuri Gagarin"], correct: 0, explanation: "Neil Armstrong took his 'one small step' on July 20, 1969, followed by Buzz Aldrin." },
  { question: "What's the moon of Earth called?", choices: ["Luna / The Moon","Selene","Both names","Just Moon"], correct: 2, explanation: "Earth's only natural satellite is officially 'the Moon' (Latin: Luna; Greek: Selene)." },
  { question: "What's the Sun classified as?", choices: ["G-type main-sequence star","K star","O star","M star"], correct: 0, explanation: "The Sun is a G2V yellow dwarf — middle-aged at ~4.6 billion years, with another 5 billion to go." },
  { question: "What's a black hole?", choices: ["Region of spacetime where gravity prevents light escape","Empty space","Star","Planet"], correct: 0, explanation: "A black hole is a region where gravity is so strong that not even light can escape past its event horizon." },
  { question: "What's the biggest type of black hole?", choices: ["Supermassive","Stellar","Intermediate","Primordial"], correct: 0, explanation: "Supermassive black holes (millions to billions of solar masses) sit at the centres of most galaxies." },
  { question: "What was the Big Bang?", choices: ["Origin of the universe","Star explosion","Galaxy formation","Lunar event"], correct: 0, explanation: "The Big Bang theory describes the universe's expansion from an extremely hot, dense initial state ~13.8 billion years ago." },
  { question: "How old is the universe?", choices: ["~13.8 billion years","~6 billion years","~50 billion years","~4.5 billion years"], correct: 0, explanation: "Cosmic microwave background measurements peg the universe's age at 13.787 ± 0.020 billion years." },
  { question: "How old is Earth?", choices: ["~4.5 billion years","~13.8 billion","~1 billion","~10 million"], correct: 0, explanation: "Radiometric dating of meteorites and Earth rocks places Earth's formation at 4.54 billion years ago." },
  { question: "What is a supernova?", choices: ["Massive star explosion","Galaxy collision","Black hole","Nebula type"], correct: 0, explanation: "A supernova is the explosive death of a massive star, briefly outshining an entire galaxy." },
  { question: "What's a nebula?", choices: ["Cloud of gas/dust in space","Type of galaxy","Star","Planet"], correct: 0, explanation: "Nebulae are interstellar clouds of gas and dust — often the birthplaces of new stars." },
  { question: "What's the Hubble Space Telescope?", choices: ["Earth-orbiting space telescope","Ground telescope","Both","Future telescope"], correct: 0, explanation: "Launched in 1990, Hubble orbits Earth above the atmosphere, providing unprecedentedly sharp images." },
  { question: "What replaced Hubble for infrared imaging?", choices: ["James Webb Space Telescope","Spitzer","Both","Just Webb"], correct: 0, explanation: "James Webb Space Telescope (JWST), launched Dec 2021, observes infrared light to see the earliest galaxies." },
  { question: "What is dark matter?", choices: ["Non-luminous matter inferred from gravity","Black holes","Empty space","Just black"], correct: 0, explanation: "Dark matter doesn't emit light but its gravity shapes galaxies; it makes up ~27% of the universe." },
  { question: "What is dark energy?", choices: ["Energy causing accelerating expansion","Light","Black holes","Anti-matter"], correct: 0, explanation: "Dark energy is the mysterious force accelerating cosmic expansion — about 68% of the universe." },
  { question: "What's a comet's tail made of?", choices: ["Gas and dust","Just dust","Ice","Just gas"], correct: 0, explanation: "Comet tails are made of gas (ion tail) and dust, blown off by solar wind and radiation pressure." },
  { question: "What's the asteroid belt?", choices: ["Between Mars and Jupiter","Between Earth and Mars","Outside Pluto","Around Saturn"], correct: 0, explanation: "Located between Mars and Jupiter, the main asteroid belt holds millions of rocky objects, with Ceres the largest." },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AstronomyQuizSettings): AstronomyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AstronomyQuizState, action: AstronomyQuizAction): AstronomyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AstronomyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
