import { logout } from "../lib/auth";
import api from "../lib/axios";

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(() => Promise.resolve({ status: 204 })),
    defaults: { headers: { common: { Authorization: "Bearer abc" } } },
  },
}));

describe("logout helper", () => {
  beforeEach(() => {
    // Use the global localStorage mock from jest.setup.ts
    (window.localStorage.getItem as jest.Mock).mockReturnValue("abc");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls backend, clears storage and auth header", async () => {
    await logout();

    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/logout",
      null,
      expect.any(Object)
    );

    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("userType");
  });
});