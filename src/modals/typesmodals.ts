import { TFile } from "obsidian";

export interface DNModalHelpers {

	handleTagActions?: (evt: MouseEvent, tag: string) => void;
	dnOpenFile?: (file: TFile) => void;
	dnModalSearchVault?: (str: string) => void;
	mainInputSearch?: HTMLInputElement;
	dateFormat?: string;
}