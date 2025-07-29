"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Users, AlertTriangle, Edit } from "lucide-react"
import Link from "next/link"

export default function Households() {
  const [searchTerm, setSearchTerm] = useState("")

  const households = [
    {
      id: 1,
      houseNumber: "45",
      address: "Main Street, Colombo",
      chiefOccupant: "Saman Silva",
      chiefOccupantNic: "197512345678",
      totalMembers: 4,
      registeredVoters: 3,
      pendingRegistrations: 1,
      lastUpdated: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      houseNumber: "12",
      address: "Temple Road, Kandy",
      chiefOccupant: "Priya Perera",
      chiefOccupantNic: "198012345679",
      totalMembers: 3,
      registeredVoters: 2,
      pendingRegistrations: 0,
      lastUpdated: "2024-01-14",
      status: "active",
    },
    {
      id: 3,
      houseNumber: "78",
      address: "Lake View, Galle",
      chiefOccupant: "Nimal Fernando",
      chiefOccupantNic: "199012345680",
      totalMembers: 5,
      registeredVoters: 4,
      pendingRegistrations: 0,
      lastUpdated: "2024-01-13",
      status: "active",
    },
    {
      id: 4,
      houseNumber: "23",
      address: "Hill Street, Matara",
      chiefOccupant: "Kamala Jayawardena",
      chiefOccupantNic: "198512345681",
      totalMembers: 2,
      registeredVoters: 2,
      pendingRegistrations: 0,
      lastUpdated: "2024-01-12",
      status: "inactive",
    },
  ]

  const filteredHouseholds = households.filter(
    (household) =>
      household.chiefOccupant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.houseNumber.includes(searchTerm) ||
      household.chiefOccupantNic.includes(searchTerm),
  )

  const totalHouseholds = households.length
  const activeHouseholds = households.filter((h) => h.status === "active").length
  const totalMembers = households.reduce((sum, h) => sum + h.totalMembers, 0)
  const totalVoters = households.reduce((sum, h) => sum + h.registeredVoters, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Household Management</h1>
        <p className="text-gray-600">Manage households and their members in your division</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{totalHouseholds}</div>
            <p className="text-sm text-gray-600">Total Households</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{activeHouseholds}</div>
            <p className="text-sm text-gray-600">Active Households</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{totalMembers}</div>
            <p className="text-sm text-gray-600">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{totalVoters}</div>
            <p className="text-sm text-gray-600">Registered Voters</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Households
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by chief occupant name, address, house number, or NIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Households Table */}
      <Card>
        <CardHeader>
          <CardTitle>Households</CardTitle>
          <CardDescription>{filteredHouseholds.length} households found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>House No.</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Chief Occupant</TableHead>
                <TableHead>Chief Occupant NIC</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Voters</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHouseholds.map((household) => (
                <TableRow key={household.id}>
                  <TableCell className="font-medium">{household.houseNumber}</TableCell>
                  <TableCell className="max-w-48 truncate">{household.address}</TableCell>
                  <TableCell>{household.chiefOccupant}</TableCell>
                  <TableCell>{household.chiefOccupantNic}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      {household.totalMembers}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {household.registeredVoters}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {household.pendingRegistrations > 0 ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {household.pendingRegistrations}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={household.status === "active" ? "default" : "secondary"}
                      className={
                        household.status === "active" ? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {household.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{household.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/households/${household.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
