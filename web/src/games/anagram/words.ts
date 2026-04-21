// Words for Anagram game, grouped by length
export const ANAGRAM_WORDS: Record<number, string[]> = {
  5: [
    "apple","brain","chair","dance","eagle","fable","grade","heart","ivory","jewel",
    "karma","lemon","maple","nerve","ocean","pearl","queen","river","stone","tiger",
    "ultra","vapor","whale","xenon","youth","zebra","amber","blaze","crane","dingo",
    "ember","flute","grape","heron","index","joker","knife","llama","metro","ninja",
    "olive","petal","quail","radar","siren","thorn","viola","waltz","axiom","brave",
    "chair","flame","grand","haste","ideal","kneel","light","march","north","order",
    "phase","quest","ridge","shore","trace","uncle","vivid","wrath","extra","young",
    "blend","craft","draft","earth","feast","giant","harsh","image","light","might",
    "noise","paint","right","slave","train","upset","vault","watch","yield","zonal",
  ],
  6: [
    "bridge","castle","danger","empire","forest","garden","harbor","insect","jaguar","kernel",
    "lantern","mirror","narrow","oracle","parrot","quarry","reason","saturn","tunnel","uplift",
    "velvet","winter","yeoman","zephyr","anchor","basket","canopy","desert","falcon","goblin",
    "hamlet","icicle","junior","kimono","lagoon","magnet","noodle","oyster","patent","quiver",
    "rocket","spider","temple","vortex","walrus","yellow","zipper","bronze","cobweb","debate",
    "effect","flight","gloomy","hunter","indoor","jigsaw","knight","locket","meadow","nickel",
    "onward","pencil","rescue","shadow","theory","unlock","vacant","wonder","xyster","zigzag",
    "bitter","carpet","donkey","expect","finger","gravel","harbor","insane","jungle","kitten",
    "lizard","misery","nettle","outlet","pillow","riddle","silent","timbre","urgent","vessel",
  ],
  7: [
    "ancient","blanket","captain","dolphin","earldom","furnace","galleon","hammock","iceberg","janitor",
    "kingdom","lantern","mansion","network","obscure","passage","quarter","railway","soldier","texture",
    "uncover","vampire","warrior","example","younger","zoology","address","benefit","complex","deliver",
    "extract","fortune","genuine","history","inquiry","journey","kinship","license","monarch","notably",
    "operate","produce","qualify","reflect","service","tonight","unusual","venture","washing","exploit",
    "fantasy","granite","hunting","inspire","justice","kitchen","lantern","mastery","neutral","outlook",
    "phantom","reserve","science","triumph","upright","vantage","welfare","express","yielded","zealous",
  ],
};

export function pickWord(wordLength: number, rng: () => number): string {
  const words = ANAGRAM_WORDS[wordLength] ?? ANAGRAM_WORDS[6]!;
  return words[Math.floor(rng() * words.length)]!.toUpperCase();
}

export function scramble(word: string, rng: () => number): string {
  const arr = word.split("");
  // Fisher-Yates shuffle, retry if same as original
  for (let tries = 0; tries < 10; tries++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    if (arr.join("") !== word) break;
  }
  return arr.join("");
}

export function sameLetters(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const count: Record<string, number> = {};
  for (const ch of a) count[ch] = (count[ch] ?? 0) + 1;
  for (const ch of b) count[ch] = (count[ch] ?? 0) - 1;
  return Object.values(count).every((v) => v === 0);
}
