import { Ship } from 'lucide-react';
import type React from 'react';

export const SpaceHaulerLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <Ship className="h-10 w-10 text-primary" aria-hidden="true" />
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
        Star Hauler
      </h1>
    </div>
  );
};
