import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Vote, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last election</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Presidential Election 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Voters</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,565</div>
            <p className="text-xs text-muted-foreground">+1,234 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.2%</div>
            <p className="text-xs text-muted-foreground">+5.1% from last election</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Elections</CardTitle>
            <CardDescription>Schedule for the next 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Presidential Election</p>
                  <p className="text-sm text-muted-foreground">National</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Nov 5, 2024</p>
                  <p className="text-sm text-muted-foreground">7:00 AM - 7:00 PM</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Local Council Election</p>
                  <p className="text-sm text-muted-foreground">Regional</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Dec 12, 2024</p>
                  <p className="text-sm text-muted-foreground">8:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Parliamentary By-Election</p>
                  <p className="text-sm text-muted-foreground">District 3</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Jan 15, 2025</p>
                  <p className="text-sm text-muted-foreground">8:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">New Candidate Added</p>
                  <p className="text-sm text-muted-foreground">John Smith - Presidential</p>
                </div>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Election Schedule Updated</p>
                  <p className="text-sm text-muted-foreground">Presidential Election</p>
                </div>
                <p className="text-sm text-muted-foreground">Yesterday</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Voter Registration Closed</p>
                  <p className="text-sm text-muted-foreground">For Presidential Election</p>
                </div>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">System Maintenance</p>
                  <p className="text-sm text-muted-foreground">Security updates applied</p>
                </div>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

