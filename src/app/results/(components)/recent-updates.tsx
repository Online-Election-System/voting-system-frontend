// recent-updates.tsx
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

interface Update {
  id: number
  time: string
  district: string
  message: string
  type: "called" | "update" | "projection"
}

interface RecentUpdatesProps {
  updates: Update[]
}

export function RecentUpdates({ updates }: RecentUpdatesProps) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="flex gap-4 pb-4 border-b last:border-0">
            <div className="mt-0.5">
              {update.type === "called" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : update.type === "projection" ? (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              ) : (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{update.district}</span>
                <span className="text-xs text-muted-foreground">{update.time}</span>
              </div>
              <p className="text-sm mt-1">{update.message}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
