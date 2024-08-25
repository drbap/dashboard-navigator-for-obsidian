import { Plugin } from 'obsidian';
import { DNSettingTab } from './settings';
import { DNModal } from './dn';

interface DNSettings {
	default_view: number;
	font_size: number;
	selected_table_layout: string;
	date_format: string;
	files_per_page: number;
	num_recent_files: number;
	excluded_ext: string;
	excluded_path: string;
	color_notes: string;
	color_canvas: string;
	color_images: string;
	color_videos: string;
	color_audios: string;
	color_pdf: string;
	color_other: string;
	colored_files: boolean;
}

export const DEFAULT_SETTINGS: DNSettings = {
	default_view: 1,
	font_size: 16,
	selected_table_layout: 'dn-tbl-default',
	date_format: 'YYYY-MM-DD HH:mm',
	files_per_page: 20,
	num_recent_files: 5,
	excluded_ext: '',
	excluded_path: '',
	color_notes: '#bf48ff',
	color_images: '#007fff',
	color_canvas: '#ff7f28',
	color_videos: '#d34848',
	color_audios: '#bfbf00',
	color_pdf: '#00a300',
	color_other: '#828282',
	colored_files: false
}

export default class DNPlugin extends Plugin {

	_DN_MODAL: DNModal;

	settings: DNSettings;

	async onload() {

		await this.loadSettings();

		this._DN_MODAL = new DNModal(this.app);

		// Set modal settings
		this._DN_MODAL.default_view = this.settings.default_view;
		this._DN_MODAL.date_format = this.settings.date_format;
		this._DN_MODAL.num_recent_files = this.settings.num_recent_files;
		this._DN_MODAL.files_per_page = this.settings.files_per_page;
		this._DN_MODAL.selected_table_layout = this.settings.selected_table_layout;
		this._DN_MODAL.excluded_extensions = this.dnGetExcludedExtensions(this.settings.excluded_ext);
		this._DN_MODAL.excluded_folders = this.dnGetExcludedFolders(this.settings.excluded_path);
		this.dnSetFontSize(this.settings.font_size);
		// Set colors
		this._DN_MODAL.colored_files = this.settings.colored_files;
		this._DN_MODAL.color_notes = this.settings.color_notes;
		this._DN_MODAL.color_canvas = this.settings.color_canvas;
		this._DN_MODAL.color_images = this.settings.color_images;
		this._DN_MODAL.color_videos = this.settings.color_videos;
		this._DN_MODAL.color_audios = this.settings.color_audios;
		this._DN_MODAL.color_pdf = this.settings.color_pdf;
		this._DN_MODAL.color_other = this.settings.color_other;

		this.addRibbonIcon('gauge', 'Open dashboard navigator', (evt: MouseEvent) => {
			this._DN_MODAL.default_view = this.settings.default_view;
			this._DN_MODAL.open();
		});


		this.addCommand({
			id: 'activate',
			name: 'Open',
			callback: () => {
				this._DN_MODAL.default_view = this.settings.default_view;
				this._DN_MODAL.open();
			}
		});

		this.addCommand({
			id: 'dashboard',
			name: 'Open dashboard',
			callback: () => {
				this._DN_MODAL.default_view = 1;
				this._DN_MODAL.open();
			}
		});

		this.addCommand({
			id: 'navigator',
			name: 'Open navigator',
			callback: () => {
				this._DN_MODAL.default_view = 2;
				this._DN_MODAL.open();
			}
		});

		this.addSettingTab(new DNSettingTab(this.app, this));

	}

	dnGetExcludedFolders(foldersString: string): string[] {
		if (foldersString === '') {
			return [];
		}

		const folders = foldersString.split(',').map(folder => folder.trim());

		return folders.map(folder => folder.replace(/^\/|\/$|\.\./g, '')).filter(folder => folder !== '');
	}

	dnSetFontSize(val: number) {
		if (val >= 12 || val <= 24) {
			const styles = getComputedStyle(document.body);
			const fontSize = styles.getPropertyValue('--dn-font-size');
			document.body.style.setProperty('--dn-font-size', val.toString() + 'px');
		}
	}

	dnGetExcludedExtensions(excluded_ext: string): string[] {
		if (excluded_ext === '') {
			return [];
		}

		return excluded_ext.split(',').map(extension => extension.trim());
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



