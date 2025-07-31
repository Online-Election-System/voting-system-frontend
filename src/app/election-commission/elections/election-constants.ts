import { ElectionStatus } from "./election.types";

export const ELECTION_TYPES = [
  { value: "Presidential Election", label: "Presidential Election" },
];

export const ELECTION_STATUSES: { value: ElectionStatus; label: string }[] = [
  { value: "Cancelled", label: "Cancelled" },
];

export const STATUS_STYLES = {
  Active: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
  Upcoming: "bg-purple-100 text-purple-800",
  Scheduled: "bg-yellow-100 text-yellow-800",
  default: "bg-gray-100 text-gray-800",
};
