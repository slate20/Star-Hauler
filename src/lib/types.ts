export interface HaulingRun {
  id: string;
  destination: string;
  cargo: string;
  scu: number; // Standard Cargo Unit
  date: string; // ISO Date string
}

export type HaulingRunFormState = {
  message?: string;
  errors?: {
    destination?: string[];
    cargo?: string[];
    scu?: string[];
    _form?: string[];
  };
  success: boolean;
  run?: HaulingRun;
} | null;
