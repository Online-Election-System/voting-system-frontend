import { useCallback, useState } from "react";
import {
  Candidate,
  CandidateFormData,
  validateHexColor,
} from "../candidate.types";

export const useCandidateForm = (initialCandidate?: Candidate | null) => {
  // Required fields
  const [candidateName, setCandidateName] = useState(
    initialCandidate?.candidateName || ""
  );
  const [partyName, setPartyName] = useState(initialCandidate?.partyName || "");
  const [partyColor, setPartyColor] = useState(
    initialCandidate?.partyColor || "#0066CC"
  );

  // Optional fields
  const [partySymbol, setPartySymbol] = useState(
    initialCandidate?.partySymbol || ""
  );
  const [candidateImage, setCandidateImage] = useState(
    initialCandidate?.candidateImage || ""
  );
  const [email, setEmail] = useState(initialCandidate?.email || "");
  const [phone, setPhone] = useState(initialCandidate?.phone || "");
  const [description, setDescription] = useState(
    initialCandidate?.description || ""
  );

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setCandidateName("");
    setPartyName("");
    setPartyColor("#0066CC");
    setPartySymbol("");
    setCandidateImage("");
    setEmail("");
    setPhone("");
    setDescription("");
    setErrors({});
  }, []);

  const setFormData = useCallback((candidate: Candidate) => {
    setCandidateName(candidate.candidateName || "");
    setPartyName(candidate.partyName || "");
    setPartyColor(candidate.partyColor || "#0066CC");
    setPartySymbol(candidate.partySymbol || "");
    setCandidateImage(candidate.candidateImage || "");
    setEmail(candidate.email || "");
    setPhone(candidate.phone || "");
    setDescription(candidate.description || "");
    setErrors({});
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!candidateName.trim()) {
      newErrors.candidateName = "Candidate name is required";
    } else if (candidateName.trim().length < 2) {
      newErrors.candidateName = "Candidate name must be at least 2 characters";
    }

    if (!partyName.trim()) {
      newErrors.partyName = "Party name is required";
    } else if (partyName.trim().length < 2) {
      newErrors.partyName = "Party name must be at least 2 characters";
    }

    if (!partyColor.trim()) {
      newErrors.partyColor = "Party color is required";
    } else if (!validateHexColor(partyColor)) {
      newErrors.partyColor = "Please enter a valid hex color (e.g., #FF0000)";
    }

    // Optional field validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (phone && !/^0\d{9}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number (e.g., 0771234567)";
    }

    if (description && description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [candidateName, partyName, partyColor, email, phone, description]);

  // Fixed getFormData function in use-candidate-form.ts
  const getFormData = useCallback((): CandidateFormData => {
    // Only include fields that have actual values (not empty strings)
    const formData: CandidateFormData = {
      candidateName: candidateName.trim(),
      partyName: partyName.trim(),
      partyColor: partyColor.trim(),
    };

    // Add optional fields only if they have values
    if (partySymbol?.trim()) {
      formData.partySymbol = partySymbol.trim();
    }

    if (candidateImage?.trim()) {
      formData.candidateImage = candidateImage.trim();
    }

    if (email?.trim()) {
      formData.email = email.trim();
    }

    if (phone?.trim()) {
      formData.phone = phone.trim();
    }

    if (description?.trim()) {
      formData.description = description.trim();
    }

    return formData;
  }, [
    candidateName,
    partyName,
    partyColor,
    partySymbol,
    candidateImage,
    email,
    phone,
    description,
  ]);

  const isFormValid = useCallback(() => {
    return (
      candidateName.trim() &&
      partyName.trim() &&
      partyColor.trim() &&
      validateHexColor(partyColor) &&
      Object.keys(errors).length === 0
    );
  }, [candidateName, partyName, partyColor, errors]);

  return {
    // Form state
    candidateName,
    setCandidateName,
    partyName,
    setPartyName,
    partyColor,
    setPartyColor,
    partySymbol,
    setPartySymbol,
    candidateImage,
    setCandidateImage,
    email,
    setEmail,
    phone,
    setPhone,
    description,
    setDescription,

    // Validation
    errors,
    validateForm,
    isFormValid,

    // Actions
    resetForm,
    setFormData,
    getFormData,
  };
};
