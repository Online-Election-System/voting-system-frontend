import { useMemo } from "react";
import { useElections } from "./use-elections";
import type { Election } from "../election.types";
import { calculateRealTimeElectionStatus } from "../utils/election-status-utils";

interface ComparisonTrend {
  current: number;
  previous: number;
  change: number;
  percentageChange: number;
  trend: "up" | "down" | "same";
  isSignificant: boolean;
}

interface ElectionComparison {
  comparison: {
    election: Election;
  };
  trends: {
    totalCandidates: ComparisonTrend;
    totalParties: ComparisonTrend;
    averageCandidatesPerParty: ComparisonTrend;
    independentCandidates: ComparisonTrend;
    partiesWithSingleCandidate: ComparisonTrend;
  };
}

export const useElectionComparison = (currentElectionId: string) => {
  const { data: electionsData } = useElections();

  const availableElections = useMemo(() => {
    if (!electionsData?.elections) return [];

    return electionsData.elections
      .filter((election) => {
        if (election.id === currentElectionId) return false;

        const isCompleted = election.status === "Completed";
        const isRealTimeCompleted =
          election.status !== "Cancelled" &&
          calculateRealTimeElectionStatus(election) === "Completed";

        return isCompleted || isRealTimeCompleted;
      })
      .sort((a, b) => {
        const dateA = a.electionDate
          ? new Date(
              a.electionDate.year,
              a.electionDate.month - 1,
              a.electionDate.day
            )
          : new Date(0);
        const dateB = b.electionDate
          ? new Date(
              b.electionDate.year,
              b.electionDate.month - 1,
              b.electionDate.day
            )
          : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [electionsData, currentElectionId]);

  const compareElections = (
    currentElection: Election,
    comparisonElectionId: string
  ): ElectionComparison | null => {
    const comparisonElection = availableElections.find(
      (e) => e.id === comparisonElectionId
    );
    if (!comparisonElection) return null;

    const calculateStats = (election: Election) => {
      const candidates = election.enrolledCandidates || [];
      const partiesMap = candidates.reduce((acc, candidate) => {
        const party = candidate.partyName || "Independent";
        acc[party] = (acc[party] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Separate Independent from political parties
      const independentCandidates = partiesMap["Independent"] || 0;

      // Count only political parties (excluding Independent)
      const politicalPartiesEntries = Object.entries(partiesMap).filter(
        ([partyName]) => partyName !== "Independent"
      );

      const totalParties = politicalPartiesEntries.length;
      const totalCandidatesInParties =
        candidates.length - independentCandidates;

      const partiesWithSingleCandidate = politicalPartiesEntries.filter(
        ([, count]) => count === 1
      ).length;

      return {
        totalCandidates: candidates.length,
        totalParties,
        averageCandidatesPerParty:
          totalParties > 0 ? totalCandidatesInParties / totalParties : 0,
        independentCandidates,
        partiesWithSingleCandidate,
      };
    };

    const currentStats = calculateStats(currentElection);
    const previousStats = calculateStats(comparisonElection);

    const createTrend = (
      current: number,
      previous: number
    ): ComparisonTrend => {
      const change = current - previous;
      const percentageChange = previous > 0 ? (change / previous) * 100 : 0;
      const trend = change > 0 ? "up" : change < 0 ? "down" : "same";
      const isSignificant = Math.abs(percentageChange) > 20; // 20% change threshold

      return {
        current,
        previous,
        change,
        percentageChange,
        trend,
        isSignificant,
      };
    };

    return {
      comparison: { election: comparisonElection },
      trends: {
        totalCandidates: createTrend(
          currentStats.totalCandidates,
          previousStats.totalCandidates
        ),
        totalParties: createTrend(
          currentStats.totalParties,
          previousStats.totalParties
        ),
        averageCandidatesPerParty: createTrend(
          currentStats.averageCandidatesPerParty,
          previousStats.averageCandidatesPerParty
        ),
        independentCandidates: createTrend(
          currentStats.independentCandidates,
          previousStats.independentCandidates
        ),
        partiesWithSingleCandidate: createTrend(
          currentStats.partiesWithSingleCandidate,
          previousStats.partiesWithSingleCandidate
        ),
      },
    };
  };

  return {
    availableElections,
    compareElections,
    isLoading: !electionsData,
  };
};

export const useElectionInsights = (currentElection: Election) => {
  const { availableElections, compareElections } = useElectionComparison(
    currentElection.id
  );

  return useMemo(() => {
    if (availableElections.length === 0) return null;

    const mostRecentElection = availableElections[0]; // Already sorted by date
    const comparison = compareElections(currentElection, mostRecentElection.id);

    if (!comparison) return null;

    const significantChanges = Object.entries(comparison.trends)
      .filter(([, trend]) => trend.isSignificant)
      .map(([metric, trend]) => ({
        metric,
        trend: trend.trend,
        change: trend.change,
        message: `${metric.replace(/([A-Z])/g, " $1").toLowerCase()} ${
          trend.trend === "up" ? "increased" : "decreased"
        } by ${Math.abs(trend.change)} (${Math.abs(
          trend.percentageChange
        ).toFixed(1)}%)`,
      }));

    const upTrends = significantChanges.filter((c) => c.trend === "up").length;
    const downTrends = significantChanges.filter(
      (c) => c.trend === "down"
    ).length;

    const overallTrend =
      upTrends > downTrends
        ? "growing"
        : downTrends > upTrends
        ? "shrinking"
        : "stable";

    return {
      comparedWith: { electionName: mostRecentElection.electionName },
      significantChanges,
      overallTrend,
    };
  }, [currentElection, availableElections, compareElections]);
};
