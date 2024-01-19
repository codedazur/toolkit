import { describe, expect, it } from "vitest";
import { timecode } from "./timecode";

describe("timecode", () => {
  it("converts seconds to hh:mm:ss", () => {
    expect(timecode(0)).toBe("00:00:00");
    expect(timecode(1)).toBe("00:00:01");
    expect(timecode(59)).toBe("00:00:59");
    expect(timecode(60)).toBe("00:01:00");
    expect(timecode(61)).toBe("00:01:01");
    expect(timecode(3599)).toBe("00:59:59");
    expect(timecode(3600)).toBe("01:00:00");
    expect(timecode(3601)).toBe("01:00:01");
  });

  it("converts seconds to mm:ss", () => {
    expect(timecode.minutes(0)).toBe("00:00");
    expect(timecode.minutes(1)).toBe("00:01");
    expect(timecode.minutes(59)).toBe("00:59");
    expect(timecode.minutes(60)).toBe("01:00");
    expect(timecode.minutes(61)).toBe("01:01");
    expect(timecode.minutes(3599)).toBe("59:59");
    expect(timecode.minutes(3600)).toBe("60:00");
    expect(timecode.minutes(3601)).toBe("60:01");
  });
});
