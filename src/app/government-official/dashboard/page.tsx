import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserMinus, UserPlus, UserCog } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  // Mock data for pending counts
  const pendingAddMemberRequests = 5
  const pendingUpdateMemberRequests = 2

  const stats = [
    {
      title: "Total Approved Voters", // Changed from "Total Registered Voters"
      value: "1,247",
      description: "Active voters in division",
      icon: Users,
      color: "bg-gray-100 text-gray-800",
    },
    {
      title: "Total Rejected Voters", // Changed from "Removal Requests"
      value: "3",
      description: "Total rejected removal requests", // Updated description
      icon: UserMinus,
      color: "bg-gray-100 text-gray-800",
      // Removed urgent: true as it's no longer a pending action
    },
    {
      title: "Total Households",
      value: "342",
      description: "Registered households",
      icon: Users,
      color: "bg-gray-100 text-gray-800",
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600">{stat.description}</p>
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
              href="/government-official/registrations"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg"
            >
              <UserCheck className="w-6 h-6" />
              <span>Review Registrations</span>
              <Badge className="bg-gray-800 text-white">12 Pending</Badge>
            </Link>
            <Link
              href="/government-official/removal-requests"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg"
            >
              <UserMinus className="w-6 h-6" />
              <span>Handle Removals</span>
              <Badge variant="outline" className="border-gray-800 text-gray-800">
                3 Pending
              </Badge>
            </Link>
            <Link
              href="/government-official/households"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg"
            >
              <Users className="w-6 h-6" />
              <span>Manage Households</span>
            </Link>
            <Link
              href="/government-official/add-members"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg relative"
            >
              <UserPlus className="w-6 h-6" />
              <span>Add New Member</span>
              <Badge variant="outline" className="border-gray-800 text-gray-800">
                3 Pending
              </Badge>
            </Link>
            <Link
              href="/government-official/update-members"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-colors rounded-lg relative"
            >
              <UserCog className="w-6 h-6" />
              <span>Update Member</span>
              <Badge variant="outline" className="border-gray-800 text-gray-800">
                3 Pending
              </Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* Removed Recent Activity section */}
    </div>
  )
}
