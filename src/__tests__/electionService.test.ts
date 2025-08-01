import {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
} from "@/src/app/election-commission/elections/services/electionService";

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

describe("electionService API calls", () => {
  it("fetches elections", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await getElections();

    expect(api.get).toHaveBeenCalledWith("/election/api/v1/elections");
  });

  it("fetches election by id", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: { id: "e1" } });

    await getElectionById("e1");

    expect(api.get).toHaveBeenCalledWith("/election/api/v1/elections/e1");
  });

  it("creates an election", async () => {
    const data = { electionName: "Test" } as any;

    (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: "c1" } });

    await createElection(data);

    expect(api.post).toHaveBeenCalledWith(
      "/election/api/v1/elections/create",
      data
    );
  });

  it("updates an election", async () => {
    const update = { electionName: "New" } as any;

    (api.put as jest.Mock).mockResolvedValueOnce({ data: { id: "u" } });

    await updateElection("u", update);

    expect(api.put).toHaveBeenCalledWith(
      "/election/api/v1/elections/u/update",
      expect.objectContaining(update)
    );
  });

  it("deletes an election", async () => {
    (api.delete as jest.Mock).mockResolvedValueOnce({});

    await deleteElection("d1");

    expect(api.delete).toHaveBeenCalledWith(
      "/election/api/v1/elections/d1/delete"
    );
  });
});

// Error handling test

describe("electionService error handling", () => {
  it("throws formatted error on failure", async () => {
    const err = { response: { data: { message: "oops" } } };
    (api.get as jest.Mock).mockRejectedValueOnce(err);

    await expect(getElections()).rejects.toThrow("oops");
  });
});
