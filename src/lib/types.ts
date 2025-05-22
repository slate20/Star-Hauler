
export interface Good {
  id: string; // Unique ID for the good item within a contract's goods list
  productName: string;
  quantity: number;
}

export interface Contract {
  id: string; // Unique ID for the contract (destination)
  destination: string;
  goods: Good[];
}

// Data structure for the old form input (still used by handleContractItemAdded)
export interface ContractItemData {
  destination: string;
  productName: string;
  quantity: number;
}

// Types for the new AddContractModal
export interface ModalGoodItem {
  productName: string;
  quantity: number;
}

export interface NewContractFormData {
  destination: string;
  goods: ModalGoodItem[];
}

// State for the old form action (will be removed)
// export type ContractFormState = {
//   message?: string;
//   errors?: {
//     destination?: string[];
//     productName?: string[];
//     quantity?: string[];
//     _form?: string[];
//   };
//   success: boolean;
//   item?: ContractItemData; // The item that was processed
// } | null;
