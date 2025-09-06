import { Plugin } from 'obsidian';
import { DNSettingTab } from './settings';
import { DNModal } from './dn';
import { DNSaveSearchModal, DNSaveSearchItem } from './modals/dnsavesearchmodal';
import { DNSavedSearchesModal } from './modals/dnsavedsearchesmodal';
import { DNInfoModal } from './modals/dninfomodal';
import { DNQuickDisplayOptionsModal } from './modals/dnquickdisplayoptionsmodal';
import { DNDataManager } from 'src/data/dndatamanager';

interface DNSettings {
	default_view: number;
	font_size: number;
	selected_table_layout: string;
	date_format: string;
	files_per_page: number;
	num_recent_files: number;
	num_bookmarked_files: number;
	excluded_ext: string;
	excluded_path: string;
	color_notes: string;
	color_canvas: string;
	color_images: string;
	color_videos: string;
	color_audios: string;
	color_pdf: string;
	color_bases: string;
	color_other: string;
	colored_files: boolean;
	hide_ext: boolean;
	hide_path: boolean;
	hide_size: boolean;
	hide_date: boolean;
	hide_tags: boolean;
	hide_frontmatter: boolean;
	hide_backlinks: boolean;
	hide_outgoing: boolean;
	hide_columns: string[];
	show_dashboard_piechart: boolean;
	image_thumbnail: boolean;
	thumbnail_size: number;
	primary_tags_results_visible: boolean;
	tags_sidebar: boolean;
	tags_sidebar_sorted_by_frequency: boolean;
	onclose_search: string,
	saved_searches: DNSaveSearchItem[];
}

export const DEFAULT_SETTINGS: DNSettings = {
	default_view: 1,
	font_size: 16,
	selected_table_layout: 'dn-tbl-default',
	date_format: 'YYYY-MM-DD HH:mm',
	files_per_page: 20,
	num_recent_files: 5,
	num_bookmarked_files: 10,
	excluded_ext: '',
	excluded_path: '',
	color_notes: '#bf48ff',
	color_images: '#007fff',
	color_canvas: '#ff7f28',
	color_videos: '#d34848',
	color_audios: '#bfbf00',
	color_pdf: '#00a300',
	color_bases: '#00a3a3',
	color_other: '#828282',
	colored_files: false,
	hide_ext: false,
	hide_path: false,
	hide_size: false,
	hide_date: false,
	hide_tags: false,
	hide_frontmatter: false,
	hide_backlinks: false,
	hide_outgoing: false,
	hide_columns: [],
	show_dashboard_piechart: true,
	image_thumbnail: true,
	thumbnail_size: 82,
	primary_tags_results_visible: true,
	tags_sidebar: true,
	tags_sidebar_sorted_by_frequency: false,
	onclose_search: '',
	saved_searches: []
}

export default class DNPlugin extends Plugin {

	DN_MODAL: DNModal;
	DN_SAVE_SEARCH_MODAL: DNSaveSearchModal;
	DN_SAVED_SEARCHES_MODAL: DNSavedSearchesModal;
	DN_INFO_MODAL: DNInfoModal;
	DN_QUICK_DISPLAY_OPTIONS_MODAL: DNQuickDisplayOptionsModal;

	settings: DNSettings;

	private _DN_DATA_MANAGER: DNDataManager;

	async onload() {

		await this.loadSettings();

		this._DN_DATA_MANAGER = new DNDataManager();

		const excludedExtensions = this.dnGetExcludedExtensions(this.settings.excluded_ext);
		const excludedFolders = this.dnGetExcludedFolders(this.settings.excluded_path);

		this.DN_MODAL = new DNModal(this.app, this, this._DN_DATA_MANAGER);

		this.DN_QUICK_DISPLAY_OPTIONS_MODAL = new DNQuickDisplayOptionsModal(this.app, this);

		this.DN_SAVE_SEARCH_MODAL = new DNSaveSearchModal(this.app, this);
		this.DN_SAVED_SEARCHES_MODAL = new DNSavedSearchesModal(this.app, this);
		this.DN_INFO_MODAL = new DNInfoModal(this.app);

		// Set modal settings
		this.DN_MODAL.default_view = this.settings.default_view;
		this.DN_MODAL.date_format = this.settings.date_format;

		this.DN_MODAL.num_recent_files = this.settings.num_recent_files;
		this.DN_MODAL.num_bookmarked_files = this.settings.num_bookmarked_files;
		this.DN_MODAL.files_per_page = this.settings.files_per_page;

		this.DN_MODAL.selected_table_layout = this.settings.selected_table_layout;
		this.DN_MODAL.excluded_extensions = excludedExtensions;
		this.DN_MODAL.excluded_folders = excludedFolders;
		this.dnSetFontSize(this.settings.font_size);
		this.dnSetThumbnailSize(this.settings.thumbnail_size);
		// Set colors
		this.DN_MODAL.colored_files = this.settings.colored_files;
		this.DN_MODAL.color_notes = this.settings.color_notes;
		this.DN_MODAL.color_canvas = this.settings.color_canvas;
		this.DN_MODAL.color_images = this.settings.color_images;
		this.DN_MODAL.color_videos = this.settings.color_videos;
		this.DN_MODAL.color_audios = this.settings.color_audios;
		this.DN_MODAL.color_pdf = this.settings.color_pdf;
		this.DN_MODAL.color_other = this.settings.color_other;
		this.DN_MODAL.color_bases = this.settings.color_bases;

		this.DN_MODAL.hide_columns = this.dnSetHiddenColumns(this.settings.hide_columns);

		this.DN_MODAL.image_thumbnail = this.settings.image_thumbnail;
		this.DN_MODAL.show_dashboard_piechart = this.settings.show_dashboard_piechart;

		// Tags dashboard preferences
		this.DN_MODAL.primary_tags_results_visible = this.settings.primary_tags_results_visible;
		this.DN_MODAL.tags_sidebar = this.settings.tags_sidebar;
		this.DN_MODAL.tags_sidebar_sorted_by_frequency = this.settings.tags_sidebar_sorted_by_frequency;

		this.addRibbonIcon('gauge', 'Open dashboard navigator', (evt: MouseEvent) => {
			this.DN_MODAL.default_view = this.settings.default_view;
			this.DN_MODAL.open();
		});

		this.addCommand({
			id: 'dashboard',
			name: 'Open dashboard',
			callback: () => {
				this.DN_MODAL.default_view = 1;
				this.DN_MODAL.open();
			}
		});

		this.addCommand({
			id: 'navigator',
			name: 'Open navigator',
			callback: () => {
				this.DN_MODAL.default_view = 2;
				this.DN_MODAL.open();
			}

		});

		this.addCommand({
			id: 'tags',
			name: 'Open tags',
			callback: () => {
				this.DN_MODAL.default_view = 3;
				this.DN_MODAL.open();
			}

		});

		this.addSettingTab(new DNSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			await this._DN_DATA_MANAGER.getDataCache(this.app, excludedExtensions, excludedFolders);
		});

	}

	dnSetThumbnailSize(val: number) {
		if (val >= 50 || val <= 500) {
			document.body.style.setProperty('--dn-thumbnail-size', val.toString() + 'px');
		} else {
			document.body.style.setProperty('--dn-thumbnail-size', '82px');
		}
	}

	dnSetFontSize(val: number) {
		if (val >= 12 || val <= 24) {
			document.body.style.setProperty('--dn-font-size', val.toString() + 'px');
		} else {
			document.body.style.setProperty('--dn-font-size', '16px');
		}
	}

	dnSetHiddenColumns(arrCols: string[]): string[] {
		const allowedCols = ['ext', 'path', 'size', 'date', 'tags', 'frontmatter', 'backlinks', 'outgoing'];
		arrCols = arrCols.filter(col => allowedCols.includes(col));

		if (arrCols.length <= 8 && arrCols.some(col => ['ext', 'path', 'size', 'date', 'tags', 'frontmatter', 'backlinks', 'outgoing'].includes(col))) {
			return arrCols;
		} else {
			this.settings.hide_columns = [];
			this.settings.hide_ext = false;
			this.settings.hide_path = false;
			this.settings.hide_size = false;
			this.settings.hide_date = false;
			this.settings.hide_tags = false;
			this.settings.hide_frontmatter = false;
			this.settings.hide_backlinks = false;
			this.settings.hide_outgoing = false;
			this.saveSettings();
			return [];
		}
	}

	dnUpdateHideColumn(col: string, val: boolean): void {
		const allowedCols = ['ext', 'path', 'size', 'date', 'tags', 'frontmatter', 'backlinks', 'outgoing'];
		if (allowedCols.includes(col) && val === true) {
			if (!this.settings.hide_columns.includes(col)) {
				this.settings.hide_columns.push(col);
				this.DN_MODAL.hide_columns = this.settings.hide_columns;
			}
		} else {
			this.settings.hide_columns = this.settings.hide_columns.filter(c => c !== col);
			this.DN_MODAL.hide_columns = this.settings.hide_columns;
		}
	}

	dnGetExcludedFolders(foldersString: string): string[] {
		if (foldersString === '') {
			return [];
		}

		const folders = foldersString.split(',').map(folder => folder.trim());

		return folders.map(folder => folder.replace(/^\/|\/$|\.\./g, '')).filter(folder => folder !== '');
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
