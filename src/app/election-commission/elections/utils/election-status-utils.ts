import { Election, ElectionStatus } from '../election.types';

export const calculateRealTimeElectionStatus = (election: Election): ElectionStatus => {
  if (election.status === 'Cancelled') return 'Cancelled';

  const now = new Date();
  
  const toDate = (simpleDate?: { year: number; month: number; day: number }) => {
    if (!simpleDate) return null;
    return new Date(simpleDate.year, simpleDate.month - 1, simpleDate.day);
  };

  const toMinutes = (time?: { hour: number; minute: number }) => {
    if (!time) return null;
    return time.hour * 60 + time.minute;
  };

  const startDate = toDate(election.startDate);
  const electionDate = toDate(election.electionDate);
  const startTime = toMinutes(election.startTime);
  const endTime = toMinutes(election.endTime);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!startDate && !electionDate) return election.status || 'Scheduled';

  // Scheduled: start date is after today
  if (startDate && startDate > today) return 'Scheduled';

  // Upcoming: today is between start date and election date but before voting starts
  if (startDate && electionDate && startTime !== null) {
    const isAfterStartDate = startDate <= today;
    const isBeforeElectionDate = today < electionDate;
    const isOnElectionDateButBeforeStartTime = 
      today.getTime() === electionDate.getTime() && currentMinutes < startTime;

    if (isAfterStartDate && (isBeforeElectionDate || isOnElectionDateButBeforeStartTime)) {
      return 'Upcoming';
    }
  }

  // Active: today is election date and now is between start and end time
  if (electionDate && startTime !== null && endTime !== null) {
    const isElectionDay = today.getTime() === electionDate.getTime();
    const isDuringVotingHours = currentMinutes >= startTime && currentMinutes <= endTime;

    if (isElectionDay && isDuringVotingHours) return 'Active';
  }

  // Completed: now is after election date end time
  if (electionDate && endTime !== null) {
    const isAfterElectionDate = today > electionDate;
    const isElectionDayAfterEndTime = 
      today.getTime() === electionDate.getTime() && currentMinutes > endTime;

    if (isAfterElectionDate || isElectionDayAfterEndTime) return 'Completed';
  }

  return election.status || 'Scheduled';
};

export const calculateElectionStats = (elections: Election[]) => {
  const stats = elections.reduce((acc, election) => {
    const realTimeStatus = calculateRealTimeElectionStatus(election);
    
    switch (realTimeStatus) {
      case 'Active':
        acc.active.push(election);
        break;
      case 'Upcoming':
        acc.upcoming.push(election);
        break;
      case 'Completed':
        acc.completed.push(election);
        break;
      case 'Scheduled':
        acc.scheduled.push(election);
        break;
      case 'Cancelled':
        acc.cancelled.push(election);
        break;
    }
    
    return acc;
  }, {
    active: [] as Election[],
    upcoming: [] as Election[],
    completed: [] as Election[],
    scheduled: [] as Election[],
    cancelled: [] as Election[],
  });

  return {
    totalCount: elections.length,
    activeElections: stats.active,
    upcomingElections: stats.upcoming,
    completedElections: stats.completed,
    scheduledElections: stats.scheduled,
    cancelledElections: stats.cancelled,
    activeCount: stats.active.length,
    upcomingCount: stats.upcoming.length,
    completedCount: stats.completed.length,
    scheduledCount: stats.scheduled.length,
    cancelledCount: stats.cancelled.length,
  };
};
