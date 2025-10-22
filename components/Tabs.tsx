import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';

interface TabsProps {
    history: string[];
    bookmarks: string[];
    onWordClick: (word: string) => void;
    onClearHistory: () => void;
    onRemoveBookmark: (word: string) => void;
}

type ActiveTab = 'history' | 'bookmarks';

export const Tabs: React.FC<TabsProps> = ({ history, bookmarks, onWordClick, onClearHistory, onRemoveBookmark }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('history');

    const renderList = (words: string[], isBookmarkList: boolean) => {
        if (words.length === 0) {
            return <p className="text-slate-500 text-sm text-center italic py-4">No words here yet.</p>;
        }
        return (
            <div className="flex flex-wrap gap-2 p-4 justify-center">
                {words.map((word) => (
                    <div key={word} className="flex items-center bg-slate-200 rounded-full">
                         <button
                            onClick={() => onWordClick(word)}
                            className="px-3 py-1 text-slate-700 hover:bg-slate-300 rounded-l-full font-amiri text-md transition-colors"
                            lang="ar"
                            dir="rtl"
                        >
                            {word}
                        </button>
                        {isBookmarkList && (
                             <button
                                onClick={() => onRemoveBookmark(word)}
                                className="p-2 text-slate-500 hover:bg-slate-300 hover:text-red-600 rounded-r-full"
                                aria-label={`Remove ${word} from bookmarks`}
                            >
                                <XIcon />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };


    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex border-b border-slate-200">
                <TabButton title="History" count={history.length} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                <TabButton title="Bookmarks" count={bookmarks.length} isActive={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} />
            </div>
            <div>
                {activeTab === 'history' && (
                    <>
                        {history.length > 0 && (
                            <div className="text-right p-2 border-b border-slate-200">
                                <button onClick={onClearHistory} className="text-sm text-blue-600 hover:underline">
                                    Clear History
                                </button>
                            </div>
                        )}
                        {renderList(history, false)}
                    </>
                )}
                {activeTab === 'bookmarks' && renderList(bookmarks, true)}
            </div>
        </div>
    );
};

interface TabButtonProps {
    title: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 p-3 text-center font-semibold transition-colors ${
            isActive
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-500 hover:bg-slate-100'
        }`}
    >
        {title} <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 ml-1">{count}</span>
    </button>
);