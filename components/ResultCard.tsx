
import React from 'react';

interface ResultCardProps {
  title: string;
  arabicTitle: string;
  children: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, arabicTitle, children }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full">
      <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3 mb-4">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <h4 className="font-amiri text-2xl text-slate-600" lang="ar" dir="rtl">{arabicTitle}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
};
