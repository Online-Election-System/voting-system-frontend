// components/enhanced-candidate-statistics-panel.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Building2,
  User,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Activity,
} from "lucide-react";
import type { Election } from "../election.types";
import {
  useElectionComparison,
  useElectionInsights,
} from "../hooks/use-election-comparison";

// Import the proper types from the hooks
interface ComparisonTrend {
  current: number;
  previous: number;
  change: number;
  percentageChange: number;
  trend: "up" | "down" | "same";
  isSignificant: boolean;
}

interface EnhancedCandidateStatisticsPanelProps {
  currentElection: Election;
  isLoading?: boolean;
}

// Enhanced Trend Indicator with significance highlighting
const EnhancedTrendIndicator = ({
  comparison,
  isSignificant = false,
}: {
  comparison: ComparisonTrend;
  isSignificant?: boolean;
}) => {
  const { trend, change, percentageChange } = comparison;

  if (trend === "same") {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus className="h-3 w-3" />
        <span className="text-xs">No change</span>
      </div>
    );
  }

  const isPositive = trend === "up";
  const baseColor = isPositive ? "green" : "red";
  const intensity = isSignificant ? "600" : "500";
  const bgIntensity = isSignificant ? "100" : "50";

  const colorClass = `text-${baseColor}-${intensity}`;
  const bgClass = `bg-${baseColor}-${bgIntensity}`;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`flex items-center gap-1 ${colorClass} ${bgClass} px-2 py-1 rounded-full ${
        isSignificant ? "ring-1 ring-current ring-opacity-30" : ""
      }`}
    >
      <Icon className="h-3 w-3" />
      <span
        className={`text-xs font-medium ${isSignificant ? "font-bold" : ""}`}
      >
        {Math.abs(change)} ({Math.abs(percentageChange).toFixed(1)}%)
      </span>
    </div>
  );
};

// Enhanced Statistic Card with better comparison display
export const EnhancedStatisticCard = ({
  title,
  value,
  icon: Icon,
  comparison,
  subtitle,
  isSignificant = false,
}: {
  title: string;
  value: number | string;
  icon: any;
  comparison?: ComparisonTrend;
  subtitle?: string;
  isSignificant?: boolean;
}) => (
  <div
    className={`p-4 border rounded-lg bg-white transition-all ${
      isSignificant ? "ring-2 ring-blue-200 bg-blue-50/30" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${
            isSignificant ? "text-blue-600" : "text-slate-400"
          }`}
        />
        <span
          className={`text-xs font-medium uppercase tracking-wide ${
            isSignificant ? "text-blue-800" : "text-slate-500"
          }`}
        >
          {title}
        </span>
      </div>
      {comparison && (
        <EnhancedTrendIndicator
          comparison={comparison}
          isSignificant={isSignificant}
        />
      )}
    </div>
    <div
      className={`text-2xl font-bold ${
        isSignificant ? "text-blue-900" : "text-gray-900"
      }`}
    >
      {value}
    </div>
    {subtitle && (
      <div
        className={`text-xs mt-1 ${
          isSignificant ? "text-blue-700" : "text-gray-500"
        }`}
      >
        {subtitle}
      </div>
    )}
  </div>
);

// Define types for better type safety
type OverallTrend = "growing" | "shrinking" | "stable";

interface InsightData {
  comparedWith: {
    electionName: string;
  };
  significantChanges: Array<{
    metric: string;
    trend: string;
    change: number;
    message: string;
  }>;
  overallTrend: OverallTrend;
}

export const EnhancedCandidateStatisticsPanel = ({
  currentElection,
  isLoading = false,
}: EnhancedCandidateStatisticsPanelProps) => {
  const [selectedComparisonElection, setSelectedComparisonElection] =
    useState<string>("none");

  // Use the enhanced comparison hooks
  const {
    availableElections,
    compareElections,
    isLoading: comparisonLoading,
  } = useElectionComparison(currentElection.id);

  const insights = useElectionInsights(currentElection);

  // Calculate current election statistics
  const currentStats = useMemo(() => {
    const enrolledCandidates = currentElection.enrolledCandidates || [];
    const totalCandidates = enrolledCandidates.length;

    const candidatesPerParty = enrolledCandidates.reduce((acc, candidate) => {
      const party = candidate.partyName || "Independent";
      acc[party] = (acc[party] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Separate Independent candidates from political parties
    const independentCandidates = candidatesPerParty["Independent"] || 0;

    // Count only actual political parties (excluding Independent)
    const politicalParties = Object.entries(candidatesPerParty).filter(
      ([partyName]) => partyName !== "Independent"
    );

    const totalParties = politicalParties.length;

    // Calculate average only for political parties (excluding independents)
    const totalCandidatesInParties = totalCandidates - independentCandidates;
    const averageCandidatesPerParty =
      totalParties > 0 ? totalCandidatesInParties / totalParties : 0;

    const partyCounts = politicalParties; // Only political parties
    const largestParty =
      partyCounts.length > 0
        ? partyCounts.reduce(
            (max, [name, count]) => (count > max.count ? { name, count } : max),
            { name: "", count: 0 }
          )
        : null;

    const partiesWithSingleCandidate = partyCounts.filter(
      ([, count]) => count === 1
    ).length;

    return {
      totalCandidates,
      totalParties,
      candidatesPerParty,
      averageCandidatesPerParty,
      partiesWithSingleCandidate,
      independentCandidates,
      largestParty,
    };
  }, [currentElection.enrolledCandidates]);

  // Get comparison data
  const comparisonData = useMemo(() => {
    if (!selectedComparisonElection || selectedComparisonElection === "none")
      return null;
    return compareElections(currentElection, selectedComparisonElection);
  }, [selectedComparisonElection, currentElection, compareElections]);

  // Determine significant changes for highlighting
  const significantMetrics = useMemo(() => {
    if (!comparisonData) return new Set();

    return new Set(
      Object.entries(comparisonData.trends)
        .filter(([, trend]) => trend.isSignificant)
        .map(([metric]) => metric)
    );
  }, [comparisonData]);

  if (isLoading || comparisonLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Candidate Analytics & Comparison
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {currentStats.totalCandidates} candidates
            </Badge>
            {comparisonData && (
              <Badge
                variant="outline"
                className="text-xs text-blue-600 border-blue-200"
              >
                vs {comparisonData.comparison.election.electionName}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Always visible summary with enhanced highlighting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <EnhancedStatisticCard
            title="Total Candidates Enrolled in Election"
            value={currentStats.totalCandidates}
            icon={Users}
            comparison={comparisonData?.trends.totalCandidates}
            isSignificant={significantMetrics.has("totalCandidates")}
          />
          <EnhancedStatisticCard
            title="Number of Political Parties"
            value={currentStats.totalParties}
            icon={Building2}
            comparison={comparisonData?.trends.totalParties}
            isSignificant={significantMetrics.has("totalParties")}
          />
          <EnhancedStatisticCard
            title="Number of Independent Candidates"
            value={currentStats.independentCandidates}
            icon={User}
            comparison={comparisonData?.trends.independentCandidates}
            isSignificant={significantMetrics.has("independentCandidates")}
          />
        </div>

        <div className="space-y-6">
          {/* Comparison Controls */}
          {availableElections.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  Compare with previous election:
                </span>
                <Select
                  value={selectedComparisonElection}
                  onValueChange={setSelectedComparisonElection}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select election to compare" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No comparison</SelectItem>
                    {availableElections.map((election) => (
                      <SelectItem key={election.id} value={election.id}>
                        {election.electionName} ({election.electionDate?.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
