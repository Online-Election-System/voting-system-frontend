import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChiefOccupant } from "../types";
import { CIVIL_STATUS_OPTIONS, GENDER_OPTIONS } from "../constants";
import { validatePassword } from "../utils/password-validation-util";

interface ChiefOccupantFormProps {
  chiefOccupant: ChiefOccupant;
  onChange: (field: keyof ChiefOccupant, value: any) => void;
  password: string;
  confirmPassword: string;
  passwordError: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export function ChiefOccupantForm({
  chiefOccupant,
  onChange,
  password,
  confirmPassword,
  passwordError,
  onPasswordChange,
  onConfirmPasswordChange,
}: ChiefOccupantFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Chief Occupant Registration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chiefFullName">Full Name</Label>
          <Input
            id="chiefFullName"
            value={chiefOccupant.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chiefNic">NIC Number</Label>
          <Input
            id="chiefNic"
            value={chiefOccupant.nic}
            onChange={(e) => onChange("nic", e.target.value)}
            placeholder="Enter NIC number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chiefTelephone">Telephone Number</Label>
          <Input
            id="chiefTelephone"
            value={chiefOccupant.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            placeholder="Enter telephone number"
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
                  !chiefOccupant.dob && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {chiefOccupant.dob ? (
                  format(chiefOccupant.dob, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={chiefOccupant.dob}
                onSelect={(date) => onChange("dob", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={chiefOccupant.gender}
            onValueChange={(value) => onChange("gender", value)}
          >
            {GENDER_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`chief-${option.value}`}
                />
                <Label htmlFor={`chief-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Civil Status</Label>
          <Select
            value={chiefOccupant.civilStatus}
            onValueChange={(value) => onChange("civilStatus", value)}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="chiefEmail">Email Address</Label>
        <Input
          id="chiefEmail"
          type="email"
          value={chiefOccupant.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Password Information</h3>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              onPasswordChange(e.target.value);
              validatePassword(e.target.value);
            }}
            placeholder="Enter password"
            required
          />
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Password must contain:
            <ul className="list-disc pl-5">
              <li className={password.length >= 8 ? "text-green-500" : ""}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                One lowercase letter
              </li>
              <li className={/\d/.test(password) ? "text-green-500" : ""}>
                One number
              </li>
              <li
                className={/[@$!%*?&]/.test(password) ? "text-green-500" : ""}
              >
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Confirm password"
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500">Passwords do not match</p>
          )}
        </div>
      </div>
    </div>
  );
}