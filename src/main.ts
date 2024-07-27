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
}

export const DEFAULT_SETTINGS: DNSettings = {
	default_view: 1,
	font_size: 16,
	selected_table_layout: 'dn-tbl-default',
	date_format: 'YYYY-MM-DD HH:mm',
	files_per_page: 20,
	num_recent_files: 5
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
		this.dnSetFontSize(this.settings.font_size);

		this.addRibbonIcon('gauge', 'Open dashboard navigator', (evt: MouseEvent) => {
			this._DN_MODAL.open();
		});


		this.addCommand({
			id: 'activate',
			name: 'Open',
			callback: () => {
				this._DN_MODAL.open();
			}
		});

		this.addSettingTab(new DNSettingTab(this.app, this));

	}

	dnSetFontSize(val: number) {
		if (val >= 12 || val <= 24) {
			const styles = getComputedStyle(document.body);
			const fontSize = styles.getPropertyValue('--dn-font-size');
			document.body.style.setProperty('--dn-font-size', val.toString() + 'px');
		}
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

