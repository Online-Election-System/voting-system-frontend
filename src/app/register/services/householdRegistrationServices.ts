import { ChiefOccupant, HouseholdDetails, MemberInfo } from "../types";

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
      passwordHash: password, // Backend will hash this
      idCopyPath: null // Temporarily removed
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
        idCopyPath: null // Temporarily removed
      })),
    },
  };

  console.log("Final payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      "http://localhost:8080/voter-registration/api/v1/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("Error response:", errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error("Error text:", errorText);
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success response:", result);
    return result;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};