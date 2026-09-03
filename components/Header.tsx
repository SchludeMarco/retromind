import React from 'react';

export const Header: React.FC = () => (
  <header className="py-8 text-center">
    <h1 className="text-5xl md:text-7xl font-bold text-retro-ink mb-2 tracking-tighter">RetroMind</h1>
    <p className="text-lg italic text-retro-brown">Deine Reise zurück in die Zeit</p>
    <div className="w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);
