import { submitHouseholdRegistration } from "@/app/register/services/householdRegistrationServices";
import api from "@/lib/axios";

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(() => Promise.resolve({ data: { ok: true } })),
  },
}));

describe("registration service", () => {
  it("formats payload and posts to backend", async () => {
    const chief = { 
      fullName: "Chief", 
      nic: "nic", 
      phoneNumber: "123", 
      dob: new Date("2000-01-01"), 
      gender: "M", 
      civilStatus: "S", 
      email: "a@b.com" 
    } as any;
    
    const householdDetails = { 
      electoralDistrict: "ED", 
      pollingDivision: "PD", 
      pollingDistrictNumber: "1", 
      gramaNiladhariDivision: "GND", 
      villageStreetEstate: "V", 
      houseNumber: "10", 
      householdMemberCount: 1 
    } as any;
    
    const members = [{ 
      fullName: "Mem", 
      nic: "n2", 
      dob: new Date("2002-02-02"), 
      gender: "F", 
      civilStatus: "S", 
      relationshipWithChiefOccupant: "Child", 
      approvedByChief: true 
    }] as any;

    await submitHouseholdRegistration(chief, householdDetails, members, "pw");

    expect(api.post).toHaveBeenCalledWith(
      "/voter-registration/api/v1/register",
      expect.objectContaining({ chiefOccupant: expect.any(Object) })
    );
  });
});