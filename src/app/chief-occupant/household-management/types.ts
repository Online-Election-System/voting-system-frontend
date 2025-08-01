// src/app/chief-occupant/household-management/types.ts
// types.ts
export interface HouseholdMember {
  memberId: string
  memberName: string
  fullName: string
  nic: string
  phoneNumber?: string
  email?: string
  civilStatus?: string
  status: string
  rejectionReason: string
  relationship: string
  relationshipWithChiefOccupant: string
  requestDate?: string
  isNewRequest?: boolean
  isUpdateRequest?: boolean
  updateDetails?: {
    newFullName?: string
    newPhoneNumber?: string
    newEmail?: string
    newCivilStatus?: string
  }
}

export interface ChiefOccupant {
  memberId: string
  fullName: string
  nic: string
  phoneNumber?: string
  email?: string
  civilStatus?: string
  status: string
  role: string
}