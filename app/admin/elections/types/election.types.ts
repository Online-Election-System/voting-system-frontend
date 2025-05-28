// Types for election data
export interface SimpleDate {
    year: number;
    month: number;
    day: number;
  }
  
  export interface TimeOfDay {
    hour: number;
    minute: number;
  }
  
  export interface Election {
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
  }
  
  export type ElectionStatus = "Scheduled" | "Upcoming" | "Active" | "Completed" | "Cancelled";
  
  export interface ElectionConfig {
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
  }
  