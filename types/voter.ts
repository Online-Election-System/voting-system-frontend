export interface VoterProfile {
  id: string
  name: string
  nameWithInitials: string
  address: string
  district: string
  pollingDivision: string
  age: number
  gender: string
  phone: string
  email: string
  photo: string
  status: "eligible" | "already-voted" | "ineligible"
  registrationDate: string
  votedAt?: string
  ineligibleReason?: string
}

export interface Candidate {
  id: number
  name: string
  nameEn: string
  symbol: string
  symbolName: string
}

export type Screen = "validation" | "voting" | "confirmation" | "success"
export type ValidationStatus = "idle" | "checking" | "found" | "not-found"
