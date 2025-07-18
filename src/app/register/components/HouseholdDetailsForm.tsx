import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HouseholdDetails } from "../types"

interface HouseholdDetailsFormProps {
  householdDetails: HouseholdDetails
  onChange: (field: keyof HouseholdDetails, value: string | number) => void
}

export function HouseholdDetailsForm({ householdDetails, onChange }: HouseholdDetailsFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Household Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="electoralDistrict">Electoral District</Label>
          <Input
            id="electoralDistrict"
            value={householdDetails.electoralDistrict}
            onChange={(e) => onChange("electoralDistrict", e.target.value)}
            placeholder="Enter electoral district"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pollingDivision">Polling Division</Label>
          <Input
            id="pollingDivision"
            value={householdDetails.pollingDivision}
            onChange={(e) => onChange("pollingDivision", e.target.value)}
            placeholder="Enter polling division"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pollingDistrictNumber">Polling District Number</Label>
          <Input
            id="pollingDistrictNumber"
            value={householdDetails.pollingDistrictNumber}
            onChange={(e) => onChange("pollingDistrictNumber", e.target.value)}
            placeholder="Enter polling district number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gramaNiladhariDivision">Grama Niladhari Division</Label>
          <Input
            id="gramaNiladhariDivision"
            value={householdDetails.gramaNiladhariDivision}
            onChange={(e) => onChange("gramaNiladhariDivision", e.target.value)}
            placeholder="Enter Grama Niladhari division"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="villageStreetEstate">Village/Street/Estate</Label>
          <Input
            id="villageStreetEstate"
            value={householdDetails.villageStreetEstate}
            onChange={(e) => onChange("villageStreetEstate", e.target.value)}
            placeholder="Enter village/street/estate"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="houseNumber">House Number</Label>
          <Input
            id="houseNumber"
            value={householdDetails.houseNumber}
            onChange={(e) => onChange("houseNumber", e.target.value)}
            placeholder="Enter house number"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfMembers">Number of Household Members (excluding Chief Occupant)</Label>
        <Input
          id="numberOfMembers"
          type="number"
          min="0"
          value={householdDetails.householdMemberCount}
          onChange={(e) => onChange("householdMemberCount", Number.parseInt(e.target.value) || 0)}
          placeholder="Enter number of household members"
          required
        />
      </div>
    </div>
  )
}
