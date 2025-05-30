'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CandidateCard } from '@/components/candidate-card';

interface Candidate {
  id: number;
  name: string;
  party: string;
  bio: string;
  image: string;
}

interface ElectionDetails {
  id: number;
  name: string;
  description: string;
  startDate: string;
  enrolDeadline: string;
  electionDate: string;
  endDate: string;
  noOfCandidates: number;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function ElectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchElectionAndCandidates() {
      try {
        const res = await fetch(`http://localhost:8081/elections/${id}/candidates`);
        const data = await res.json();

        if (data.success) {
          setElection(data.data.election);
          setCandidates(data.data.candidates);
        } else {
          setError(data.message || 'Failed to fetch election details.');
        }
      } catch (err) {
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }

    fetchElectionAndCandidates();
  }, [id]);

  if (loading) return <p className="p-4 text-gray-500">Loading election details...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!election) return <p className="p-4 text-gray-500">Election not found.</p>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{election.name}</h1>
        <p className="text-gray-700 mt-2">{election.description}</p>
        <p className="text-sm text-gray-500 mt-1">
          Start Date: {election.startDate} | Election Date: {election.electionDate} | End Date: {election.endDate}
        </p>
        <p className="text-sm text-gray-500">Type: {election.type} | Status: {election.status}</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Candidates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <p className="text-gray-600">No candidates found for this election.</p>
          )}
        </div>
      </div>
    </div>
  );
}
