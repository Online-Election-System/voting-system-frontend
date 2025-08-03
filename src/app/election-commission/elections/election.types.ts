// election.types.ts
import { ReactNode } from "react";

export interface SimpleDate {
  year: number;
  month: number;
  day: number;
}

export interface TimeOfDay {
  hour: number;
  minute: number;
}

// Enrolled candidate type
export interface EnrolledCandidate {
  electionId: string;
  candidateId: string;
  numberOfVotes: number;
  candidateName?: string;
  partyName?: string;
}

export interface Election {
  title: ReactNode;
  id: string;
  electionName: string;
  electionType: string;
  electionDate?: SimpleDate;
  startTime?: TimeOfDay;
  endTime?: TimeOfDay;
  description?: string;
  status: ElectionStatus;
  startDate?: SimpleDate;
  endDate?: SimpleDate;
  enrolDdl?: SimpleDate;
  noOfCandidates: number;
  enrolledCandidates?: EnrolledCandidate[];
  enrolledVotersCount?: number;
  votesCount?: number;
}

export type ElectionStatus =
  | "Scheduled"
  | "Upcoming"
  | "Active"
  | "Completed"
  | "Cancelled";

export interface ElectionCreate {
  electionName: string;
  electionType: string;
  electionDate: SimpleDate;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  description?: string;
  status: ElectionStatus;
  startDate: SimpleDate;
  endDate: SimpleDate;
  enrolDdl: SimpleDate;
  noOfCandidates: number;
  candidateIds?: string[];
}

export interface ElectionUpdate {
  electionName?: string;
  electionType?: string;
  electionDate?: SimpleDate;
  startTime?: TimeOfDay;
  endTime?: TimeOfDay;
  description?: string;
  status?: ElectionStatus;
  startDate?: SimpleDate;
  endDate?: SimpleDate;
  enrolDdl?: SimpleDate;
  noOfCandidates?: number;
  candidateIds?: string[];
}
