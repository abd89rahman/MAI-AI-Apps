export interface ArabicEnglishPair {
  arabic: string;
  english: string;
}

export interface QuranVerse {
  verse: string;
  surah: string;
  english: string;
}

export interface HadithNarration {
  hadith: string;
  source: string;
  english: string;
}

export interface ArabicPoem {
  poem: string;
  poet: string;
  english: string;
}

export interface VerbForm extends ArabicEnglishPair {
  formName: string;
}

export interface RootInfo {
  letters: string;
  explanation: string;
  derivedWords: ArabicEnglishPair[];
}

export interface DictionaryEntry {
  word: string;
  root?: RootInfo;
  meaning: ArabicEnglishPair;
  synonyms: ArabicEnglishPair[];
  antonyms: ArabicEnglishPair[];
  verbForms: VerbForm[];
  exampleSentences: ArabicEnglishPair[];
  quranVerses: QuranVerse[];
  hadithNarrations: HadithNarration[];
  poems: ArabicPoem[];
  pronunciationAudio?: string;
}