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
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function HouseholdRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Store cleanup functions from child components
  const cleanupFunctionsRef = useRef<Array<() => Promise<void>>>([]);
  const isFormSubmittedRef = useRef(false);

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

  // Register cleanup function from child components
  const registerCleanupFunction = (cleanupFn: () => Promise<void>) => {
    if (!cleanupFunctionsRef.current.includes(cleanupFn)) {
      cleanupFunctionsRef.current.push(cleanupFn);
    }
  };

  // Handle page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        !isFormSubmittedRef.current &&
        cleanupFunctionsRef.current.length > 0
      ) {
        e.preventDefault();
        e.returnValue =
          "Are you sure you want to leave? Your uploaded files will be lost.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Handle route changes (back button, navigation away)
  useEffect(() => {
    const handleRouteChange = async () => {
      if (!isFormSubmittedRef.current) {
        await cleanupAllFiles();
      }
    };

    const handlePopState = () => {
      if (!isFormSubmittedRef.current) {
        cleanupAllFiles();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Cleanup on component unmount if form wasn't submitted
      if (!isFormSubmittedRef.current) {
        cleanupAllFiles();
      }
    };
  }, []);

  const cleanupAllFiles = async () => {
    try {
      await Promise.all(
        cleanupFunctionsRef.current.map((cleanup) => cleanup())
      );
      toast({
        title: "Cleanup Complete",
        description: "All uploaded files have been cleaned up",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Cleanup Error",
        description: "There was an error cleaning up files",
        variant: "destructive",
      });
      console.error("Error cleaning up files:", error);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleFormCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    setShowCancelDialog(false);
    await cleanupAllFiles();
    router.push("/");
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    prevStep();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      toast({
        title: "Password Error",
        description: passwordValidationError,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      toast({
        title: "Password Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
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

      isFormSubmittedRef.current = true;

      toast({
        title: "Registration Successful",
        description: "Your household registration has been submitted successfully",
        variant: "default",
      });
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setPasswordError(errorMessage);
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                onRegisterCleanup={registerCleanupFunction}
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
                onRegisterCleanup={registerCleanupFunction}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleFormCancel}>
              Cancel
            </Button>
            <div className="flex space-x-6">
              {currentStep !== "chief" && (
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Previous
                </Button>
              )}

              {currentStep !== "members" ? (
                <Button type="button" onClick={handleNextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
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
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Cancel Registration</CardTitle>
              <CardDescription>
                Are you sure you want to cancel? All uploaded files and form
                data will be lost.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="default"
                onClick={() => setShowCancelDialog(false)}
              >
                Continue Editing
              </Button>
              <Button variant="outline" onClick={confirmCancel}>
                Yes, Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}