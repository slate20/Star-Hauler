
export interface Good {
  id: string; // Unique ID for the good item within a task's goods list
  productName: string;
  quantity: number;
}

export interface DestinationTask {
  id: string; // Unique ID for this specific task
  destination: string;
  goods: Good[];
  isComplete: boolean;
}

export interface ContractV2 {
  id: string; // Unique ID for the overall contract
  contractNumber: string; // User-friendly identifier for the contract
  description?: string; // Optional overall contract description
  reward: number; // Full reward value (e.g., 10000)
  destinationTasks: DestinationTask[];
}

// Types for the AddContractModal
export interface ModalGoodItem {
  productName: string;
  quantity: number;
}

export interface ModalDestinationEntry { // Represents a task being built in the modal
  destination: string;
  goods: ModalGoodItem[];
}

export interface NewContractFormData { // This is what onContractSubmit will receive from the modal
  contractNumber: string;
  rewardK: number; // Reward in thousands (K)
  destinationEntries: ModalDestinationEntry[];
}

// Types for Destinations Overview
export interface AggregatedGoodForDestination {
  productName: string;
  totalQuantity: number;
}

export interface DestinationOverview {
  destinationName: string;
  goods: AggregatedGoodForDestination[];
  // Store references to the original tasks to update them later
  contributingTaskRefs: Array<{ contractId: string; taskId: string }>;
}
