import { ChiefOccupant, HouseholdDetails, MemberInfo } from "../types";
import api from "../../../lib/axios";
import { PhoneOutgoing } from "lucide-react";

export const submitHouseholdRegistration = async (
  chiefOccupant: ChiefOccupant,
  householdDetails: HouseholdDetails,
  householdMembers: MemberInfo[],
  password: string
) => {
  console.log("Submitting registration data:", {
    chiefOccupant,
    householdDetails,
    householdMembers,
    password: "***"
  });

  const payload = {
    chiefOccupant: {
      fullName: chiefOccupant.fullName,
      nic: chiefOccupant.nic,
      phoneNumber: chiefOccupant.phoneNumber,
      dob: chiefOccupant.dob?.toISOString().split('T')[0], // Format as YYYY-MM-DD
      gender: chiefOccupant.gender,
      civilStatus: chiefOccupant.civilStatus,
      email: chiefOccupant.email,
      passwordHash: password,
      photoCopyPath: chiefOccupant.photoCopyPath,
      idCopyPath: chiefOccupant.idCopyPath
    },
    householdDetails: {
      electoralDistrict: householdDetails.electoralDistrict,
      pollingDivision: householdDetails.pollingDivision,
      pollingDistrictNumber: householdDetails.pollingDistrictNumber,
      gramaNiladhariDivision: householdDetails.gramaNiladhariDivision,
      villageStreetEstate: householdDetails.villageStreetEstate,
      houseNumber: householdDetails.houseNumber,
      householdMemberCount: householdDetails.householdMemberCount,
    },
    newHouseholdMembers: {
      members: householdMembers.slice(0, householdDetails.householdMemberCount).map((member) => ({
        fullName: member.fullName,
        nic: member.nic,
        dob: member.dob?.toISOString().split('T')[0], // Format as YYYY-MM-DD
        gender: member.gender,
        civilStatus: member.civilStatus,
        relationshipWithChiefOccupant: member.relationshipWithChiefOccupant,
        approvedByChief: member.approvedByChief,
        photoCopyPath: member.photoCopyPath,
        idCopyPath: member.idCopyPath
      })),
    },
  };

  console.log("Final payload:", JSON.stringify(payload, null, 2));

  try {
    const { data } = await api.post("/voter-registration/api/v1/register", payload);
    console.log("Success response:", data);
    return data;
  } catch (error: any) {
    console.error("Registration error:", error);
    const message = error.response?.data?.message ?? error.message;
    throw new Error(message);
  }
};
