import { Candidate } from "./candidate.types";

// export const INITIAL_CANDIDATES: Candidate[] = [
//   { id: 1, name: "John Smith", party: "Democratic Party" },
//   { id: 2, name: "Jane Doe", party: "Republican Party" },
//   { id: 3, name: "Robert Johnson", party: "Independent" },
//   { id: 4, name: "Sarah Williams", party: "Green Party" },
// ];

export const DIALOG_CONFIG = {
  TITLES: {
    ADD: "Add New Candidate",
    EDIT: "Edit Candidate"
  },
  DESCRIPTIONS: {
    ADD: "Fill in the details to add a new candidate.",
    EDIT: "Update the candidate information below."
  },
  BUTTONS: {
    ADD: "Add",
    EDIT: "Update",
    CANCEL: "Cancel"
  }
} as const;