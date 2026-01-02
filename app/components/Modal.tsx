"use client";
import { X } from 'lucide-react';
import React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl shadow-[0_0_80px_rgba(139,92,246,0.2)] relative z-10 overflow-hidden animate-in zoom-in-95">
        <div className="p-7 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-black tracking-tight text-white uppercase">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><X size={24} /></button>
        </div>
        <div className="p-7 max-h-[75vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
