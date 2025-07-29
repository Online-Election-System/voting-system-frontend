import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, MapPin, Phone, Mail, Edit, Save } from "lucide-react"

export default function Profile() {
  const gnProfile = {
    fullName: "K.M. Silva",
    officialTitle: "Grama Niladhari",
    employeeId: "GN/COL/001/2020",
    nic: "197512345678",
    email: "km.silva@gov.lk",
    phone: "0112345678",
    mobile: "0771234567",
    dateOfBirth: "1975-03-15",
    appointmentDate: "2020-01-15",
    division: "Pettah",
    district: "Colombo",
    province: "Western Province",
    officeAddress: "Grama Niladhari Office, Pettah, Colombo 11",
    residentialAddress: "No. 25, Temple Lane, Colombo 10",
    qualifications: "Diploma in Public Administration, Certificate in Local Government",
    experience: "4 years as Grama Niladhari",
    status: "Active",
    lastLogin: "2024-01-15 10:30 AM",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal and official information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-gray-500" />
              </div>
              <CardTitle>{gnProfile.fullName}</CardTitle>
              <CardDescription>{gnProfile.officialTitle}</CardDescription>
              <Badge className="bg-green-100 text-green-800 mt-2">{gnProfile.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {gnProfile.division}, {gnProfile.district}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {gnProfile.mobile}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {gnProfile.email}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">{gnProfile.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{gnProfile.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium text-xs">{gnProfile.lastLogin}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={gnProfile.fullName} readOnly />
                </div>
                <div>
                  <Label htmlFor="nic">NIC Number</Label>
                  <Input id="nic" value={gnProfile.nic} readOnly />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" value={gnProfile.dateOfBirth} readOnly />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={gnProfile.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Office Phone</Label>
                  <Input id="phone" value={gnProfile.phone} />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Phone</Label>
                  <Input id="mobile" value={gnProfile.mobile} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="residential">Residential Address</Label>
                  <Textarea id="residential" value={gnProfile.residentialAddress} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official Information */}
          <Card>
            <CardHeader>
              <CardTitle>Official Information</CardTitle>
              <CardDescription>Your official position and administrative details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Official Title</Label>
                  <Input id="title" value={gnProfile.officialTitle} readOnly />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" value={gnProfile.employeeId} readOnly />
                </div>
                <div>
                  <Label htmlFor="appointmentDate">Appointment Date</Label>
                  <Input id="appointmentDate" value={gnProfile.appointmentDate} readOnly />
                </div>
                <div>
                  <Label htmlFor="division">GN Division</Label>
                  <Input id="division" value={gnProfile.division} readOnly />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={gnProfile.district} readOnly />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" value={gnProfile.province} readOnly />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Textarea id="officeAddress" value={gnProfile.officeAddress} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualifications & Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Qualifications & Experience</CardTitle>
              <CardDescription>Your educational background and professional experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea id="qualifications" value={gnProfile.qualifications} className="min-h-[80px]" />
                </div>
                <div>
                  <Label htmlFor="experience">Professional Experience</Label>
                  <Textarea id="experience" value={gnProfile.experience} className="min-h-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
