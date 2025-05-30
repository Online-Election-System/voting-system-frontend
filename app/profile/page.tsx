import { User, MapPin, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const voterData = {
  id: "V123456789",
  name: "Alex Johnson",
  district: "Central District",
  pollingStation: "Central High School",
  registrationDate: "2020-05-15",
  status: "Active",
  hasVoted: false,
  enrolledElections: [
    {
      id: "3",
      title: "2024 Local Council Election",
      date: "2024-11-10",
      status: "Enrolled",
    },
  ],
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View your voter information and enrollment status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt={voterData.name} />
              <AvatarFallback>{voterData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{voterData.name}</CardTitle>
              <CardDescription>Voter ID: {voterData.id}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">District</p>
                <p className="text-sm text-muted-foreground">{voterData.district}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Polling Station</p>
                <p className="text-sm text-muted-foreground">{voterData.pollingStation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Registration Date</p>
                <p className="text-sm text-muted-foreground">{voterData.registrationDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Voter Status</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="mt-1">
                    {voterData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Voting Status</CardTitle>
              <CardDescription>Your voting status for enrolled elections</CardDescription>
            </CardHeader>
            <CardContent>
              {voterData.enrolledElections.length > 0 ? (
                <div className="space-y-4">
                  {voterData.enrolledElections.map((election) => (
                    <div key={election.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{election.title}</p>
                        <p className="text-sm text-muted-foreground">Date: {election.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {voterData.hasVoted ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Voted</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-600">Not Voted</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 py-4">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <p>You are not enrolled in any elections.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
