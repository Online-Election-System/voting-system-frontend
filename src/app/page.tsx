"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BarChart3,
  Vote,
  AlertCircle,
  CheckCircle,
  Home,
  UserCheck,
  FileText,
  Mail,
  Key,
  UserPlus,
  Calendar,
  Shield,
  Award,
  ArrowRight,
  ExternalLink,
  Phone,
  MapPin,
} from "lucide-react"

export default function SriLankaElectionCommission() {
  const [searchQuery, setSearchQuery] = useState("")
  const [financeSearchQuery, setFinanceSearchQuery] = useState("")

  return (
    <div className="bg-background min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Official Government Portal
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Election Commission of Sri Lanka
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                  Ensuring democratic integrity through transparent, secure, and accessible electoral processes for all
                  Sri Lankan citizens.
                </p>
              </div>

              {/* <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Vote className="w-5 h-5 mr-2" />
                  Start Voting Process
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full bg-transparent"
                >
                  <UserCheck className="w-5 h-5 mr-2" />
                  Register to Vote
                </Button>
              </div> */}

              {/* <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">2.5M+</div>
                  <div className="text-sm text-blue-300">Registered Voters</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">25</div>
                  <div className="text-sm text-blue-300">Districts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-200">99.8%</div>
                  <div className="text-sm text-blue-300">System Uptime</div>
                </div>
              </div> */}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <img
                  src="https://d3i6fh83elv35t.cloudfront.net/static/2024/09/2024-09-21T121605Z_1643122364_RC2X4AAZV25X_RTRMADP_3_SRI-LANKA-ELECTION-1024x683.jpg"
                  alt="Sri Lankan Election Process"
                  className="w-full h-auto rounded-xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      {/* <section className="bg-white shadow-lg -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 rounded-xl"
              >
                <Vote className="w-8 h-8 text-blue-600" />
                <span className="font-medium">Cast Vote</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 rounded-xl"
              >
                <UserPlus className="w-8 h-8 text-green-600" />
                <span className="font-medium">Register</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 rounded-xl"
              >
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <span className="font-medium">Results</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-orange-50 rounded-xl"
              >
                <Phone className="w-8 h-8 text-orange-600" />
                <span className="font-medium">Support</span>
              </Button>
            </div>
          </div>
        </div>
      </section> */}
     
      {/* Enhanced Household Voter Registration Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-4">
              <Home className="w-4 h-4 mr-2" />
              Registration Process
            </Badge>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Household Voter Registration</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our streamlined 7-step process to register your entire household for voting
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Steps 1-6 in Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Step 1 */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-blue-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      1
                    </div>
                    Chief Occupant Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-3 rounded-lg">
                    <UserCheck className="w-6 h-6" />
                    <span className="font-semibold">Personal Details Required</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Full Name & NIC
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Contact Number & Email
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Date of Birth & Gender
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Civil Status & Password
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 Chief Occupant manages the entire household registration
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-green-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      2
                    </div>
                    Household Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-lg">
                    <Home className="w-6 h-6" />
                    <span className="font-semibold">Household Information</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Complete household address
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Total number of members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Supporting documents
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-green-800 font-medium">⚠️ One household entry per Chief Occupant only</p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-orange-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      3
                    </div>
                    Members Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <Users className="w-6 h-6" />
                    <span className="font-semibold">Eligible Members (18+ years)</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Member details & documents
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Age verification required
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Supporting documentation
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm text-orange-800 font-medium">
                      📋 Chief Occupant provides all member information
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-purple-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      4
                    </div>
                    Email Confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-purple-600 bg-purple-50 p-3 rounded-lg">
                    <Mail className="w-6 h-6" />
                    <span className="font-semibold">Confirmation Details</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Registration acknowledgment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Username for all members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Passwords for all members
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm text-purple-800 font-medium">
                      🔒 Keep confirmation email safe for future reference
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-red-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      5
                    </div>
                    First-Time Login
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-lg">
                    <Key className="w-6 h-6" />
                    <span className="font-semibold">Password Change Required</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Members must change password
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Secure account access
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Excludes Chief Occupant
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border-l-4 border-red-400">
                    <p className="text-sm text-red-800 font-medium">🛡️ Mandatory password change for security</p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 6 */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-indigo-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      6
                    </div>
                    Member Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-3 rounded-lg">
                    <UserPlus className="w-6 h-6" />
                    <span className="font-semibold">Add / Update / Delete</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      Chief Occupant can request changes
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      Add new household members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      Update or delete existing members
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border-l-4 border-indigo-400">
                    <p className="text-sm text-indigo-800 font-medium">
                      ✅ All requests forwarded to GN Officer for approval
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 7 - Full Width with Enhanced Design */}
            <Card className="border-l-4 border-l-teal-500 mb-12 bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-teal-800 flex items-center gap-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                    7
                  </div>
                  Document Verification by GN Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3 text-teal-600 mb-6">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <FileText className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-xl">Official Verification Process</span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      Verification Requirements
                    </h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                        Every submitted document will be thoroughly reviewed
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                        GN Officer conducts comprehensive verification
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                        Registration validity depends on approval
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      Important Notes
                    </h4>
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        Registration is pending until GN approval
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        All documents must be genuine and current
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        Verification ensures electoral integrity
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Important Notice */}
            <Card className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-red-800 flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  ⚠️ Critical Legal Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                    <h4 className="text-lg font-bold text-red-800 mb-4">Consequences of False Information</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Immediate cancellation of registration
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Legal consequences under electoral law
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Permanent disqualification from voting
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                    <h4 className="text-lg font-bold text-orange-800 mb-4">Your Responsibilities</h4>
                    <ul className="text-gray-700 space-y-2">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Ensure all documents are genuine and current
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Provide accurate and verifiable information
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Submit complete supporting documentation
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Voting Instructions */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-4">
              <Vote className="w-4 h-4 mr-2" />
              Voting Guide
            </Badge>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How to Vote Online</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cast your vote securely from anywhere with our simple 4-step process
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl text-blue-800 flex items-center justify-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Vote className="w-8 h-8 text-blue-600" />
                  </div>
                  Secure Online Voting Process
                </CardTitle>
                <p className="text-gray-600 text-lg mt-4">
                  Follow these steps to participate in Sri Lanka's democratic process
                </p>
              </CardHeader>

              <CardContent className="space-y-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Step 1 */}
                  <div className="text-center space-y-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                      <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-800">Secure Login</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Enter your National ID and password to access the secure voting portal
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold mb-2">
                        <Shield className="w-4 h-4" />
                        Required Credentials
                      </div>
                      <p className="text-sm text-blue-600">National ID & Secure Password</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center space-y-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                      <div className="absolute -inset-4 bg-green-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-800">Verify & Proceed</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Review your details and click "Proceed to Vote" to access the ballot
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-2">
                        <CheckCircle className="w-4 h-4" />
                        Verification Step
                      </div>
                      <p className="text-sm text-green-600">Confirm your identity first</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center space-y-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        3
                      </div>
                      <div className="absolute -inset-4 bg-orange-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-800">Choose Candidate</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Select your preferred candidate from the official ballot options
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-center gap-2 text-orange-700 font-semibold mb-2">
                        <Users className="w-4 h-4" />
                        Selection Process
                      </div>
                      <p className="text-sm text-orange-600">Review all options carefully</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="text-center space-y-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        4
                      </div>
                      <div className="absolute -inset-4 bg-purple-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-800">Confirm Vote</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Review your selection and confirm to complete the voting process
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-center gap-2 text-purple-700 font-semibold mb-2">
                        <Award className="w-4 h-4" />
                        Final Step
                      </div>
                      <p className="text-sm text-purple-600">Vote cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Important Reminders */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-yellow-800 mb-4">Security Reminders</h4>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-yellow-600 mt-1" />
                          <div>
                            <h5 className="font-semibold text-yellow-800">Secure Credentials</h5>
                            <p className="text-sm text-yellow-700">Keep your National ID and password confidential</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-yellow-600 mt-1" />
                          <div>
                            <h5 className="font-semibold text-yellow-800">One Vote Only</h5>
                            <p className="text-sm text-yellow-700">Multiple votes will be automatically rejected</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-yellow-600 mt-1" />
                          <div>
                            <h5 className="font-semibold text-yellow-800">Need Help?</h5>
                            <p className="text-sm text-yellow-700">Contact our 24/7 support team</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Need Assistance?</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Our dedicated support team is here to help you with any questions or concerns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">24/7 Hotline</h3>
                <p className="text-blue-200">+94 11 123 4567</p>
                <p className="text-sm text-blue-300">Available round the clock</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Email Support</h3>
                <p className="text-blue-200">support@elections.gov.lk</p>
                <p className="text-sm text-blue-300">Response within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8 text-center space-y-4">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Visit Us</h3>
                <p className="text-blue-200">Colombo 07, Sri Lanka</p>
                <p className="text-sm text-blue-300">Mon-Fri: 8:00 AM - 5:00 PM</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
