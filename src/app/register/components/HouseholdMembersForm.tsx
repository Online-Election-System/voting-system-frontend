import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MemberInfo } from "../types"
import { CIVIL_STATUS_OPTIONS, GENDER_OPTIONS } from "../constants"

interface HouseholdMembersFormProps {
  householdMembers: MemberInfo[]
  currentMemberIndex: number
  householdMemberCount: number
  onChange: (index: number, field: keyof MemberInfo, value: any) => void
  onMemberIndexChange: (index: number) => void
}

export function HouseholdMembersForm({
  householdMembers,
  currentMemberIndex,
  householdMemberCount,
  onChange,
  onMemberIndexChange,
}: HouseholdMembersFormProps) {
  const renderMemberForm = (index: number) => (
    <div key={index} className="space-y-6 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Household Member {index + 1}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`fullName-${index}`}>Full Name</Label>
          <Input
            id={`fullName-${index}`}
            value={householdMembers[index]?.fullName || ""}
            onChange={(e) => onChange(index, "fullName", e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`nic-${index}`}>NIC Number</Label>
          <Input
            id={`nic-${index}`}
            value={householdMembers[index]?.nic || ""}
            onChange={(e) => onChange(index, "nic", e.target.value)}
            placeholder="Enter NIC number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !householdMembers[index]?.dob && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {householdMembers[index]?.dob ? (
                  format(householdMembers[index].dob, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={householdMembers[index]?.dob}
                onSelect={(date) => onChange(index, "dob", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={householdMembers[index]?.gender || "male"}
            onValueChange={(value) => onChange(index, "gender", value)}
          >
            {GENDER_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${option.value}-${index}`} />
                <Label htmlFor={`${option.value}-${index}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Civil Status</Label>
          <Select
            value={householdMembers[index]?.civilStatus || "single"}
            onValueChange={(value) => onChange(index, "civilStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select civil status" />
            </SelectTrigger>
            <SelectContent>
              {CIVIL_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`relationship-${index}`}>Relationship with Chief Occupant</Label>
          <Input
            id={`relationship-${index}`}
            value={householdMembers[index]?.relationshipWithChiefOccupant || ""}
            onChange={(e) => onChange(index, "relationshipWithChiefOccupant", e.target.value)}
            placeholder="E.g., Spouse, Child, Parent"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Chief Occupant Approval</Label>
        <RadioGroup
          value={householdMembers[index]?.approvedByChief ? "approved" : "not-approved"}
          onValueChange={(value) => onChange(index, "approvedByChief", value === "approved")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approved" id={`approval-${index}`} />
            <Label htmlFor={`approval-${index}`}>I approve this member's registration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not-approved" id={`not-approval-${index}`} />
            <Label htmlFor={`not-approval-${index}`}>I do not approve this member's registration</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Household Members Registration</h3>

      {householdMemberCount > 0 ? (
        <Tabs
          defaultValue="0"
          value={currentMemberIndex.toString()}
          onValueChange={(value) => onMemberIndexChange(Number.parseInt(value))}
        >
          <TabsList
            className="grid"
            style={{ gridTemplateColumns: `repeat(${Math.min(householdMemberCount, 5)}, 1fr)` }}
          >
            {Array.from({ length: householdMemberCount }).map((_, i) => (
              <TabsTrigger key={i} value={i.toString()}>
                Member {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {Array.from({ length: householdMemberCount }).map((_, i) => (
            <TabsContent key={i} value={i.toString()}>
              {renderMemberForm(i)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center p-4 border rounded-md">
          <p>No additional household members to register.</p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Please ensure all information is accurate. Document submission will be handled separately.
      </div>
    </div>
  )
}