import { cn } from "@/lib/utils";
import { ElectionStatus } from "../types/election.types";
import { STATUS_STYLES } from "../constants/election-constants";

interface ElectionStatusBadgeProps {
  status: ElectionStatus | string;
}

export function ElectionStatusBadge({ status }: ElectionStatusBadgeProps) {
  const statusStyle = status in STATUS_STYLES 
    ? STATUS_STYLES[status as ElectionStatus] 
    : STATUS_STYLES.default;

  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusStyle)}>
      {status || "Unknown"}
    </span>
  );
}
