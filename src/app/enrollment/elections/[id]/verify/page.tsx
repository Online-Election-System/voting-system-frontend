"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2, User, Lock, CreditCard } from "lucide-react"

export default function VoterVerificationForm() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: "",
    nationalId: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Log start of process
      console.log("Attempting to enroll voter...") 

      const response = await fetch(`http://localhost:8080/api/v1/elections/${id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      // Log entire response
      console.log("Full API response:", data) 
      if (!response.ok) {
        // Handle error response
        const errorMessage = data.message || data.body?.message || data.error || "Enrollment failed"
        console.log("Enrollment failed:", errorMessage)
        throw new Error(errorMessage)
      }

      // Extract voter ID from the nested response structure
      const responseBody = data.body || data
      const voterId = responseBody.voterId
      const success = responseBody.success
      const message = responseBody.message
      console.log("Response body:", responseBody)
      console.log("Extracted voter ID:", voterId)
      console.log("Success status:", success)
      if (success && voterId) {
        console.log("Successfully enrolled with voter ID:", voterId)

        // Store voter ID in both sessionStorage and localStorage for persistence
        sessionStorage.setItem("voterId", voterId)
        localStorage.setItem("voterId", voterId)
        sessionStorage.setItem("enrolledElectionId", id as string)

        toast({
          title: "Enrollment Successful!",
          description: `You are now enrolled. Voter ID: ${voterId}`,
          variant: "default",
        })
        // Redirect to elections page with enrolled parameter to trigger UI update
        router.push(`/enrollment/elections?enrolled=${id}`)
      } else {
        // Handle case where API returns success but no voter ID
        console.warn("API response indicates success but no voter ID found")
        toast({
          title: "Enrollment Status Unclear",
          description: message || "Please contact support to verify your enrollment status",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Enrollment failed:", error.message)

      // Show user-friendly error messages
      let errorMessage = "Could not complete enrollment"

      if (error.message.includes("Invalid credentials")) {
        errorMessage = "Invalid credentials. Please check your details and try again."
      } else if (error.message.includes("Already enrolled")) {
        errorMessage = "You are already enrolled in this election."
        
        // If already enrolled, redirect to elections page
        router.push(`/enrollment/elections?enrolled=${id}`)
        return
      } else if (error.message.includes("Database error")) {
        errorMessage = "System error. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }
      toast({
        title: "Enrollment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-xl">
        <CardHeader className="text-center p-6 border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 mx-auto">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Voter Verification</CardTitle>
          <CardDescription className="text-gray-600">
            Please verify your identity to enroll in the election.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <div>
              <label htmlFor="nationalId" className="sr-only">
                National ID
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="nationalId"
                  name="nationalId"
                  placeholder="National ID"
                  value={form.nationalId}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Verify & Enroll"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
