import type { Election } from "../election.types";
import { ElectionStatusBadge } from "./election-status-badge";
import { formatSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay } from "../utils/time-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Vote,
  FileText,
  Edit3,
  CalendarDays,
  Timer,
  Trash2,
  Loader2,
} from "lucide-react";
import { DeleteConfirmationDialog } from "./delete-election";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ElectionDialogProps {
  election: Election | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  error?: string | Error | null;
}

export function ElectionDialog({
  election,
  isOpen,
  onOpenChange,
  onDelete,
  isLoading = false,
  error = null,
}: ElectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="m-6">
            <AlertDescription>
              {typeof error === "string" ? error : error.message}
            </AlertDescription>
          </Alert>
        ) : !election ? (
          <div className="p-6 text-center">No election data available</div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-2xl font-semibold text-gray-900">
                    {election.electionName || "Untitled Election"}
                  </DialogTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Vote className="h-4 w-4" />
                      {election.electionType || "General Election"}
                    </div>
                    <ElectionStatusBadge status={election.status} />
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 pb-6 space-y-6">
              {/* Main Election Date */}
              {election.electionDate && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="font-medium text-black">Election Date</p>
                        <p className="text-lg font-semibold text-black">
                          {formatSimpleDate(election.electionDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Voting Period */}
              {election.startDate && election.endDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg">
                          <CalendarDays className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            Start Date
                          </p>
                          <p className="font-semibold text-black">
                            {formatSimpleDate(election.startDate)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg">
                          <CalendarDays className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            End Date
                          </p>
                          <p className="font-semibold text-black">
                            {formatSimpleDate(election.endDate)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {election.startDate && election.endDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg">
                          <Timer className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            Voting Starts
                          </p>
                          {election.startTime && (
                            <p className="font-semibold text-black">
                              {formatTimeOfDay(election.startTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg">
                          <Timer className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            Voting Ends
                          </p>
                          {election.endTime && (
                            <p className="font-semibold text-black">
                              {formatTimeOfDay(election.endTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Description */}
              {election.description && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        Description
                      </span>
                    </div>
                    <Card className="bg-gray-50/50">
                      <CardContent className="p-4">
                        <p className="text-gray-700 leading-relaxed">
                          {election.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t gap-2">
                <Button asChild className="gap-2">
                  <Link href={`/election-commission/elections/${election.id}`}>
                    <Edit3 className="h-4 w-4" />
                    Edit Election
                  </Link>
                </Button>
                <DeleteConfirmationDialog
                  onConfirm={() => {
                    onDelete(election.id);
                    onOpenChange(false);
                  }}
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  }
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
