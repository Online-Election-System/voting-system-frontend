import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/image to avoid errors
jest.mock('next/image', () => (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || 'image'} />;
});

// Mock the file-upload hook so we don't actually hit Supabase/storage
const mockUpload = jest.fn(() => Promise.resolve('https://example.com/doc.pdf'));

jest.mock('@/src/app/register/hooks/use-file-upload-hook', () => ({
  useFileUpload: () => ({
    uploadFileToFolder: mockUpload,
    uploading: false,
    progress: 0,
    error: null,
    resetUploadState: jest.fn(),
    cleanupSpecificFile: jest.fn(),
  }),
}));

// Components under test
import { UpdateHouseholdMemberForm } from '../app/chief-occupant/household-management/manage/updateform';
import { DeleteHouseholdMemberDialog } from '../app/chief-occupant/household-management/manage/removeform';

// Helper data
const chief = { memberId: 'c1', fullName: 'Chief One', nic: 'NIC1' } as any;
const members = [
  { memberId: 'm1', memberName: 'Member One', nic: 'NICM1', relationship: 'Child' },
  { memberId: 'm2', memberName: 'Member Two', nic: 'NICM2', relationship: 'Spouse' },
] as any[];

beforeEach(() => {
  // Provide a stub fetch implementation for each test case
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ requestId: 'r1' }),
  });
});

afterEach(() => {
  // Reset and clean up fetch mock between tests
  (global.fetch as jest.Mock).mockReset();
  delete (global as any).fetch;
  jest.clearAllMocks();
});

describe('UpdateHouseholdMemberForm interactions', () => {
  it('submits update request with correct payload', async () => {
    render(
      <UpdateHouseholdMemberForm householdMembers={members} chiefOccupant={chief} />
    );

    // Select member
    const memberTwoOption = await screen.findByText(/Member Two/i);
    await userEvent.click(memberTwoOption);

    // Mock file upload via input change
    const fileInput = screen.getByLabelText(/supporting document/i) as HTMLInputElement;
    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    await userEvent.upload(fileInput, file);

    // Wait until upload mock called and button enabled
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    const submitBtn = screen.getByRole('button', { name: /submit update request/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/update-member'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });
  });

  it('shows error when trying to submit without document', async () => {
    render(
      <UpdateHouseholdMemberForm householdMembers={members} chiefOccupant={chief} />
    );

    // choose member but skip upload
    const memberTwoOption = await screen.findByText(/Member Two/i);
    await userEvent.click(memberTwoOption);

    const submitBtn = screen.getByRole('button', { name: /submit update request/i });
    // Button should be disabled because no documentUrl
    expect(submitBtn).toBeDisabled();
  });
});

describe('DeleteHouseholdMemberDialog interactions', () => {
  it('opens dialog and submits delete request', async () => {
    render(
      <DeleteHouseholdMemberDialog
        chiefOccupant={chief}
        householdMembers={members}
      />
    );

    // Open dialog via trigger
    await userEvent.click(screen.getByRole('button', { name: /delete member/i }));

    // Select member to delete
    const memberTwoOption = await screen.findByText(/Member Two/i);
    await userEvent.click(memberTwoOption);

    // Upload file to satisfy requirement
    const fileInput = screen.getByLabelText(/supporting document/i) as HTMLInputElement;
    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    await userEvent.upload(fileInput, file);
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    // Confirm Delete button
    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/delete-member'),
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      );
    });
  });

  it('keeps confirm disabled without selection or document', async () => {
    render(
      <DeleteHouseholdMemberDialog chiefOccupant={chief} householdMembers={members} />
    );

    await userEvent.click(screen.getByRole('button', { name: /delete member/i }));

    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    expect(confirmBtn).toBeDisabled();
  });
});
