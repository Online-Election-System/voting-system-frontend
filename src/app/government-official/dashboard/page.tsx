import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, UserMinus, AlertTriangle, Eye, UserPlus, UserCog } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  // Mock data for pending counts
  const pendingAddMemberRequests = 5
  const pendingUpdateMemberRequests = 2

  const stats = [
    {
      title: "Pending Registrations",
      value: "12",
      description: "Awaiting review",
      icon: UserCheck,
      color: "bg-gray-100 text-gray-800",
      urgent: true,
    },
    {
      title: "Total Registered Voters",
      value: "1,247",
      description: "Active voters in division",
      icon: Users,
      color: "bg-gray-100 text-gray-800",
    },
    {
      title: "Removal Requests",
      value: "3",
      description: "Pending approval",
      icon: UserMinus,
      color: "bg-gray-100 text-gray-800",
      urgent: true,
    },
    {
      title: "Total Households",
      value: "342",
      description: "Registered households",
      icon: Users,
      color: "bg-gray-100 text-gray-800",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "Registration",
      name: "Saman Perera",
      nic: "199512345678",
      time: "2 hours ago",
      status: "pending",
    },
    {
      id: 2,
      type: "Removal Request",
      name: "Kamala Silva",
      nic: "198712345679",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: 3,
      type: "Registration",
      name: "Nimal Fernando",
      nic: "199012345680",
      time: "6 hours ago",
      status: "approved",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor and manage voter registrations in your division</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-600" />
              {stat.urgent && (
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  <AlertTriangle className="w-3 h-3" />
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600">{stat.description}</p>
              <Badge className={`mt-2 ${stat.color}`}>Active</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/registrations"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg"
            >
              <UserCheck className="w-6 h-6" />
              <span>Review Registrations</span>
              <Badge className="bg-gray-800 text-white">12 Pending</Badge>
            </Link>
            <Link
              href="/removal-requests"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg"
            >
              <UserMinus className="w-6 h-6" />
              <span>Handle Removals</span>
              <Badge variant="outline" className="border-gray-800 text-gray-800">
                3 Pending
              </Badge>
            </Link>
            <Link
              href="/households"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg"
            >
              <Users className="w-6 h-6" />
              <span>Manage Households</span>
            </Link>
            <Link
              href="/add-members"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg relative"
            >
              <UserPlus className="w-6 h-6" />
              <span>Add New Member</span>
              {pendingAddMemberRequests > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {pendingAddMemberRequests} Pending
                </Badge>
              )}
            </Link>
            <Link
              href="/update-members"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg relative"
            >
              <UserCog className="w-6 h-6" />
              <span>Update Member</span>
              {pendingUpdateMemberRequests > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {pendingUpdateMemberRequests} Pending
                </Badge>
              )}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest registrations and requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-600">
                      {activity.type} • NIC: {activity.nic}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={activity.status === "pending" ? "secondary" : "default"}
                    className={
                      activity.status === "pending" ? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
