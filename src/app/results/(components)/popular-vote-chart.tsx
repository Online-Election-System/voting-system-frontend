"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TransformedCandidate } from "@/app/results/types"

interface PopularVoteChartProps {
  data: {
    candidates: TransformedCandidate[]
    totalVotes: number
  }
}

export function PopularVoteChart({ data }: PopularVoteChartProps) {
  const { candidates, totalVotes } = data

  const chartData = candidates
    .map((candidate) => {
      const nameParts = candidate.name.split(" ")
      const displayName =
        nameParts.length === 1
          ? nameParts[0]
          : nameParts[0] + " " + nameParts[nameParts.length - 1]
      return {
        name: displayName,
        value: candidate.popularVotes,
        percentage: ((candidate.popularVotes / totalVotes) * 100).toFixed(1),
        color: candidate.color,
        fullName: candidate.name,
        party: candidate.party,
      }
    })
    .sort((a, b) => b.value - a.value)

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.fullName}</p>
          <p className="text-sm text-gray-600">{data.party}</p>
          <p className="text-sm">
            <span className="font-medium">{data.value.toLocaleString()}</span> votes
          </p>
          <p className="text-sm">
            <span className="font-medium">{data.percentage}%</span> of total
          </p>
        </div>
      )
    }
    return null
  }

  // Legend formatter uses payload to get color
  const legendFormatter = (value: string, entry: any) => {
    const color = entry?.payload?.color || "#000"
    return <span style={{ color }}>{value}</span>
  }

  return (
    <Tabs defaultValue="pie" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pie">Pie Chart</TabsTrigger>
        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
      </TabsList>

      <TabsContent value="pie">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  // props.payload contains the chartData object
                  const percentage = props.payload?.percentage
                  return percentage ? `${percentage}%` : ""
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={legendFormatter} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="bar">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
