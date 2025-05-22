
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

// Data structure for the form input
export interface ContractItemData {
  destination: string;
  productName: string;
  quantity: number;
}

// State for the form action
export type ContractFormState = {
  message?: string;
  errors?: {
    destination?: string[];
    productName?: string[];
    quantity?: string[];
    _form?: string[];
  };
  success: boolean;
  item?: ContractItemData; // The item that was processed
} | null;
