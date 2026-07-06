import { MarkdownView, moment, Platform, Plugin, TFile } from "obsidian";
import { DailyChatInputBar } from "./ui/chat-input-bar";
import { isDailyNoteFile } from "./daily-note";
import { buildDailyChatEntry } from "./post-format";
import {
	DEFAULT_SETTINGS,
	DailyChatSettingTab,
	DailyChatSettings,
	normalizeSettings,
} from "./settings";

export default class DailyChatPlugin extends Plugin {
	settings: DailyChatSettings = DEFAULT_SETTINGS;
	private inputBars = new Map<MarkdownView, DailyChatInputBar>();
	private isReady = false;

	async onload(): Promise<void> {
		if (Platform.isMobile) {
			return;
		}

		await this.loadSettings();
		this.isReady = true;

		this.addSettingTab(new DailyChatSettingTab(this.app, this));

		this.addCommand({
			id: "focus-daily-chat-input",
			name: "Focus chat input",
			checkCallback: (checking) => {
				const hasInput = this.getActiveInputBar() !== null;
				if (!hasInput) {
					return false;
				}
				if (!checking) {
					this.getActiveInputBar()?.focus();
				}
				return true;
			},
		});

		this.app.workspace.onLayoutReady(() => {
			if (this.isReady) {
				this.syncInputBars();
			}
		});
		this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.syncInputBars()));
		this.registerEvent(this.app.workspace.on("file-open", () => this.syncInputBars()));
		this.registerEvent(this.app.workspace.on("layout-change", () => this.syncInputBars()));
		this.registerEvent(this.app.vault.on("rename", () => this.syncInputBars()));
		this.registerEvent(this.app.vault.on("delete", () => this.syncInputBars()));
		this.register(() => {
			this.isReady = false;
			this.clearInputBars();
		});
	}

	refreshInputBars(): void {
		this.syncInputBars();
	}

	async appendChatEntry(view: MarkdownView, input: string): Promise<void> {
		const file = view.file;
		if (!(file instanceof TFile) || !isDailyNoteFile(file, this.settings)) {
			throw new Error("Open a daily note before posting.");
		}

		const entry = buildDailyChatEntry({
			input,
			postFormatOption: this.settings.postFormatOption,
			timestamp: moment().toISOString(true),
		});

		await this.app.vault.append(file, entry);
	}

	async loadSettings(): Promise<void> {
		this.settings = normalizeSettings(await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.refreshInputBars();
	}

	private syncInputBars(): void {
		const visibleViews = new Set<MarkdownView>();

		this.app.workspace.iterateAllLeaves((leaf) => {
			if (!(leaf.view instanceof MarkdownView)) {
				return;
			}

			const view = leaf.view;
			visibleViews.add(view);
			this.syncInputBarForView(view);
		});

		for (const view of this.inputBars.keys()) {
			if (!visibleViews.has(view)) {
				this.removeInputBar(view);
			}
		}
	}

	private syncInputBarForView(view: MarkdownView): void {
		const file = view.file;
		const shouldShow = file instanceof TFile && isDailyNoteFile(file, this.settings);
		const alreadyShown = this.inputBars.has(view);

		if (shouldShow && !alreadyShown) {
			this.addInputBar(view);
			return;
		}

		if (!shouldShow && alreadyShown) {
			this.removeInputBar(view);
		}
	}

	private addInputBar(view: MarkdownView): void {
		const inputBar = new DailyChatInputBar(this, view);
		this.addChild(inputBar);
		this.inputBars.set(view, inputBar);
	}

	private removeInputBar(view: MarkdownView): void {
		const inputBar = this.inputBars.get(view);
		if (!inputBar) {
			return;
		}

		this.removeChild(inputBar);
		this.inputBars.delete(view);
	}

	private clearInputBars(): void {
		for (const view of Array.from(this.inputBars.keys())) {
			this.removeInputBar(view);
		}
	}

	private getActiveInputBar(): DailyChatInputBar | null {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			return null;
		}

		return this.inputBars.get(view) ?? null;
	}
}
