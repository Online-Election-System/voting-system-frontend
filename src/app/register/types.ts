export type MemberInfo = {
  fullName: string
  nic: string
  dob: Date | undefined
  gender: string
  civilStatus: string
  relationshipWithChiefOccupant: string
  idCopyPath: string | null
  approvedByChief: boolean
}

export type ChiefOccupant = {
  fullName: string
  nic: string
  dob: Date | undefined
  gender: string
  civilStatus: string
  phoneNumber: string
  idCopyPath: string | null
  email: string
  passwordHash: string
}

export type HouseholdDetails = {
  electoralDistrict: string
  pollingDivision: string
  pollingDistrictNumber: string
  gramaNiladhariDivision: string
  villageStreetEstate: string
  houseNumber: string
  householdMemberCount: number
}

export type AddMemberRequest = {
  addRequestId: string
  chiefOccupantId: string
  nicNumber: string
  fullName: string
  dateOfBirth: Date
  gender: string
  civilStatus: string
  relationshipToChief: string
  chiefOccupantApproval: 'pending' | 'approved' | 'rejected'
  requestStatus: 'pending' | 'processed' | 'cancelled'
  nicOrBirthCertificatePath?: string | null
}

export type FormStep = "chief" | "household" | "members" |"addmember"
