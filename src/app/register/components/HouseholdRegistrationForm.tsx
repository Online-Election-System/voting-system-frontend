"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHouseholdForm } from "../hooks/use-household-form";
import { ChiefOccupantForm } from "./ChiefOccupantForm";
import { HouseholdDetailsForm } from "./HouseholdDetailsForm";
import { HouseholdMembersForm } from "./HouseholdMembersForm";
import { submitHouseholdRegistration } from "../services/householdRegistrationServices";
import { validatePassword } from "../utils/password-validation-util";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function HouseholdRegistrationForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentStep,
    chiefOccupant,
    householdDetails,
    householdMembers,
    currentMemberIndex,
    setCurrentMemberIndex,
    handleChiefOccupantChange,
    handleHouseholdDetailsChange,
    handleMemberChange,
    nextStep,
    prevStep,
  } = useHouseholdForm();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate password before submission
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitHouseholdRegistration(
        chiefOccupant,
        householdDetails,
        householdMembers,
        password
      );

      alert("Registration successful!");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setPasswordError(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-black mx-auto">
            Electoral Registration
          </CardTitle>
          <CardDescription className="mx-auto">
            Register your household for the election
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "chief" && (
            <ChiefOccupantForm
              chiefOccupant={chiefOccupant}
              onChange={handleChiefOccupantChange}
              password={password}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              onPasswordChange={handlePasswordChange}
              onConfirmPasswordChange={setConfirmPassword}
            />
          )}
          {currentStep === "household" && (
            <HouseholdDetailsForm
              householdDetails={householdDetails}
              onChange={handleHouseholdDetailsChange}
            />
          )}
          {currentStep === "members" && (
            <HouseholdMembersForm
              householdMembers={householdMembers}
              currentMemberIndex={currentMemberIndex}
              householdMemberCount={householdDetails.householdMemberCount}
              onChange={handleMemberChange}
              onMemberIndexChange={setCurrentMemberIndex}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep !== "chief" && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
          {currentStep !== "members" ? (
            <Button
              type="button"
              className={currentStep === "chief" ? "ml-auto" : ""}
              onClick={nextStep}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}