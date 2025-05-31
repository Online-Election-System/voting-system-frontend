"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, X, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type MemberInfo = {
  fullName: string
  nic: string
  dateOfBirth: Date | undefined
  gender: string
  civilStatus: string
  relationshipWithChief: string
  idCopy: File | null
  chiefApproval: string
}

type ChiefOccupant = {
  fullName: string
  nic: string
  dateOfBirth: Date | undefined
  gender: string
  civilStatus: string
  telephone: string
  idCopy: File | null
}

type HouseholdDetails = {
  electoralDistrict: string
  pollingDivision: string
  pollingDistrictNumber: string
  gramaNiladhariDivision: string
  villageStreetEstate: string
  houseNumber: string
  numberOfMembers: number
}

type ValidationErrors = {
  [key: string]: string
}

export default function HouseholdRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<"chief" | "household" | "members">("chief")
  const [chiefOccupant, setChiefOccupant] = useState<ChiefOccupant>({
    fullName: "",
    nic: "",
    dateOfBirth: undefined,
    gender: "male",
    civilStatus: "single",
    telephone: "",
    idCopy: null,
  })

  const [householdDetails, setHouseholdDetails] = useState<HouseholdDetails>({
    electoralDistrict: "",
    pollingDivision: "",
    pollingDistrictNumber: "",
    gramaNiladhariDivision: "",
    villageStreetEstate: "",
    houseNumber: "",
    numberOfMembers: 1,
  })

  const [householdMembers, setHouseholdMembers] = useState<MemberInfo[]>([])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Get today's date for calendar restriction
  const today = new Date()

  const handleChiefOccupantChange = (field: keyof ChiefOccupant, value: string | Date | undefined | File | null) => {
    setChiefOccupant({ ...chiefOccupant, [field]: value })
    // Clear validation error when user starts typing
    if (validationErrors[`chief_${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`chief_${field}`]
        return newErrors
      })
    }
  }

  const handleHouseholdDetailsChange = (field: keyof HouseholdDetails, value: string | number) => {
    setHouseholdDetails({ ...householdDetails, [field]: value })
    // Clear validation error when user starts typing
    if (validationErrors[`household_${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`household_${field}`]
        return newErrors
      })
    }
  }

  const handleMemberChange = (
    index: number,
    field: keyof MemberInfo,
    value: string | Date | undefined | File | null,
  ) => {
    const updatedMembers = [...householdMembers]
    if (!updatedMembers[index]) {
      updatedMembers[index] = {
        fullName: "",
        nic: "",
        dateOfBirth: undefined,
        gender: "male",
        civilStatus: "single",
        relationshipWithChief: "",
        idCopy: null,
        chiefApproval: "approved",
      }
    }
    updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    setHouseholdMembers(updatedMembers)
    // Clear validation error when user starts typing
    if (validationErrors[`member_${index}_${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`member_${index}_${field}`]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isChief: boolean, memberIndex?: number) => {
    if (e.target.files && e.target.files[0]) {
      if (isChief) {
        handleChiefOccupantChange("idCopy", e.target.files[0])
      } else if (memberIndex !== undefined) {
        handleMemberChange(memberIndex, "idCopy", e.target.files[0])
      }
    }
  }

  const removeFile = (isChief: boolean, memberIndex?: number) => {
    if (isChief) {
      handleChiefOccupantChange("idCopy", null)
    } else if (memberIndex !== undefined) {
      handleMemberChange(memberIndex, "idCopy", null)
    }
  }

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!regex.test(pass)) {
      setPasswordError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      )
      return false
    } else {
      setPasswordError("")
      return true
    }
  }

  const validateNIC = (nic: string) => {
    // Basic NIC validation - adjust pattern based on your country's format
    const nicPattern = /^[0-9]{9}[vVxX]$|^[0-9]{12}$/
    return nicPattern.test(nic)
  }

  const validatePhone = (phone: string) => {
    // Basic phone validation - adjust pattern based on your requirements
    const phonePattern = /^[0-9]{10}$/
    return phonePattern.test(phone.replace(/\s+/g, ""))
  }

  const validateChiefOccupant = () => {
    const errors: ValidationErrors = {}

    if (!chiefOccupant.fullName.trim()) {
      errors.chief_fullName = "Full name is required"
    }

    if (!chiefOccupant.nic.trim()) {
      errors.chief_nic = "NIC number is required"
    } else if (!validateNIC(chiefOccupant.nic)) {
      errors.chief_nic = "Please enter a valid NIC number"
    }

    if (!chiefOccupant.telephone.trim()) {
      errors.chief_telephone = "Telephone number is required"
    } else if (!validatePhone(chiefOccupant.telephone)) {
      errors.chief_telephone = "Please enter a valid 10-digit phone number"
    }

    if (!chiefOccupant.dateOfBirth) {
      errors.chief_dateOfBirth = "Date of birth is required"
    }

    if (!chiefOccupant.idCopy) {
      errors.chief_idCopy = "ID copy is required"
    }

    if (!password.trim()) {
      errors.chief_password = "Password is required"
    } else if (!validatePassword(password)) {
      errors.chief_password = passwordError
    }

    if (!confirmPassword.trim()) {
      errors.chief_confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.chief_confirmPassword = "Passwords do not match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateHouseholdDetails = () => {
    const errors: ValidationErrors = {}

    if (!householdDetails.electoralDistrict.trim()) {
      errors.household_electoralDistrict = "Electoral district is required"
    }

    if (!householdDetails.pollingDivision.trim()) {
      errors.household_pollingDivision = "Polling division is required"
    }

    if (!householdDetails.pollingDistrictNumber.trim()) {
      errors.household_pollingDistrictNumber = "Polling district number is required"
    }

    if (!householdDetails.gramaNiladhariDivision.trim()) {
      errors.household_gramaNiladhariDivision = "Grama Niladhari division is required"
    }

    if (!householdDetails.villageStreetEstate.trim()) {
      errors.household_villageStreetEstate = "Village/Street/Estate is required"
    }

    if (!householdDetails.houseNumber.trim()) {
      errors.household_houseNumber = "House number is required"
    }

    if (householdDetails.numberOfMembers < 0) {
      errors.household_numberOfMembers = "Number of members cannot be negative"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateHouseholdMembers = () => {
    const errors: ValidationErrors = {}

    householdMembers.forEach((member, index) => {
      if (!member.fullName.trim()) {
        errors[`member_${index}_fullName`] = "Full name is required"
      }

      if (!member.nic.trim()) {
        errors[`member_${index}_nic`] = "NIC number is required"
      } else if (!validateNIC(member.nic)) {
        errors[`member_${index}_nic`] = "Please enter a valid NIC number"
      }

      if (!member.dateOfBirth) {
        errors[`member_${index}_dateOfBirth`] = "Date of birth is required"
      }

      if (!member.relationshipWithChief.trim()) {
        errors[`member_${index}_relationshipWithChief`] = "Relationship with chief occupant is required"
      }

      if (!member.idCopy) {
        errors[`member_${index}_idCopy`] = "ID copy is required"
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const initializeHouseholdMembers = () => {
    const members = []
    for (let i = 0; i < householdDetails.numberOfMembers; i++) {
      members.push({
        fullName: "",
        nic: "",
        dateOfBirth: undefined,
        gender: "male",
        civilStatus: "single",
        relationshipWithChief: "",
        idCopy: null,
        chiefApproval: "approved",
      })
    }
    setHouseholdMembers(members)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateHouseholdMembers()) {
      console.log("Form submitted", { chiefOccupant, householdDetails, householdMembers })
      alert("Registration submitted successfully!")
    }
  }

  const nextStep = () => {
    if (currentStep === "chief" && validateChiefOccupant()) {
      setCurrentStep("household")
    } else if (currentStep === "household" && validateHouseholdDetails()) {
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

  // Custom date picker with year/month selection
  const CustomDatePicker = ({
    selected,
    onSelect,
    placeholder = "Pick a date",
    error,
  }: {
    selected: Date | undefined
    onSelect: (date: Date | undefined) => void
    placeholder?: string
    error?: string
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return (
      <div className="space-y-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selected && "text-muted-foreground",
                error && "border-red-500",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div className="flex gap-2">
                <Select
                  value={selected ? selected.getFullYear().toString() : ""}
                  onValueChange={(year) => {
                    const newDate = new Date(selected || new Date())
                    newDate.setFullYear(Number.parseInt(year))
                    if (newDate <= today) {
                      onSelect(newDate)
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selected ? selected.getMonth().toString() : ""}
                  onValueChange={(month) => {
                    const newDate = new Date(selected || new Date())
                    newDate.setMonth(Number.parseInt(month))
                    if (newDate <= today) {
                      onSelect(newDate)
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (date && date <= today) {
                    onSelect(date)
                    setIsOpen(false)
                  }
                }}
                disabled={(date) => date > today}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  const renderChiefOccupantForm = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Chief Occupant Registration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chiefFullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="chiefFullName"
            value={chiefOccupant.fullName}
            onChange={(e) => handleChiefOccupantChange("fullName", e.target.value)}
            placeholder="Enter full name"
            className={validationErrors.chief_fullName ? "border-red-500" : ""}
            required
          />
          {validationErrors.chief_fullName && <p className="text-sm text-red-500">{validationErrors.chief_fullName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="chiefNic">
            NIC Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="chiefNic"
            value={chiefOccupant.nic}
            onChange={(e) => handleChiefOccupantChange("nic", e.target.value)}
            placeholder="Enter NIC number"
            className={validationErrors.chief_nic ? "border-red-500" : ""}
            required
          />
          {validationErrors.chief_nic && <p className="text-sm text-red-500">{validationErrors.chief_nic}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="chiefTelephone">
            Telephone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="chiefTelephone"
            value={chiefOccupant.telephone}
            onChange={(e) => handleChiefOccupantChange("telephone", e.target.value)}
            placeholder="Enter telephone number"
            className={validationErrors.chief_telephone ? "border-red-500" : ""}
            required
          />
          {validationErrors.chief_telephone && (
            <p className="text-sm text-red-500">{validationErrors.chief_telephone}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <CustomDatePicker
            selected={chiefOccupant.dateOfBirth}
            onSelect={(date) => handleChiefOccupantChange("dateOfBirth", date)}
            error={validationErrors.chief_dateOfBirth}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={chiefOccupant.gender}
            onValueChange={(value) => handleChiefOccupantChange("gender", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="chiefMale" />
              <Label htmlFor="chiefMale">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="chiefFemale" />
              <Label htmlFor="chiefFemale">Female</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>
            Civil Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={chiefOccupant.civilStatus}
            onValueChange={(value) => handleChiefOccupantChange("civilStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select civil status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chiefIdCopy">
          ID Copy <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id="chiefIdCopy"
              type="file"
              accept="image/*,.pdf"
              className={cn(
                "cursor-pointer",
                chiefOccupant.idCopy && "text-transparent",
                validationErrors.chief_idCopy && "border-red-500",
              )}
              onChange={(e) => handleFileChange(e, true)}
            />
            {chiefOccupant.idCopy && (
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className="text-sm text-gray-500 truncate">{chiefOccupant.idCopy.name}</span>
              </div>
            )}
          </div>
          {chiefOccupant.idCopy && (
            <Button type="button" variant="outline" size="icon" onClick={() => removeFile(true)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {validationErrors.chief_idCopy && <p className="text-sm text-red-500">{validationErrors.chief_idCopy}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Password Information</h3>
        <div className="space-y-2">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                validatePassword(e.target.value)
              }}
              placeholder="Enter password"
              className={cn("pr-10", validationErrors.chief_password && "border-red-500")}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
          {(passwordError || validationErrors.chief_password) && (
            <p className="text-sm text-red-500">{passwordError || validationErrors.chief_password}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={cn("pr-10", validationErrors.chief_confirmPassword && "border-red-500")}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
          {validationErrors.chief_confirmPassword && (
            <p className="text-sm text-red-500">{validationErrors.chief_confirmPassword}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderHouseholdDetailsForm = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Household Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="electoralDistrict">
            Electoral District <span className="text-red-500">*</span>
          </Label>
          <Input
            id="electoralDistrict"
            value={householdDetails.electoralDistrict}
            onChange={(e) => handleHouseholdDetailsChange("electoralDistrict", e.target.value)}
            placeholder="Enter electoral district"
            className={validationErrors.household_electoralDistrict ? "border-red-500" : ""}
            required
          />
          {validationErrors.household_electoralDistrict && (
            <p className="text-sm text-red-500">{validationErrors.household_electoralDistrict}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pollingDivision">
            Polling Division <span className="text-red-500">*</span>
          </Label>
          <Input
            id="pollingDivision"
            value={householdDetails.pollingDivision}
            onChange={(e) => handleHouseholdDetailsChange("pollingDivision", e.target.value)}
            placeholder="Enter polling division"
            className={validationErrors.household_pollingDivision ? "border-red-500" : ""}
            required
          />
          {validationErrors.household_pollingDivision && (
            <p className="text-sm text-red-500">{validationErrors.household_pollingDivision}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pollingDistrictNumber">
            Polling District Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="pollingDistrictNumber"
            value={householdDetails.pollingDistrictNumber}
            onChange={(e) => handleHouseholdDetailsChange("pollingDistrictNumber", e.target.value)}
            placeholder="Enter polling district number"
            className={validationErrors.household_pollingDistrictNumber ? "border-red-500" : ""}
            required
          />
          {validationErrors.household_pollingDistrictNumber && (
            <p className="text-sm text-red-500">{validationErrors.household_pollingDistrictNumber}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gramaNiladhariDivision">
            Grama Niladhari Division <span className="text-red-500">*</span>
          </Label>
          <Input
            id="gramaNiladhariDivision"
            value={householdDetails.gramaNiladhariDivision}
            onChange={(e) => handleHouseholdDetailsChange("gramaNiladhariDivision", e.target.value)}
            placeholder="Enter Grama Niladhari division"
            className={validationErrors.household_gramaNiladhariDivision ? "border-red-500" : ""}
            required
          />
          {validationErrors.household_gramaNiladhariDivision && (
            <p className="text-sm text-red-500">{validationErrors.household_gramaNiladhariDivision}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="villageStreetEstate">
            Village/Street/Estate <span className="text-red-500">*</span>
          </Label>
          <Input
            id="villageStreetEstate"
            value={householdDetails.villageStreetEstate}
            onChange={(e) => handleHouseholdDetailsChange("villageStreetEstate", e.target.value)}
            placeholder="Enter village/street/estate"
            className={validationErrors.household_villageStreetEstate ? "border-red-500" : ""}
            required
          />
          {validationErrors.household_villageStreetEstate && (
            <p className="text-sm text-red-500">{validationErrors.household_villageStreetEstate}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="houseNumber">
            House Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="houseNumber"
            value={householdDetails.houseNumber}
            onChange={(e) => handleHouseholdDetailsChange("houseNumber", e.target.value)}
            placeholder="Enter house number"
            className={validationErrors.household_houseNumber ? "border-red-500" : ""}
            required
          />
          {validationErrors.household_houseNumber && (
            <p className="text-sm text-red-500">{validationErrors.household_houseNumber}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfMembers">
          Number of Household Members (excluding Chief Occupant) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="numberOfMembers"
          type="number"
          min="0"
          value={householdDetails.numberOfMembers}
          onChange={(e) => handleHouseholdDetailsChange("numberOfMembers", Number.parseInt(e.target.value) || 0)}
          placeholder="Enter number of household members"
          className={validationErrors.household_numberOfMembers ? "border-red-500" : ""}
          required
        />
        {validationErrors.household_numberOfMembers && (
          <p className="text-sm text-red-500">{validationErrors.household_numberOfMembers}</p>
        )}
      </div>
    </div>
  )

  const renderMemberForm = (index: number) => (
    <div key={index} className="space-y-6 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Household Member {index + 1}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`fullName-${index}`}>
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`fullName-${index}`}
            value={householdMembers[index]?.fullName || ""}
            onChange={(e) => handleMemberChange(index, "fullName", e.target.value)}
            placeholder="Enter full name"
            className={validationErrors[`member_${index}_fullName`] ? "border-red-500" : ""}
            required
          />
          {validationErrors[`member_${index}_fullName`] && (
            <p className="text-sm text-red-500">{validationErrors[`member_${index}_fullName`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`nic-${index}`}>
            NIC Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`nic-${index}`}
            value={householdMembers[index]?.nic || ""}
            onChange={(e) => handleMemberChange(index, "nic", e.target.value)}
            placeholder="Enter NIC number"
            className={validationErrors[`member_${index}_nic`] ? "border-red-500" : ""}
            required
          />
          {validationErrors[`member_${index}_nic`] && (
            <p className="text-sm text-red-500">{validationErrors[`member_${index}_nic`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <CustomDatePicker
            selected={householdMembers[index]?.dateOfBirth}
            onSelect={(date) => handleMemberChange(index, "dateOfBirth", date)}
            error={validationErrors[`member_${index}_dateOfBirth`]}
          />
        </div>
        <div className="space-y-2">
          <Label>
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={householdMembers[index]?.gender || "male"}
            onValueChange={(value) => handleMemberChange(index, "gender", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id={`male-${index}`} />
              <Label htmlFor={`male-${index}`}>Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id={`female-${index}`} />
              <Label htmlFor={`female-${index}`}>Female</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Civil Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={householdMembers[index]?.civilStatus || "single"}
            onValueChange={(value) => handleMemberChange(index, "civilStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select civil status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`relationship-${index}`}>
            Relationship with Chief Occupant <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`relationship-${index}`}
            value={householdMembers[index]?.relationshipWithChief || ""}
            onChange={(e) => handleMemberChange(index, "relationshipWithChief", e.target.value)}
            placeholder="E.g., Spouse, Child, Parent"
            className={validationErrors[`member_${index}_relationshipWithChief`] ? "border-red-500" : ""}
            required
          />
          {validationErrors[`member_${index}_relationshipWithChief`] && (
            <p className="text-sm text-red-500">{validationErrors[`member_${index}_relationshipWithChief`]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`idCopy-${index}`}>
          ID Copy <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id={`idCopy-${index}`}
              type="file"
              accept="image/*,.pdf"
              className={cn(
                "cursor-pointer",
                householdMembers[index]?.idCopy && "text-transparent",
                validationErrors[`member_${index}_idCopy`] && "border-red-500",
              )}
              onChange={(e) => handleFileChange(e, false, index)}
            />
            {householdMembers[index]?.idCopy && (
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className="text-sm text-gray-500 truncate">{householdMembers[index].idCopy.name}</span>
              </div>
            )}
          </div>
          {householdMembers[index]?.idCopy && (
            <Button type="button" variant="outline" size="icon" onClick={() => removeFile(false, index)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {validationErrors[`member_${index}_idCopy`] && (
          <p className="text-sm text-red-500">{validationErrors[`member_${index}_idCopy`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Chief Occupant Approval <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          defaultValue="approved"
          onValueChange={(value) => handleMemberChange(index, "chiefApproval", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approved" id={`approval-${index}`} />
            <Label htmlFor={`approval-${index}`}>I approve this member registration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not-approved" id={`not-approval-${index}`} />
            <Label htmlFor={`not-approval-${index}`}>I do not approve this member registration</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )

  const renderMembersForm = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Household Members Registration</h3>

      {householdDetails.numberOfMembers > 0 ? (
        <Tabs
          defaultValue="0"
          value={currentMemberIndex.toString()}
          onValueChange={(value) => setCurrentMemberIndex(Number.parseInt(value))}
        >
          <TabsList
            className="grid"
            style={{ gridTemplateColumns: `repeat(${Math.min(householdDetails.numberOfMembers, 5)}, 1fr)` }}
          >
            {Array.from({ length: householdDetails.numberOfMembers }).map((_, i) => (
              <TabsTrigger key={i} value={i.toString()}>
                Member {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {Array.from({ length: householdDetails.numberOfMembers }).map((_, i) => (
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
        <span className="text-red-500">*</span> Required fields. Please ensure all information is accurate and ID copies
        are clear and legible.
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-black mx-auto">Electoral Registration</CardTitle>
          <CardDescription className="mx-auto">Register your household for the election</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "chief" && renderChiefOccupantForm()}
          {currentStep === "household" && renderHouseholdDetailsForm()}
          {currentStep === "members" && renderMembersForm()}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep !== "chief" && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
          {currentStep !== "members" ? (
            <Button type="button" className={currentStep === "chief" ? "ml-auto" : ""} onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto">
              Submit Registration
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
