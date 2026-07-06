import { moment, normalizePath, TFile } from "obsidian";
import type { DailyChatSettings } from "./settings";

export function isDailyNoteFile(
	file: TFile,
	settings: Pick<DailyChatSettings, "dailyNoteDateFormat" | "dailyNoteFolder">,
): boolean {
	if (file.extension !== "md") {
		return false;
	}

	if (!isInDailyNoteFolder(file, settings.dailyNoteFolder)) {
		return false;
	}

	return moment(file.basename, settings.dailyNoteDateFormat, true).isValid();
}

function isInDailyNoteFolder(file: TFile, folder: string): boolean {
	const normalizedFolder = normalizePath(folder).replace(/\/$/, "");
	if (!normalizedFolder) {
		return true;
	}

	return getParentPath(file.path) === normalizedFolder;
}

function getParentPath(path: string): string {
	const slashIndex = path.lastIndexOf("/");
	return slashIndex === -1 ? "" : path.slice(0, slashIndex);
}
