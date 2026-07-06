export const postFormatMap = {
	コードブロック: { type: "codeblock" },
	見出し1: { type: "header", level: 1 },
	見出し2: { type: "header", level: 2 },
	見出し3: { type: "header", level: 3 },
	見出し4: { type: "header", level: 4 },
	見出し5: { type: "header", level: 5 },
	見出し6: { type: "header", level: 6 },
} as const;

export const POST_FORMAT_OPTIONS = Object.keys(postFormatMap) as PostFormatOption[];

export const postFormatLabels: Record<PostFormatOption, string> = {
	コードブロック: "Code block",
	見出し1: "Heading 1",
	見出し2: "Heading 2",
	見出し3: "Heading 3",
	見出し4: "Heading 4",
	見出し5: "Heading 5",
	見出し6: "Heading 6",
};

export type PostFormatOption = keyof typeof postFormatMap;

export interface BuildDailyChatEntryOptions {
	input: string;
	postFormatOption: PostFormatOption;
	timestamp: string;
}

export function isPostFormatOption(value: unknown): value is PostFormatOption {
	return typeof value === "string" && value in postFormatMap;
}

export function buildDailyChatEntry({
	input,
	postFormatOption,
	timestamp,
}: BuildDailyChatEntryOptions): string {
	const content = input.trim();
	const postFormat = postFormatMap[postFormatOption];

	if (postFormat.type === "codeblock") {
		return `\n\`\`\`\`fw ${timestamp}\n${content}\n\`\`\`\`\n`;
	}

	return `\n${"#".repeat(postFormat.level)} ${timestamp}\n\n${content}\n`;
}
