import { Component, MarkdownView, Notice, setIcon } from "obsidian";
import type DailyChatPlugin from "../main";

export class DailyChatInputBar extends Component {
	private containerEl: HTMLElement | null = null;
	private textareaEl: HTMLTextAreaElement | null = null;
	private submitButtonEl: HTMLButtonElement | null = null;
	private isSubmitting = false;

	constructor(
		private readonly plugin: DailyChatPlugin,
		private readonly view: MarkdownView,
	) {
		super();
	}

	onload(): void {
		this.view.containerEl.addClass("daily-chat-view-container");

		const containerEl = this.view.containerEl.createDiv({ cls: "daily-chat-input-bar" });
		const formEl = containerEl.createEl("form", { cls: "daily-chat-input-bar__form" });
		const textareaEl = formEl.createEl("textarea", {
			cls: "daily-chat-input-bar__textarea",
			attr: {
				placeholder: "思ったことなどを記入",
				rows: "2",
			},
		});
		const submitButtonEl = formEl.createEl("button", {
			cls: "daily-chat-input-bar__submit",
			attr: {
				"aria-label": "投稿",
				title: "投稿",
				type: "submit",
			},
		});
		setIcon(submitButtonEl, "send");

		this.containerEl = containerEl;
		this.textareaEl = textareaEl;
		this.submitButtonEl = submitButtonEl;
		this.updateSubmitButton();

		this.registerDomEvent(textareaEl, "input", () => this.updateSubmitButton());
		this.registerDomEvent(textareaEl, "keydown", (event) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
				event.preventDefault();
				void this.submit();
			}
		});
		this.registerDomEvent(formEl, "submit", (event) => {
			event.preventDefault();
			void this.submit();
		});
	}

	onunload(): void {
		this.containerEl?.remove();
		this.containerEl = null;
		this.textareaEl = null;
		this.submitButtonEl = null;
		this.view.containerEl.removeClass("daily-chat-view-container");
	}

	focus(): void {
		this.textareaEl?.focus();
	}

	private async submit(): Promise<void> {
		if (this.isSubmitting || !this.textareaEl) {
			return;
		}

		const input = this.textareaEl.value;
		if (!input.trim()) {
			return;
		}

		this.isSubmitting = true;
		this.updateSubmitButton();

		try {
			await this.plugin.appendChatEntry(this.view, input);
			this.textareaEl.value = "";
			this.textareaEl.focus();
		} catch (error) {
			new Notice(
				error instanceof Error ? error.message : "Failed to append daily chat entry.",
			);
		} finally {
			this.isSubmitting = false;
			this.updateSubmitButton();
		}
	}

	private updateSubmitButton(): void {
		if (!this.submitButtonEl || !this.textareaEl) {
			return;
		}

		this.submitButtonEl.disabled = this.isSubmitting || !this.textareaEl.value.trim();
	}
}
