import React from 'react';
import { render } from '@testing-library/react';

// Mock next/image
jest.mock('next/image', () => (props: any) => <img {...props} alt={props.alt || 'image'} />);

// Mock RoleGuard to render children directly
jest.mock('@/components/auth/RoleGuard', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock data-fetching hooks used inside the dashboard
jest.mock('../app/election-commission/elections/hooks/use-elections', () => ({
  useElections: () => ({
    data: {
      elections: [],
      totalCount: 0,
      activeElections: [],
      upcomingElections: [],
      upcomingCount: 0,
      activeCount: 0,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('../app/election-commission/candidates/hooks/use-candidates', () => ({
  useCandidates: () => ({
    data: {
      candidates: [],
      totalCandidates: 0,
      activeCandidates: 0,
      partiesCount: 0,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

import ElectionCommissionDashboard from '../app/election-commission/dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('ElectionCommissionDashboard UI snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ElectionCommissionDashboard />
      </QueryClientProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
