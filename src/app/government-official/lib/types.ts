// This file defines the shape of data returned by your Ballerina API

export interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface RegistrationApplication {
  fullName: string;
  nic: string;
  dob: string;
  phone: string | null;
  address: string;
  idCopyPath: string | null;
  imagePath: string | null;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
}

export interface RegistrationDetails {
  fullName: string;
  nic: string;
  dob: string;
  gender: string;
  civilStatus: string;
  phone: string | null;
  electoralDistrict: string;
  pollingDivision: string;
  pollingDistrictNumber: string;
  villageStreetEstate: string | null;
  houseNumber: string | null;
  fullAddress: string;
  idCopyPath: string | null;
  imagePath: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null; // This will be a string representation of a date
  comments: string | null;
}