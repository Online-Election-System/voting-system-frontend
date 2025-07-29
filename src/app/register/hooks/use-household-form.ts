import { useState } from "react"
import { ChiefOccupant, HouseholdDetails, MemberInfo, FormStep } from "../types"

export const useHouseholdForm = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>("chief")
  const [chiefOccupant, setChiefOccupant] = useState<ChiefOccupant>({
    fullName: "",
    nic: "",
    dob: undefined,
    gender: "male",
    civilStatus: "single",
    phoneNumber: "",
    idCopyPath: null,
    email: "",
    passwordHash: ""
  })

  const [householdDetails, setHouseholdDetails] = useState<HouseholdDetails>({
    electoralDistrict: "",
    pollingDivision: "",
    pollingDistrictNumber: "",
    gramaNiladhariDivision: "",
    villageStreetEstate: "",
    houseNumber: "",
    householdMemberCount: 1,
  })

  const [householdMembers, setHouseholdMembers] = useState<MemberInfo[]>([])
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0)

  const handleChiefOccupantChange = (field: keyof ChiefOccupant, value: string | Date | undefined | File | null) => {
    setChiefOccupant({ ...chiefOccupant, [field]: value })
  }

  const handleHouseholdDetailsChange = (field: keyof HouseholdDetails, value: string | number) => {
    setHouseholdDetails({ ...householdDetails, [field]: value })
  }

  const handleMemberChange = (
    index: number,
    field: keyof MemberInfo,
    value: string | Date | boolean | undefined | File | null,
  ) => {
    const updatedMembers = [...householdMembers]
    if (!updatedMembers[index]) {
      updatedMembers[index] = {
        fullName: "",
        nic: "",
        dob: undefined,
        gender: "male",
        civilStatus: "single",
        relationshipWithChiefOccupant: "",
        idCopyPath: null,
        approvedByChief: true,
      }
    }
    updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    setHouseholdMembers(updatedMembers)
  }

  const initializeHouseholdMembers = () => {
    const members = []
    for (let i = 0; i < householdDetails.householdMemberCount; i++) {
      members.push({
        fullName: "",
        nic: "",
        dob: undefined,
        gender: "male",
        civilStatus: "single",
        relationshipWithChiefOccupant: "",
        idCopyPath: null,
        approvedByChief: true,
      })
    }
    setHouseholdMembers(members)
  }

  const nextStep = () => {
    if (currentStep === "chief") {
      setCurrentStep("household")
    } else if (currentStep === "household") {
      initializeHouseholdMembers()
      setCurrentStep("members")
    }
  }

  const prevStep = () => {
    if (currentStep === "household") {
      setCurrentStep("chief")
    } else if (currentStep === "members") {
      setCurrentStep("household")
    }
  }

  return {
    currentStep,
    chiefOccupant,
    householdDetails,
    householdMembers,
    currentMemberIndex,
    setCurrentMemberIndex,
    handleChiefOccupantChange: handleChiefOccupantChange,
    handleHouseholdDetailsChange,
    handleMemberChange,
    nextStep,
    prevStep,
  }
}
