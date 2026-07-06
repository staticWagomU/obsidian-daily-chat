import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import type DailyChatPlugin from "./main";
import {
	POST_FORMAT_OPTIONS,
	PostFormatOption,
	isPostFormatOption,
	postFormatLabels,
} from "./post-format";

export interface DailyChatSettings {
	dailyNoteDateFormat: string;
	dailyNoteFolder: string;
	postFormatOption: PostFormatOption;
}

export const DEFAULT_SETTINGS: DailyChatSettings = {
	dailyNoteDateFormat: "YYYY-MM-DD",
	dailyNoteFolder: "",
	postFormatOption: "コードブロック",
};

export function normalizeSettings(data: unknown): DailyChatSettings {
	const loaded = isRecord(data) ? data : {};
	const postFormatOption = loaded.postFormatOption;

	return {
		dailyNoteDateFormat: stringOrDefault(
			loaded.dailyNoteDateFormat,
			DEFAULT_SETTINGS.dailyNoteDateFormat,
		),
		dailyNoteFolder: normalizeFolder(
			stringOrDefault(loaded.dailyNoteFolder, DEFAULT_SETTINGS.dailyNoteFolder),
		),
		postFormatOption: isPostFormatOption(postFormatOption)
			? postFormatOption
			: DEFAULT_SETTINGS.postFormatOption,
	};
}

export class DailyChatSettingTab extends PluginSettingTab {
	plugin: DailyChatPlugin;

	constructor(app: App, plugin: DailyChatPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Daily note date format")
			.setDesc("File name date format used to detect daily notes.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.dailyNoteDateFormat)
					.setValue(this.plugin.settings.dailyNoteDateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteDateFormat =
							value.trim() || DEFAULT_SETTINGS.dailyNoteDateFormat;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Daily note folder")
			.setDesc("Optional folder path. Leave empty to match daily notes in any folder.")
			.addText((text) =>
				text
					.setPlaceholder("Daily notes")
					.setValue(this.plugin.settings.dailyNoteFolder)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteFolder = normalizeFolder(value);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Post format")
			.setDesc("Markdown format for appended posts.")
			.addDropdown((dropdown) => {
				for (const option of POST_FORMAT_OPTIONS) {
					dropdown.addOption(option, postFormatLabels[option]);
				}

				dropdown.setValue(this.plugin.settings.postFormatOption).onChange(async (value) => {
					if (!isPostFormatOption(value)) {
						return;
					}
					this.plugin.settings.postFormatOption = value;
					await this.plugin.saveSettings();
				});
			});
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function stringOrDefault(value: unknown, fallback: string): string {
	return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeFolder(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		return "";
	}

	return normalizePath(trimmed).replace(/\/$/, "");
}
