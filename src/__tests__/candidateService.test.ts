import {
  getAllCandidates,
  getAllActiveCandidates,
  getCandidateById,
  getCandidatesByElection,
  getCandidatesByElectionAndParty,
  isCandidateActive,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  updateCandidateStatuses,
} from "@/src/app/election-commission/candidates/services/candidateService";

import api from "@/src/lib/axios";

jest.mock("@/src/lib/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("candidateService API calls", () => {
  it("fetches all candidates", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await getAllCandidates();

    expect(api.get).toHaveBeenCalledWith("/candidate/api/v1/candidates");
  });

  it("fetches all active candidates", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await getAllActiveCandidates();

    expect(api.get).toHaveBeenCalledWith(
      "/candidate/api/v1/candidates?activeOnly=true"
    );
  });

  it("fetches candidate by id", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: { id: "1" } });

    await getCandidateById("1");

    expect(api.get).toHaveBeenCalledWith(
      "/candidate/api/v1/candidates/1"
    );
  });

  it("fetches candidates by election", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await getCandidatesByElection("e1");

    expect(api.get).toHaveBeenCalledWith(
      "/candidate/api/v1/elections/e1/candidates"
    );
  });

  it("fetches candidates by election and party", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await getCandidatesByElectionAndParty("e1", "demo party");

    expect(api.get).toHaveBeenCalledWith(
      "/candidate/api/v1/elections/e1/candidates/party/demo%20party"
    );
  });

  it("checks if candidate is active", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: true });

    await isCandidateActive("10");

    expect(api.get).toHaveBeenCalledWith(
      "/candidate/api/v1/candidates/10/active"
    );
  });

  it("creates a candidate", async () => {
    const payload = {
      candidateName: "John",
      partyName: "Party",
      partyColor: "#fff",
    } as any;

    (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: "new" } });

    await createCandidate(payload);

    expect(api.post).toHaveBeenCalledWith(
      "/candidate/api/v1/candidates/create",
      expect.objectContaining({ candidateName: "John" })
    );
  });

  it("updates a candidate", async () => {
    const update = { candidateName: "Jane" } as any;

    (api.put as jest.Mock).mockResolvedValueOnce({ data: { id: "u" } });

    await updateCandidate("u", update);

    expect(api.put).toHaveBeenCalledWith(
      "/candidate/api/v1/candidates/u/update",
      expect.objectContaining(update)
    );
  });

  it("deletes a candidate", async () => {
    (api.delete as jest.Mock).mockResolvedValueOnce({});

    await deleteCandidate("d1");

    expect(api.delete).toHaveBeenCalledWith(
      "/candidate/api/v1/candidates/d1/delete"
    );
  });

  it("triggers status update", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({});

    await updateCandidateStatuses();

    expect(api.post).toHaveBeenCalledWith(
      "/candidate/api/v1/admin/update-statuses"
    );
  });
});

// Error handling sample test to ensure message propagation

describe("candidateService error handling", () => {
  it("throws formatted error message on failure", async () => {
    const error = {
      response: { data: { message: "failed" } },
    };
    (api.get as jest.Mock).mockRejectedValueOnce(error);

    await expect(getAllCandidates()).rejects.toThrow("failed");
  });
});
