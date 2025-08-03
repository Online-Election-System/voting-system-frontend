import type { Election, EnrolledCandidate } from '../../elections/election.types';
import type { Candidate } from '../candidate.types';

export const mergeEnrolledCandidatesWithLatestData = (
  election: Election,
  allCandidates: Candidate[]
): Election => {
  if (!election.enrolledCandidates || !allCandidates?.length) {
    return election;
  }

  // Create a map for quick candidate lookup
  const candidatesMap = new Map(
    allCandidates.map(candidate => [
      candidate.candidateId || candidate.id, 
      candidate
    ])
  );

  // Merge enrolled candidates with latest candidate data
  const updatedEnrolledCandidates = election.enrolledCandidates.map((enrolled): EnrolledCandidate => {
    const latestCandidate = candidatesMap.get(enrolled.candidateId);
    
    if (latestCandidate) {
      return {
        ...enrolled,
        // Update with latest candidate information
        candidateName: latestCandidate.candidateName,
        partyName: latestCandidate.partyName,
        // Keep original voting data
        numberOfVotes: enrolled.numberOfVotes,
        electionId: enrolled.electionId,
        candidateId: enrolled.candidateId,
      };
    }
    
    return enrolled; // Return original if no match found
  });

  return {
    ...election,
    enrolledCandidates: updatedEnrolledCandidates,
  };
};
