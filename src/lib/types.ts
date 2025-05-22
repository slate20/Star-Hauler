
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

export interface ModalDestinationEntry {
  destination: string;
  goods: ModalGoodItem[];
}

export interface NewContractFormData { // This is what onContractSubmit will receive from the modal
  destinationEntries: ModalDestinationEntry[];
}
