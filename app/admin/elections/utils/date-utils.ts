import { SimpleDate } from "../types/election.types";

// Convert SimpleDate to JS Date
export const simpleDateToDate = (simpleDate?: SimpleDate): Date | undefined => {
  if (
    !simpleDate ||
    typeof simpleDate.year !== "number" ||
    typeof simpleDate.month !== "number" ||
    typeof simpleDate.day !== "number"
  ) {
    return undefined;
  }
  return new Date(simpleDate.year, simpleDate.month - 1, simpleDate.day);
};

// Convert JS Date to SimpleDate
export const dateToSimpleDate = (electionDate?: Date): SimpleDate | undefined => {
  if (!electionDate || isNaN(electionDate.getTime())) {
    return undefined;
  }
  return {
    year: electionDate.getFullYear(),
    month: electionDate.getMonth() + 1, // JavaScript months are 0-indexed
    day: electionDate.getDate(),
  };
};

// Format a SimpleDate object as a string
export const formatSimpleDate = (electionDate?: SimpleDate): string => {
  if (
    !electionDate ||
    typeof electionDate.day !== "number" ||
    typeof electionDate.month !== "number" ||
    typeof electionDate.year !== "number"
  ) {
    return "Date not set";
  }
  return `${electionDate.day}/${electionDate.month}/${electionDate.year}`;
};
