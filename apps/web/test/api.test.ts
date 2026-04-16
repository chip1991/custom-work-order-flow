import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchHealth } from "../src/api";

describe("fetchHealth", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
  });

  it("returns json on 200", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ ok: true })
    } as Response);

    await expect(fetchHealth("/api")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/health", expect.objectContaining({ credentials: "include" }));
  });

  it("throws on non-2xx", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      text: async () => "boom"
    } as Response);

    await expect(fetchHealth("/api")).rejects.toBeInstanceOf(ApiError);
    await expect(fetchHealth("/api")).rejects.toMatchObject({ status: 500, code: "HTTP_ERROR" });
  });
});
