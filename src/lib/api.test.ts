import { describe, it, expect } from "vitest";
import { validateSeats } from "./api";

describe("seat validation", () => {
  const p = { capacity: 10, availableSeats: 3 };
  it("rejects zero seats", () => expect(() => validateSeats(0, p)).toThrow());
  it("rejects more than available", () => expect(() => validateSeats(4, p)).toThrow("Only 3"));
  it("rejects more than capacity", () => expect(() => validateSeats(11, { capacity: 10, availableSeats: 10 })).toThrow("capacity"));
  it("accepts within available", () => expect(() => validateSeats(3, p)).not.toThrow());
});
