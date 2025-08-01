import React from 'react';
import { render } from '@testing-library/react';

// Mock RoleGuard to simply render children
jest.mock('@/components/auth/RoleGuard', () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

// No-op for next/image in tests (already mocked in jest.setup but double-ensure)
jest.mock('next/image', () => (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || 'image'} />;
});

import ChiefOccupantDashboard from '../app/chief-occupant/dashboard/page';

describe('ChiefOccupantDashboard UI', () => {
  it('renders consistently (snapshot)', () => {
    const { container } = render(<ChiefOccupantDashboard />);
    expect(container).toMatchSnapshot();
  });
});
