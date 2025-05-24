import { Ship } from 'lucide-react';
import type React from 'react';

export const SpaceHaulerLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <img
        className="h-10 w-10"
        src="https://cdn-icons-png.flaticon.com/512/3902/3902021.png"
        alt="Space Hauler Icon"
        style={{ filter: 'hue-rotate(25deg) brightness(1) contrast(1) saturate(1)' }}
      />
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
        Star Hauler
      </h1>
    </div>
  );
};
