import { describe, expect, it } from "vitest";
import { buildDailyChatEntry } from "./post-format";

describe("buildDailyChatEntry", () => {
	it("builds the MFDI code block format", () => {
		expect(
			buildDailyChatEntry({
				input: " hello ",
				postFormatOption: "コードブロック",
				timestamp: "2026-07-07T10:20:30+09:00",
			}),
		).toBe("\n````fw 2026-07-07T10:20:30+09:00\nhello\n````\n");
	});

	it("builds the MFDI heading format", () => {
		expect(
			buildDailyChatEntry({
				input: "hello",
				postFormatOption: "見出し3",
				timestamp: "2026-07-07T10:20:30+09:00",
			}),
		).toBe("\n### 2026-07-07T10:20:30+09:00\n\nhello\n");
	});
});
