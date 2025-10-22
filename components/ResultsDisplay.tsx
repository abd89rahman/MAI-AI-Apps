import React, { useRef, useState } from 'react';
import type { DictionaryEntry, ArabicEnglishPair, VerbForm } from '../types';
import { ResultCard } from './ResultCard';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

// Audio decoding utilities
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface ResultsDisplayProps {
  data: DictionaryEntry;
  bookmarks: string[];
  onToggleBookmark: (word: string) => void;
  onWordClick: (word: string) => void;
}

const PairedListItem: React.FC<{ item: ArabicEnglishPair }> = ({ item }) => (
  <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-slate-200 last:border-b-0">
    <p className="font-amiri text-xl text-slate-800" lang="ar" dir="rtl">{item.arabic}</p>
    <p className="text-slate-600 text-right sm:text-left">{item.english}</p>
  </li>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, bookmarks, onToggleBookmark, onWordClick }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isBookmarked = bookmarks.includes(data.word);

  const handlePlayPronunciation = async () => {
    if (!data.pronunciationAudio || isPlaying) return;

    setIsPlaying(true);
    
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const audioBuffer = await decodeAudioData(
            decode(data.pronunciationAudio),
            audioContext,
            24000,
            1,
        );

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setIsPlaying(false);
        };
        source.start();
    } catch (error) {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onToggleBookmark(data.word)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            <BookmarkIcon isBookmarked={isBookmarked} />
          </button>
          <h2 className="font-amiri text-5xl font-bold text-blue-700" lang="ar" dir="rtl">{data.word}</h2>
          {data.pronunciationAudio && (
            <button
              onClick={handlePlayPronunciation}
              disabled={isPlaying}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors disabled:text-slate-400 disabled:cursor-wait"
              aria-label="Play pronunciation"
            >
              <SpeakerIcon />
            </button>
          )}
        </div>
        <p className="mt-2 text-2xl text-slate-700">{data.meaning.english}</p>
      </div>

      {data.root && (
        <ResultCard title="Root Letters" arabicTitle="الجذر">
            <div className="text-center mb-4">
                <p className="font-amiri text-4xl tracking-[.2em]" lang="ar" dir="rtl">{data.root.letters}</p>
            </div>
            <p className="text-slate-600 mb-4 text-center">{data.root.explanation}</p>
            {data.root.derivedWords.length > 0 && (
                <div>
                    <h5 className="font-semibold text-slate-700 mb-2 text-center">Words from this root:</h5>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {data.root.derivedWords.map((word, index) => (
                            <button
                                key={index}
                                onClick={() => onWordClick(word.arabic)}
                                className="px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full font-amiri text-md transition-colors"
                                title={word.english}
                                lang="ar"
                                dir="rtl"
                            >
                                {word.arabic}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </ResultCard>
      )}

      {data.exampleSentences.length > 0 && (
        <ResultCard title="Example Sentences" arabicTitle="جمل سبيل المثال">
            <ul className="space-y-4">
            {data.exampleSentences.map((sentence, index) => (
                <li key={index} className="p-3 bg-slate-50 rounded-md">
                    <p className="font-amiri text-xl text-slate-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                    <p className="text-slate-600 italic">"{sentence.english}"</p>
                </li>
            ))}
            </ul>
        </ResultCard>
      )}

      {data.quranVerses.length > 0 && (
        <ResultCard title="Quranic Context" arabicTitle="سياق قرآني">
            <ul className="space-y-4">
            {data.quranVerses.map((item, index) => (
                <li key={index} className="p-3 bg-slate-50 rounded-md border-l-4 border-blue-200">
                    <p className="font-amiri text-xl text-slate-800 mb-2" lang="ar" dir="rtl">{item.verse}</p>
                    <p className="text-slate-600 italic mb-2">"{item.english}"</p>
                    <p className="text-sm text-slate-500 font-medium text-right">{item.surah}</p>
                </li>
            ))}
            </ul>
        </ResultCard>
      )}

      {data.hadithNarrations.length > 0 && (
        <ResultCard title="Hadith Context" arabicTitle="سياق حديثي">
            <ul className="space-y-4">
            {data.hadithNarrations.map((item, index) => (
                <li key={index} className="p-3 bg-slate-50 rounded-md border-l-4 border-green-200">
                    <p className="font-amiri text-xl text-slate-800 mb-2" lang="ar" dir="rtl">{item.hadith}</p>
                    <p className="text-slate-600 italic mb-2">"{item.english}"</p>
                    <p className="text-sm text-slate-500 font-medium text-right">{item.source}</p>
                </li>
            ))}
            </ul>
        </ResultCard>
      )}

      {data.poems && data.poems.length > 0 && (
        <ResultCard title="Poetic Context" arabicTitle="سياق شعري">
            <ul className="space-y-4">
            {data.poems.map((item, index) => (
                <li key={index} className="p-3 bg-slate-50 rounded-md border-l-4 border-purple-200">
                    <blockquote className="relative">
                        <p className="font-amiri text-xl text-slate-800 mb-2 text-center" lang="ar" dir="rtl">{item.poem}</p>
                        <p className="text-slate-600 italic text-center mb-2">"{item.english}"</p>
                    </blockquote>
                    <p className="text-sm text-slate-500 font-medium text-right mt-2">— {item.poet}</p>
                </li>
            ))}
            </ul>
        </ResultCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {data.synonyms.length > 0 && (
          <ResultCard title="Synonyms" arabicTitle="مرادفات">
            <ul>
              {data.synonyms.map((synonym, index) => (
                <PairedListItem key={index} item={synonym} />
              ))}
            </ul>
          </ResultCard>
        )}

        {data.antonyms.length > 0 && (
          <ResultCard title="Antonyms" arabicTitle="متضادات">
            <ul>
              {data.antonyms.map((antonym, index) => (
                <PairedListItem key={index} item={antonym} />
              ))}
            </ul>
          </ResultCard>
        )}
      </div>

      {data.verbForms.length > 0 && (
        <ResultCard title="Verb Forms" arabicTitle="صيغ الفعل">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="p-2 font-semibold text-slate-700">Form</th>
                  <th className="p-2 font-semibold text-slate-700 text-right">Arabic (صيغة)</th>
                  <th className="p-2 font-semibold text-slate-700">English</th>
                </tr>
              </thead>
              <tbody>
                {data.verbForms.map((form, index) => (
                  <tr key={index} className="border-b border-slate-200 last:border-b-0">
                    <td className="p-2 font-medium">{form.formName}</td>
                    <td className="p-2 font-amiri text-lg text-right" lang="ar" dir="rtl">{form.arabic}</td>
                    <td className="p-2 text-slate-600">{form.english}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultCard>
      )}
    </div>
  );
};

// Add fade-in animation to tailwind config if possible, or here as a style tag
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);