"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  Search,
  Filter,
  Check,
  Trash2,
  Eye,
  AlertCircle,
  UserCheck,
  UserMinus,
  MessageSquare,
} from "lucide-react"

export default function Notifications() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const notifications = [
    {
      id: 1,
      type: "registration",
      title: "New Voter Registration",
      message: "Saman Perera has submitted a new voter registration application",
      timestamp: "2024-01-15 10:30 AM",
      status: "unread",
      priority: "high",
      relatedId: "REG-001",
    },
    {
      id: 2,
      type: "removal",
      title: "Member Removal Request",
      message: "Priya Silva has requested removal of Kamala Silva from household",
      timestamp: "2024-01-15 09:15 AM",
      status: "unread",
      priority: "medium",
      relatedId: "REM-001",
    },
    {
      id: 3,
      type: "system",
      title: "System Maintenance",
      message: "Scheduled system maintenance will occur on January 20th from 2:00 AM to 4:00 AM",
      timestamp: "2024-01-14 08:00 AM",
      status: "read",
      priority: "low",
      relatedId: null,
    },
    {
      id: 4,
      type: "registration",
      title: "Registration Approved",
      message: "Voter registration for Nimal Fernando has been successfully processed",
      timestamp: "2024-01-14 03:45 PM",
      status: "read",
      priority: "medium",
      relatedId: "REG-002",
    },
    {
      id: 5,
      type: "alert",
      title: "Duplicate NIC Detected",
      message: "Potential duplicate NIC found: 199512345678 appears in multiple applications",
      timestamp: "2024-01-13 11:20 AM",
      status: "unread",
      priority: "high",
      relatedId: null,
    },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <UserCheck className="w-4 h-4" />
      case "removal":
        return <UserMinus className="w-4 h-4" />
      case "alert":
        return <AlertCircle className="w-4 h-4" />
      case "system":
        return <Bell className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-gray-100 text-gray-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  const handleMarkAsRead = (id: number) => {
    console.log(`Marking notification ${id} as read`)
  }

  const handleDelete = (id: number) => {
    console.log(`Deleting notification ${id}`)
  }

  const handleMarkAllAsRead = () => {
    console.log("Marking all notifications as read")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with system alerts and requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-100 text-red-800">{unreadCount} Unread</Badge>
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="removal">Removal</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.status === "unread").length}
            </div>
            <p className="text-sm text-gray-600">Unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.priority === "high").length}
            </div>
            <p className="text-sm text-gray-600">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {notifications.filter((n) => n.type === "registration").length}
            </div>
            <p className="text-sm text-gray-600">Registration Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {notifications.filter((n) => n.type === "removal").length}
            </div>
            <p className="text-sm text-gray-600">Removal Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>{filteredNotifications.length} notifications found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.status === "unread" ? "bg-blue-50 border-blue-200" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-full ${notification.status === "unread" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-medium ${
                            notification.status === "unread" ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {notification.status === "unread" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{notification.timestamp}</span>
                        {notification.relatedId && <span>ID: {notification.relatedId}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.relatedId && (
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {notification.status === "unread" && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notification.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
