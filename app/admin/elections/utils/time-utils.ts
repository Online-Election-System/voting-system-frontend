import { TimeOfDay } from "../types/election.types";

// Format time object
export const formatTimeOfDay = (time?: TimeOfDay): string => {
  if (!time || typeof time.hour !== "number" || typeof time.minute !== "number") {
    return "N/A";
  }
  const hour = time.hour.toString().padStart(2, "0");
  const minute = time.minute.toString().padStart(2, "0");
  return `${hour}:${minute}`;
};

// Parse time string to TimeOfDay
export const parseTimeString = (timeString: string): TimeOfDay | undefined => {
  if (!timeString) return undefined;

  const [hours, minutes] = timeString.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return undefined;

  return {
    hour: hours,
    minute: minutes,
  };
};
