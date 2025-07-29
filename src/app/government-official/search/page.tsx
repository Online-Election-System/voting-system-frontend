"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Download, Users } from "lucide-react"
import Link from "next/link"

export default function SearchVoters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("name")
  const [statusFilter, setStatusFilter] = useState("all")
  const [divisionFilter, setDivisionFilter] = useState("all")

  const voters = [
    {
      id: 1,
      fullName: "Saman Perera",
      nic: "199512345678",
      dob: "1995-03-15",
      phone: "0771234567",
      address: "No. 45, Main Street, Colombo",
      division: "Pettah",
      houseNumber: "45",
      status: "active",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      fullName: "Kamala Silva",
      nic: "198712345679",
      dob: "1987-08-22",
      phone: "0779876543",
      address: "No. 12, Temple Road, Kandy",
      division: "Pettah",
      houseNumber: "12",
      status: "active",
      registrationDate: "2024-01-14",
    },
    {
      id: 3,
      fullName: "Nimal Fernando",
      nic: "199012345680",
      dob: "1990-12-10",
      phone: "0765432109",
      address: "No. 78, Lake View, Galle",
      division: "Pettah",
      houseNumber: "78",
      status: "inactive",
      registrationDate: "2024-01-13",
    },
    {
      id: 4,
      fullName: "Priya Jayawardena",
      nic: "199212345681",
      dob: "1992-05-18",
      phone: "0712345678",
      address: "No. 23, Hill Street, Matara",
      division: "Pettah",
      houseNumber: "23",
      status: "active",
      registrationDate: "2024-01-12",
    },
  ]

  const filteredVoters = voters.filter((voter) => {
    let matchesSearch = false

    switch (searchType) {
      case "name":
        matchesSearch = voter.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        break
      case "nic":
        matchesSearch = voter.nic.includes(searchTerm)
        break
      case "house":
        matchesSearch = voter.houseNumber.includes(searchTerm)
        break
      case "phone":
        matchesSearch = voter.phone.includes(searchTerm)
        break
      default:
        matchesSearch = true
    }

    const matchesStatus = statusFilter === "all" || voter.status === statusFilter
    const matchesDivision = divisionFilter === "all" || voter.division === divisionFilter

    return matchesSearch && matchesStatus && matchesDivision
  })

  const handleExportResults = () => {
    console.log("Exporting search results...")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Voters</h1>
        <p className="text-gray-600">Find and manage voter information in your division</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Criteria
          </CardTitle>
          <CardDescription>Use various criteria to find specific voters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger>
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="nic">NIC Number</SelectItem>
                <SelectItem value="house">House Number</SelectItem>
                <SelectItem value="phone">Phone Number</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                <SelectItem value="Pettah">Pettah</SelectItem>
                <SelectItem value="Fort">Fort</SelectItem>
                <SelectItem value="Maradana">Maradana</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{filteredVoters.length}</div>
            <p className="text-sm text-gray-800">Search Results</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {filteredVoters.filter((v) => v.status === "active").length}
            </div>
            <p className="text-sm text-gray-800">Active Voters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {filteredVoters.filter((v) => v.status === "inactive").length}
            </div>
            <p className="text-sm text-gray-800">Inactive Voters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{voters.length}</div>
            <p className="text-sm text-gray-800">Total Voters</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {filteredVoters.length} voters found
                {searchTerm && ` for "${searchTerm}"`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              <Users className="w-3 h-3 mr-1" />
              {filteredVoters.length} Results
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>House No.</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoters.map((voter) => (
                <TableRow key={voter.id}>
                  <TableCell className="font-medium">{voter.fullName}</TableCell>
                  <TableCell>{voter.nic}</TableCell>
                  <TableCell>{voter.dob}</TableCell>
                  <TableCell>{voter.phone}</TableCell>
                  <TableCell>{voter.houseNumber}</TableCell>
                  <TableCell className="max-w-48 truncate">{voter.address}</TableCell>
                  <TableCell>
                    <Badge
                      variant={voter.status === "active" ? "default" : "secondary"}
                      className={voter.status === "active" ? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"}
                    >
                      {voter.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{voter.registrationDate}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/voters/${voter.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
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
