import { App, debounce, Menu, normalizePath, Notice, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { formatFileSize, getFolderStructure } from './utils/format';
import { getPropsPerFile, getTagsPerFile } from './utils/tags';
import { DNPieChart } from './utils/dnpiechart';
import { DNTableManager } from './utils/dntablemanager';
import { moment } from 'obsidian';
import DNPlugin from './main';
import { DNData, DNDataManager } from './data/dndatamanager';
import { DNTagSuggestions } from './utils/dntagsuggestions';
import { getBacklinksToFile, getOutgoingLinks } from './utils/dnlinks';
import { DNSpecialBacklinksModal } from './modals/filemodals/dnspecialbacklinksmodal';
import { DNSpecialOutgoingLinksModal } from './modals/filemodals/dnspecialoutgoinglinksmodal';
import { DNFileTagsModal } from './modals/filemodals/dnfiletagsmodal.ts';
import { DNBaseModal } from './modals/dnbasemodal';
import { DNFileFrontmatterModal } from './modals/filemodals/dnfilefrontmattermodal';
import { DNFilePropertiesModal } from './modals/filemodals/dnfilepropertiesmodal';
import { DNPreviewModal } from './modals/filemodals/dnpreviewmodal';

export class DNModal extends DNBaseModal {

	private _files: TFile[];
	private _folders: TFolder[];
	private _recent: TFile[];
	private _last_opened: TFile[];
	private _bookmarks: TFile[];
	private _recent_files_tags: TFile[] = [];

	//Categories
	private _notes: TFile[];
	private _images: TFile[];
	private _canvas: TFile[];
	private _audios: TFile[];
	private _videos: TFile[];
	private _pdf: TFile[];
	private _other: TFile[];
	private _bases: TFile[];

	private _BTN_DASHBOARD: HTMLButtonElement;
	private _BTN_NAVIGATOR: HTMLButtonElement;
	private _BTN_TAGS: HTMLButtonElement;


	private _VIEW_DASHBOARD: HTMLElement;
	private _VIEW_NAVIGATOR: HTMLElement;
	private _VIEW_TAGS: HTMLDivElement;


	INPUT_SEARCH: HTMLInputElement;
	private _divSearchResults: HTMLDivElement;
	SEARCH_INPUT_CONTAINER: HTMLDivElement;

	private _leaf: WorkspaceLeaf;

	private _files_excluded_filters: TFile[];
	private _files_results: TFile[];

	private _sort_order = 'desc';
	private _sort_column = 'modified';

	private _thThumb: HTMLTableCellElement;
	private _th1: HTMLTableCellElement;
	private _th2: HTMLTableCellElement;
	private _th3: HTMLTableCellElement;
	private _th4: HTMLTableCellElement;
	private _th5: HTMLTableCellElement;
	private _th6: HTMLTableCellElement;
	private _th7: HTMLTableCellElement;
	private _th_bl: HTMLTableCellElement;
	private _th_ol: HTMLTableCellElement;

	private _total_pages: number;

	private _SELECT_SORT: HTMLSelectElement;
	private _SELECT_TABLE_LAYOUT: HTMLSelectElement;

	private _selected_category = '';
	private _TABLE_LAYOUTS: string[] = ['dn-tbl-default', 'dn-tbl-row', 'dn-tbl-column', 'dn-tbl-bordered', 'dn-tbl-cards'];

	selected_table_layout = 'dn-tbl-default';
	selected_sort_value = 'modified-desc';

	current_page = 1;
	num_recent_files = 5;
	num_bookmarked_files = 10;
	files_per_page = 20;
	date_format = 'YYYY-MM-DD HH:mm';
	default_view = 1;
	excluded_extensions: string[] = [];
	excluded_folders: string[] = [];
	// File colors
	color_notes = '#bf48ff';
	color_images = '#007fff';
	color_canvas = '#ff7f28';
	color_videos = '#d34848';
	color_audios = '#bfbf00';
	color_pdf = '#00a300';
	color_other = '#828282';
	color_bases = '#00a3a3';
	colored_files = false;

	// Hide columns
	hide_columns: string[] = [];

	image_thumbnail = false;

	show_dashboard_piechart = true;

	remember_last_search = true;

	onclose_search = '';

	labelLayout: HTMLSpanElement;
	labelSort: HTMLSpanElement;

	private readonly intersectionObserver: IntersectionObserver;
	private _DN_CTX_MENU: Menu | null = null;

	private activePreview: DNPreviewModal | null = null;

	plugin: DNPlugin;
	private _data: DNData;

	// Tags Dashboard
	TAGS_INPUT_SEARCH: HTMLInputElement;
	TAGS_FIRST_COL_EL: HTMLElement;
	TAGS_RECENT_FILES_EL: HTMLElement;

	TAGS_RESULTS_EL: HTMLElement;
	PRIMARY_TAGS_RESULTS_DIV: HTMLDivElement;

	TAGS_SIDEBAR_EL: HTMLDivElement;
	TAGS_SIDEBAR_LIST_DIV: HTMLDivElement;


	tags_sidebar_sorted_by_frequency = false;

	tagsCurrentPage = 0;
	filteredPrimaryTagNotes: TFile[] = [];

	tags_sidebar = true;
	primary_tags_results_visible = true;

	private _dnTagSuggestions: DNTagSuggestions;
	private _dnMainSearchTagSuggestions: DNTagSuggestions;
	BTN_CLEAR_TAGS_INPUT_SEARCH: HTMLDivElement;
	BTN_CLEAR_INPUT_SEARCH: HTMLDivElement;

	labelDateRangeFilter: string;

	constructor(app: App, plugin: DNPlugin, private _dataManager: DNDataManager) {
		super(app);
		this.plugin = plugin;

		this.intersectionObserver = new IntersectionObserver(this.dnHandleIntersection);
	}

	async render() {

		this._data = await this._dataManager.getDataCache(
			this.app, this.excluded_extensions, this.excluded_folders
		);

		await this.updateModalData();

		this._bookmarks = await this._dataManager.getBookmarkedVaultFiles(this.app, this.excluded_extensions, this.excluded_folders);
		this._last_opened = this._dataManager.getLastOpenedFiles(this.app);

		const leaf = this.app.workspace?.getMostRecentLeaf();
		if (leaf !== null) {
			this._leaf = leaf;
		}

		await this.dnCreateMainUI(this.contentEl);

		this.dnSetView(this.default_view);

		this.dnSetSelectLayoutValue(this.selected_table_layout);
		this.dnSetSelectSortValue(this.selected_sort_value);

		this.dnToggleColoredFiles();

		await this.dnLoadSearchOnClose();

		if (this.INPUT_SEARCH.value !== '') {
			this.dnModalSearchVault(this.INPUT_SEARCH.value);
		}

	}


	async updateModalData() {

		this._files = this._data.all_files;
		this._folders = this._data.folders;

		// File types
		this._notes = this._data.notes;
		this._images = this._data.images;
		this._canvas = this._data.canvas;
		this._audios = this._data.audios;
		this._videos = this._data.videos;
		this._bases = this._data.bases;
		this._pdf = this._data.pdf;
		this._other = this._data.other;


		// Filtered files
		this._files_excluded_filters = this._data.filtered_files;
		this._files_results = this._files_excluded_filters;

		this._recent = await this.dnGetRecentFiles(this._files_excluded_filters, this.num_recent_files);
		this._recent_files_tags = await this.dnGetRecentFiles(this._notes, 10);
	}

	async dnCreateMainUI(el: HTMLElement) {

		const mainContainer = el.createEl('div', { cls: 'dn-container' });
		mainContainer.setAttribute('id', 'dn-container');
		// Top Navigation
		this.dnCreateInputSearch(mainContainer);

		const topNav = mainContainer.createEl('div', { cls: 'dn-top-nav' });

		const leftTopNav = topNav.createEl('div');
		const rightTopNav = topNav.createEl('div');

		this._BTN_DASHBOARD = leftTopNav.createEl('button', { text: 'Dashboard', cls: 'mod-cta' });
		this._BTN_DASHBOARD.setAttribute('aria-label', 'Dashboard view');
		this._BTN_DASHBOARD.setAttribute('data-tooltip-position', 'bottom');
		this._BTN_DASHBOARD.onClickEvent((evt: MouseEvent) => {
			this.dnSetView(1);
		});

		this._BTN_NAVIGATOR = leftTopNav.createEl('button', { text: 'Navigator' });
		this._BTN_NAVIGATOR.setAttribute('aria-label', 'Navigator view');
		this._BTN_NAVIGATOR.setAttribute('data-tooltip-position', 'bottom');
		this._BTN_NAVIGATOR.onClickEvent((evt: MouseEvent) => {
			this.dnModalSearchVault(this.INPUT_SEARCH.value);
			this.dnSetView(2);
		});

		this._BTN_TAGS = leftTopNav.createEl('button', { text: 'Tags' });
		this._BTN_TAGS.setAttribute('aria-label', 'Tags dashboard view');
		this._BTN_TAGS.setAttribute('data-tooltip-position', 'bottom');
		this._BTN_TAGS.onClickEvent((evt: MouseEvent) => {
			this.dnSetView(3);
		});

		this._BTN_TAGS.setAttribute('id', 'btn-tags')

		// Select table layout
		this.labelLayout = rightTopNav.createEl('span', {
			text: 'Layout:', cls: 'dn-tbl-label'
		});

		this.labelLayout.setAttribute('id', 'dn-label-layout');

		this._SELECT_TABLE_LAYOUT = rightTopNav.createEl('select', {
			cls: 'dropdown tbl-select'
		});
		this._SELECT_TABLE_LAYOUT.createEl('option', { text: 'Default', value: 'dn-tbl-default' });
		this._SELECT_TABLE_LAYOUT.createEl('option', { text: 'Row striped', value: 'dn-tbl-row' });
		this._SELECT_TABLE_LAYOUT.createEl('option', { text: 'Column striped', value: 'dn-tbl-column' });
		this._SELECT_TABLE_LAYOUT.createEl('option', { text: 'Bordered', value: 'dn-tbl-bordered' });
		this._SELECT_TABLE_LAYOUT.createEl('option', { text: 'Cards', value: 'dn-tbl-cards' });
		this._SELECT_TABLE_LAYOUT.addEventListener('change', () => { this.dnSelectTableLayout(); });

		// Select sort
		this.labelSort = rightTopNav.createEl('span', {
			text: 'Sort by:', cls: 'dn-tbl-label'
		});

		this.labelSort.setAttribute('id', 'dn-label-sort');

		this._SELECT_SORT = rightTopNav.createEl('select', {
			cls: 'dropdown'
		});
		this._SELECT_SORT.setAttribute('id', 'dn-select-sort');

		this._SELECT_SORT.addEventListener('change', () => { this.dnSortColumnWithSelect(); });

		// Select sort options
		this._SELECT_SORT.createEl('option', { text: 'Name (A to Z)', value: 'name-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Name (Z to A)', value: 'name-desc' });
		this._SELECT_SORT.createEl('option', { text: 'Extension (A to Z)', value: 'ext-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Extension (Z to A)', value: 'ext-desc' });
		this._SELECT_SORT.createEl('option', { text: 'Path (A to Z)', value: 'path-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Path (Z to A)', value: 'path-desc' });
		this._SELECT_SORT.createEl('option', { text: 'Size (smallest to largest)', value: 'size-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Size (largest to smallest)', value: 'size-desc' });
		this._SELECT_SORT.createEl('option', { text: 'Date/time (oldest to newest)', value: 'modified-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Date/time (newest to oldest)', value: 'modified-desc' });
		this._SELECT_SORT.createEl('option', { text: 'Backlinks (lowest to highest)', value: 'backlinks-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Backlinks (highest to lowest)', value: 'backlinks-desc' });
		this._SELECT_SORT.createEl('option', { text: 'Outgoing links (lowest to highest)', value: 'outgoing-asc' });
		this._SELECT_SORT.createEl('option', { text: 'Outgoing links (highest to lowest)', value: 'outgoing-desc' });


		// Containers
		this._VIEW_DASHBOARD = mainContainer.createEl('div', { cls: 'dn-flex' });
		this._VIEW_NAVIGATOR = mainContainer.createEl('div', { cls: 'dn-display-none' });
		this._VIEW_TAGS = mainContainer.createEl('div', { cls: 'dn-display-none' });

		this._divSearchResults = this._VIEW_NAVIGATOR.createEl('div', { cls: 'dn-div-table' });

		await this.dnShowModalSearchResults({ f: this._files_results, el: this._divSearchResults, leaf: this._leaf });

		// Vault Stats container
		const divVaultStats = this._VIEW_DASHBOARD.createEl('div');
		divVaultStats.setAttribute('id', 'dn-vault-stats');

		if (this.show_dashboard_piechart) {
			const divVaultGraph = this._VIEW_DASHBOARD.createEl('div');
			divVaultGraph.setAttribute('id', 'dn-vault-graph');

			const canvasPieChart1 = divVaultGraph.createEl('canvas');
			canvasPieChart1.setAttribute('id', 'dashboard-canvas');

			const styles = getComputedStyle(document.body);

			const labelColor = styles.getPropertyValue('--text-muted');

			const pieChart1 = new DNPieChart(canvasPieChart1, 10, 12, 50, labelColor);

			pieChart1.addData(this._notes.length, this.color_notes, 'Notes');
			pieChart1.addData(this._images.length, this.color_images, 'Images');
			pieChart1.addData(this._bases.length, this.color_bases, 'Bases');
			pieChart1.addData(this._canvas.length, this.color_canvas, 'Canvases');
			pieChart1.addData(this._videos.length, this.color_videos, 'Videos');
			pieChart1.addData(this._audios.length, this.color_audios, 'Audio files');
			pieChart1.addData(this._pdf.length, this.color_pdf, 'PDFs');
			pieChart1.addData(this._other.length, this.color_other, 'Other files');
			pieChart1.draw();

			// Total files
			const divStatsFrame = divVaultGraph.createEl('div', { cls: 'dn-stats-files-folders' });
			divStatsFrame.createEl('div', { cls: 'dn-stats-files', text: 'Files: ' + this._files_excluded_filters.length });

			// Total folders
			divStatsFrame.createEl('div', { cls: 'dn-stats-folders', text: 'Folders: ' + this._folders.length });
		}

		const divBookmarkedFiles = this._VIEW_DASHBOARD.createEl('div');
		divBookmarkedFiles.setAttribute('id', 'dn-bookmarked-files');

		const divLastOpenedFiles = this._VIEW_DASHBOARD.createEl('div');
		divLastOpenedFiles.setAttribute('id', 'dn-last-opened-files');

		const divRecentFiles = this._VIEW_DASHBOARD.createEl('div');
		divRecentFiles.setAttribute('id', 'dn-recent-files');

		const divRecentNotes = this._VIEW_DASHBOARD.createEl('div');
		divRecentNotes.setAttribute('id', 'dn-recent-notes');

		const divBases = this._VIEW_DASHBOARD.createEl('div');
		divBases.setAttribute('id', 'dn-bases');

		const divCanvas = this._VIEW_DASHBOARD.createEl('div');
		divCanvas.setAttribute('id', 'dn-canvas');

		const divImages = this._VIEW_DASHBOARD.createEl('div');
		divImages.setAttribute('id', 'dn-images');

		const divAudios = this._VIEW_DASHBOARD.createEl('div');
		divAudios.setAttribute('id', 'dn-audios');

		const divVideos = this._VIEW_DASHBOARD.createEl('div');
		divVideos.setAttribute('id', 'dn-videos');

		const divPDFs = this._VIEW_DASHBOARD.createEl('div');
		divPDFs.setAttribute('id', 'dn-pdfs');

		const divOther = this._VIEW_DASHBOARD.createEl('div');
		divOther.setAttribute('id', 'dn-other');

		// Dashboard - Vault Stats
		// Categories btns
		await this.dnCreateBtn(divVaultStats,
			'dn-btn-notes',
			'Notes',
			this._notes,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-canvas',
			'Canvases',
			this._canvas,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-bases',
			'Bases',
			this._bases,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-images',
			'Images',
			this._images,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-audios',
			'Audio files',
			this._audios,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-videos',
			'Videos',
			this._videos,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-pdf',
			'PDFs',
			this._pdf,
			this._divSearchResults,
			this._leaf);

		await this.dnCreateBtn(divVaultStats,
			'dn-btn-other',
			'Other files',
			this._other,
			this._divSearchResults,
			this._leaf);


		// Recent files by type/category
		await this.dnCreateRecentFiles('Bookmarks', divBookmarkedFiles, this._bookmarks, this.num_bookmarked_files);
		await this.dnCreateRecentFiles('Recently opened', divLastOpenedFiles, this._last_opened, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent files', divRecentFiles, this._recent, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent notes', divRecentNotes, this._notes, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent bases', divBases, this._bases, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent canvases', divCanvas, this._canvas, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent images', divImages, this._images, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent audio files', divAudios, this._audios, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent videos', divVideos, this._videos, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent PDFs', divPDFs, this._pdf, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent other files', divOther, this._other, this.num_recent_files);

		// Tags dashboard view
		const tagsMainSearchContainer = this._VIEW_TAGS.createEl('div', { cls: 'dn-td-main-search-container' });
		const tagsSearchLeftDiv = tagsMainSearchContainer.createEl('div', { cls: 'dn-search-input-container-left-div' });

		this.TAGS_INPUT_SEARCH = tagsSearchLeftDiv.createEl('input', {
			type: 'search',
			placeholder: 'Search for tag(s)...',
			cls: 'dn-td-tag-search-input'
		});

		this.TAGS_INPUT_SEARCH.spellcheck = false;

		// Clear search
		this.BTN_CLEAR_TAGS_INPUT_SEARCH = tagsSearchLeftDiv.createEl('div', { cls: 'search-input-clear-button' });
		this.BTN_CLEAR_TAGS_INPUT_SEARCH.setAttribute('aria-label', 'Clear search');
		this.BTN_CLEAR_TAGS_INPUT_SEARCH.setAttribute('tabindex', '0');
		this.BTN_CLEAR_TAGS_INPUT_SEARCH.onClickEvent((evt: MouseEvent) => {
			this.clearTagsSearchField();
		});


		const tagsSearchRightDiv = tagsMainSearchContainer.createEl('div', { cls: 'dn-search-input-container-right-div' });

		// Search in navigator
		const btnSearchInNavigator = tagsSearchRightDiv.createEl('button', { cls: 'dn-top-btns-search' });
		btnSearchInNavigator.setAttribute('id', 'dn-tags-btn-search-navigator');
		btnSearchInNavigator.setAttribute('aria-label', 'Search in Navigator');
		btnSearchInNavigator.setAttribute('data-tooltip-position', 'bottom');
		btnSearchInNavigator.onClickEvent((evt: MouseEvent) => {

			if (this.TAGS_INPUT_SEARCH.value) {

				this.INPUT_SEARCH.value = this.TAGS_INPUT_SEARCH.value;

				const inputEvent = new Event('input', { bubbles: true });
				this.INPUT_SEARCH.dispatchEvent(inputEvent);

			} else {
				new Notice('Please type a tag or multiple tags to search in Navigator.');
			}
		});

		// Tags sidebar
		const btnTagsSidebar = tagsSearchRightDiv.createEl('button', { cls: 'dn-top-btns-search' });
		btnTagsSidebar.setAttribute('id', 'dn-tags-btn-sidebar');
		btnTagsSidebar.setAttribute('aria-label', 'Toggle tags sidebar');
		btnTagsSidebar.setAttribute('data-tooltip-position', 'bottom');
		btnTagsSidebar.onClickEvent((evt: MouseEvent) => {

			// Toggle the state
			this.tags_sidebar = !this.tags_sidebar;
			this.TAGS_SIDEBAR_EL.classList.toggle('dn-hidden', !this.tags_sidebar);

		});

		this.TAGS_FIRST_COL_EL = this._VIEW_TAGS.createEl('div', { cls: 'dn-td-first-col' });

		this.TAGS_RECENT_FILES_EL = this.TAGS_FIRST_COL_EL.createEl('div', { cls: 'dn-td-recent-notes-div' });

		this.TAGS_RESULTS_EL = this.TAGS_FIRST_COL_EL.createEl('div', { cls: 'dn-td-primary-tags-div' });

		this.TAGS_SIDEBAR_EL = this._VIEW_TAGS.createEl('div', { cls: 'dn-td-second-col' });

		// Show/hide sidebar based on user preferences
		if (this.tags_sidebar) {
			this.TAGS_SIDEBAR_EL.classList.remove('dn-hidden');
		} else {
			this.TAGS_SIDEBAR_EL.classList.add('dn-hidden');
		}

		// Recent notes -> tags dashboard
		this.TAGS_RECENT_FILES_EL.createEl('h3', { text: 'Recent notes & tags', cls: 'dn-subtitles' });
		if (this._recent_files_tags) {
			this._recent_files_tags.forEach((file) => {

				const tagsRecentNoteItem = this.TAGS_RECENT_FILES_EL.createEl('div', { cls: 'dn-td-recent-note-item' });

				const tdRecentNoteLink = tagsRecentNoteItem.createEl('a', { text: file.basename, title: file.path, cls: 'dn-f-note' });
				tdRecentNoteLink.onClickEvent((evt: MouseEvent) => {
					if (file !== null) {
						this.dnOpenFileAlt(file, evt);
					}
				});
				tdRecentNoteLink.setAttribute('tabindex', '0');

				tdRecentNoteLink.addEventListener('mouseover', (evt: MouseEvent) => this.dnHandleHoverPreview(evt, file));
				tdRecentNoteLink.addEventListener('contextmenu', (evt: MouseEvent) => this.dnGenerateContextMenu(evt, file));

				const tags_per_recent_file = getTagsPerFile(file);

				tagsRecentNoteItem.createEl('br');

				if (tags_per_recent_file !== '') {

					const tdFileTags = tags_per_recent_file.split(' ');

					tdFileTags.forEach((tag) => {

						const tagsDashBoardNoteTags = tagsRecentNoteItem.createEl('a', { cls: 'tag', text: tag, href: tag });
						tagsDashBoardNoteTags.onClickEvent((evt: MouseEvent) => {
							this.handleTagActionsTagsDashboard(evt, tag);
						});
						tagsDashBoardNoteTags.setAttribute('tabindex', '0');
					});
				} else {
					tagsRecentNoteItem.createEl('span', { text: 'No tags' });
				}
			});
		}


		this.generateTagsSidebar(this.TAGS_SIDEBAR_EL, this._data.tags);

		// Tags event listener
		this.TAGS_INPUT_SEARCH.addEventListener('input', debounce(() => this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value), 300, true));

		this._dnTagSuggestions = new DNTagSuggestions(this.app, this.TAGS_INPUT_SEARCH, this._data.tagNames);
		this._dnMainSearchTagSuggestions = new DNTagSuggestions(this.app, this.INPUT_SEARCH, this._data.tagNames);
	}

	async dnCreateBtn(elDiv: HTMLElement,
		btnId: string,
		btnTitle: string,
		btnCategoryFiles: TFile[],
		displayEl: HTMLElement,
		leaf: WorkspaceLeaf) {

		const btn = elDiv.createEl('div', { cls: 'dn-btn-stats' });

		btn.setAttribute('id', btnId)
		btn.createEl('span', { cls: 'dn-btn-stats-label', text: btnTitle });
		btn.createEl('span', { cls: 'dn-btn-stats-icon' });
		btn.createEl('span', { cls: 'dn-btn-stats-number', text: btnCategoryFiles.length.toString() });
		btn.onClickEvent((evt: MouseEvent) => {
			this._files_results = btnCategoryFiles;
			this.INPUT_SEARCH.value = '@' + btnTitle.replace(" files", "").toLocaleLowerCase() + ' ';
			this.dnModalSearchVault(this.INPUT_SEARCH.value);
			this.INPUT_SEARCH.focus();
		});
		btn.setAttribute('tabindex', '0');
		btn.setAttribute('role', 'button');

		return btn;
	}

	dnCreateInputSearch(el: HTMLElement): void {
		this.SEARCH_INPUT_CONTAINER = el.createEl('div', { cls: 'dn-search-input-container' });

		const searchLeftDiv = this.SEARCH_INPUT_CONTAINER.createEl('div', { cls: 'dn-search-input-container-left-div' });

		this.INPUT_SEARCH = searchLeftDiv.createEl('input', { type: 'search', placeholder: 'Search...' });
		this.INPUT_SEARCH.setAttribute('id', 'dn-input-filter');
		this.INPUT_SEARCH.spellcheck = false;
		this.INPUT_SEARCH.focus();


		// Clear search
		this.BTN_CLEAR_INPUT_SEARCH = searchLeftDiv.createEl('div', { cls: 'search-input-clear-button' });
		this.BTN_CLEAR_INPUT_SEARCH.setAttribute('aria-label', 'Clear search');
		this.BTN_CLEAR_INPUT_SEARCH.setAttribute('tabindex', '0');
		this.BTN_CLEAR_INPUT_SEARCH.onClickEvent((evt: MouseEvent) => {
			this.clearSearchField();
		});

		// Right btns div
		const searchRightDiv = this.SEARCH_INPUT_CONTAINER.createEl('div', { cls: 'dn-search-input-container-right-div' });

		// Add search btn
		const topBtnAddSearch = searchRightDiv.createEl('button', { cls: 'dn-top-btns-search' })
		topBtnAddSearch.setAttribute('id', 'dn-top-btn-add');
		topBtnAddSearch.setAttribute('aria-label', 'Save search');
		topBtnAddSearch.setAttribute('data-tooltip-position', 'bottom');
		topBtnAddSearch.onClickEvent((evt: MouseEvent) => {
			this.openSubModal(this.plugin.DN_SAVE_SEARCH_MODAL);

		});

		// Saved/notebook btn
		const topBtnSaved = searchRightDiv.createEl('button', { cls: 'dn-top-btns-search' })
		topBtnSaved.setAttribute('id', 'dn-top-btn-saved');
		topBtnSaved.setAttribute('aria-label', 'Saved searches');
		topBtnSaved.setAttribute('data-tooltip-position', 'bottom');
		topBtnSaved.onClickEvent((evt: MouseEvent) => {
			this.openSubModal(this.plugin.DN_SAVED_SEARCHES_MODAL);
		});

		// Navigator view columns btn
		const topBtnQuickDisplayOptions = searchRightDiv.createEl('button', { cls: 'dn-top-btns-search' })
		topBtnQuickDisplayOptions.setAttribute('id', 'dn-top-btn-table-columns');
		topBtnQuickDisplayOptions.setAttribute('aria-label', 'Quick display options');
		topBtnQuickDisplayOptions.setAttribute('data-tooltip-position', 'bottom');
		topBtnQuickDisplayOptions.onClickEvent((evt: MouseEvent) => {
			this.openSubModal(this.plugin.DN_QUICK_DISPLAY_OPTIONS_MODAL);
		});

		// Help/Info btn
		const topBtnInfo = searchRightDiv.createEl('button', { cls: 'dn-top-btns-search' })
		topBtnInfo.setAttribute('id', 'dn-top-btn-info');
		topBtnInfo.setAttribute('aria-label', 'Quick reference/help');
		topBtnInfo.setAttribute('data-tooltip-position', 'bottom');
		topBtnInfo.onClickEvent((evt: MouseEvent) => {
			this.openSubModal(this.plugin.DN_INFO_MODAL);
		});


		// Keyup event listener with debounce
		this.INPUT_SEARCH.addEventListener('input', debounce(() => this.dnModalSearchVault(this.INPUT_SEARCH.value), 300, true));
		this.INPUT_SEARCH.focus();
	}

	clearSearchField() {
		this.INPUT_SEARCH.value = '';
		this.BTN_CLEAR_INPUT_SEARCH.style.display = 'none';
		this.INPUT_SEARCH.focus();
		this.dnModalSearchVault(this.INPUT_SEARCH.value);
	}

	clearTagsSearchField() {
		this.TAGS_INPUT_SEARCH.value = '';
		this.BTN_CLEAR_TAGS_INPUT_SEARCH.style.display = 'none';
		this.TAGS_INPUT_SEARCH.focus();
		this.modalEl.scrollTo({ top: 0, behavior: 'smooth' });
		this.TAGS_SIDEBAR_EL.scrollTo({ top: 0, behavior: 'smooth' });
		this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);
	}

	async dnModalSearchVault(val: string) {
		this.dnSetView(2);
		this.labelDateRangeFilter = '';

		if (val === '') {
			this.BTN_CLEAR_INPUT_SEARCH.style.display = 'none'
		} else {
			this.BTN_CLEAR_INPUT_SEARCH.style.display = 'flex'
		}

		const search_raw_vals = /!(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*')|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\S+/g

		let searchParams = val.toLowerCase().trim().match(search_raw_vals);

		if (!searchParams) {
			return this.searchAction('', this._files_excluded_filters);
		}
		searchParams = searchParams.map(param => {
			if (param.startsWith('"') && param.endsWith('"')) {
				return param.slice(1, -1); // Remove double quotes
			} else if (param.startsWith("'") && param.endsWith("'")) {
				return param.slice(1, -1); // Remove single quotes
			} else if (param.startsWith(".")) {
				return '\\' + param + '$';
			} else if (param.startsWith("/") && param.length === 1) {
				return '^/$';
			} else {
				return param;
			}
		});

		const firstParam = searchParams[0];
		await this.searchAction(firstParam, this._files_excluded_filters);

		// Advanced continuous search
		const remainingParams = searchParams.slice(1);
		remainingParams.every(async p => {
			await this.searchAction(p, this._files_results);
		});

	}
	// Search
	async searchAction(val: string, files: TFile[]) {

		let rExp: RegExp;

		const isExcludeSearch = val.startsWith('!') && val.length >= 1;
		let excludeParam = isExcludeSearch ? val.slice(1) : val;

		if (excludeParam.startsWith('"') && excludeParam.endsWith('"')) {
			excludeParam = excludeParam.slice(1, -1); // Remove double quotes
		} else if (excludeParam.startsWith("'") && excludeParam.endsWith("'")) {
			excludeParam = excludeParam.slice(1, -1); // Remove single quotes
		}

		try {
			if (isExcludeSearch) {
				rExp = new RegExp('', 'iu');
			} else {
				if (val === '!') { rExp = new RegExp('', 'iu') } else {

					rExp = new RegExp(val.toLowerCase(), 'iu');
				}
			}

		} catch (error) {
			return;
		}

		const isDateSearch = val.startsWith('@');

		if (this.INPUT_SEARCH.value.includes('@')) {
			this.INPUT_SEARCH.classList.add('dn-input-datesearch');
		} else {
			this.INPUT_SEARCH.classList.remove('dn-input-datesearch');
		}

		if (isExcludeSearch) {
			let isMatch: boolean;
			if (excludeParam === '/') {
				this._files_results = files.filter(file => {
					isMatch = getFolderStructure(file.path).toLowerCase() === '/';
					return isExcludeSearch ? !isMatch : isMatch;
				});
			} else {
				this._files_results = files.filter(file => {
					isMatch = file.name.toLowerCase().includes(excludeParam) ||
						getFolderStructure(file.path).toLowerCase().includes(excludeParam) ||
						moment(file.stat.mtime).format(this.date_format).toLowerCase().includes(excludeParam) ||
						getTagsPerFile(file).toLowerCase().includes(excludeParam) ||
						getPropsPerFile(file).toLowerCase().includes(excludeParam);

					return isExcludeSearch ? !isMatch : isMatch;
				});
			}
		} else {
			this._files_results = files.filter(
				file => {

					if (isDateSearch) {

						const dateSearch = val.slice(1).toLowerCase().split(' ');

						return this.dnHandleSpecialSearch(dateSearch[0], file);

					} else {
						return this.dnHandleNormalSearch(rExp, file);
					}
				});
		}

		this.dnSortFilteredFiles(false);

		await this.dnShowModalSearchResults({ f: this._files_results, el: this._divSearchResults, leaf: this._leaf });

		const tbody = document.getElementById('dn-table-results') as HTMLTableSectionElement;

		if (tbody !== null) {
			const tr = tbody.getElementsByTagName('tr') as HTMLCollectionOf<HTMLTableRowElement>;

			for (let i = 0, len = tr.length; i < len; i++) {
				const allTds = tr[i].querySelectorAll('td') as NodeListOf<HTMLTableCellElement>;

				let isResult = false;

				for (let j = 0; j < allTds.length; j++) {
					const td = allTds[j];
					const tdVal = td.innerText.toLowerCase();
					if (rExp.test(tdVal) || isDateSearch) {
						isResult = true;
						break;
					}
				}

				if (isResult) {
					tr[i].classList.remove('dn-display-none');
				} else {
					tr[i].classList.add('dn-display-none');
				}
			}
		}
	}

	async dnShowModalSearchResults({ f, el, leaf, currentPage = 1 }: { f: TFile[]; el: HTMLElement; leaf: WorkspaceLeaf; currentPage?: number }): Promise<void> {

		el.empty();

		const paginationContainer = this._divSearchResults.createEl('div', { cls: 'dn-pagination' });
		const table = el.createEl('table', { cls: this.selected_table_layout });
		table.setAttribute('id', 'dn-table');
		// Thead
		const thead = table.createEl('thead');
		const tr = thead.createEl('tr');

		thead.addEventListener('contextmenu', (evt) => {
			const clickedHeader = (evt.target as HTMLElement).closest('th');

			if (clickedHeader) {
				evt.preventDefault();
				evt.stopPropagation();
				this.plugin.DN_QUICK_DISPLAY_OPTIONS_MODAL.open();
			}
		});

		this._thThumb = tr.createEl('th', { text: '■', cls: 'dn-th-thumbnail' });

		this._th1 = tr.createEl('th', { text: 'Name', cls: 'dn-th-name' });
		this._th2 = tr.createEl('th', { text: 'Ext', cls: 'dn-th-ext' });
		this._th3 = tr.createEl('th', { text: 'Path', cls: 'dn-th-path' });
		this._th4 = tr.createEl('th', { text: 'Size', cls: 'dn-th-size' });
		this._th5 = tr.createEl('th', { text: 'Date', cls: 'dn-th-date' });
		this._th6 = tr.createEl('th', { text: 'Tags', cls: 'dn-th-tags' });
		this._th7 = tr.createEl('th', { text: 'Frontmatter', cls: 'dn-th-frontmatter' });
		this._th_bl = tr.createEl('th', { text: 'BL', cls: 'dn-th-backlinks' });
		this._th_ol = tr.createEl('th', { text: 'OL', cls: 'dn-th-outgoing-links' });

		this._th1.addEventListener('dblclick', () => this.dnAlternateSortColumn('name'));
		this._th2.addEventListener('dblclick', () => this.dnAlternateSortColumn('ext'));
		this._th3.addEventListener('dblclick', () => this.dnAlternateSortColumn('path'));
		this._th4.addEventListener('dblclick', () => this.dnAlternateSortColumn('size'));
		this._th5.addEventListener('dblclick', () => this.dnAlternateSortColumn('modified'));
		this._th_bl.addEventListener('dblclick', () => this.dnAlternateSortColumn('backlinks'));
		this._th_ol.addEventListener('dblclick', () => this.dnAlternateSortColumn('outgoing'));


		// Tbody
		const tbody = table.createEl('tbody');
		tbody.setAttribute('id', 'dn-table-results');

		if (f.length > 0) {

			if (this.intersectionObserver) {
				this.intersectionObserver.disconnect();
			}
			// Pagination
			this._total_pages = Math.ceil(f.length / this.files_per_page);
			const paginatedData = f.slice((currentPage - 1) * this.files_per_page, currentPage * this.files_per_page);

			for (const file of paginatedData) {
				const tr = tbody.createEl('tr');
				// Events
				tr.addEventListener('contextmenu', (evt: MouseEvent) => { this.dnGenerateContextMenu(evt, file); });
				tr.addEventListener('click', (evt: MouseEvent) => { this.dnHandleClick(evt, file); });
				tr.addEventListener('dblclick', (evt: MouseEvent) => { this.dnHandleDblClick(evt, file); });
				tr.addEventListener('mouseover', async (evt: MouseEvent) => { this.dnHandleHoverPreview(evt, file); });

				this.intersectionObserver.observe(tr);

				tr.removeEventListener('mouseover', async (evt: MouseEvent) => { this.dnHandleHoverPreview(evt, file); });

				const tdThumbnail = tr.createEl('td', { title: file.path });
				this.setThumbnail(tdThumbnail, file);

				tdThumbnail.onClickEvent((evt: MouseEvent) => {
					if (leaf !== null && file !== null) {
						this.dnOpenFileAlt(file, evt);
					}
				});


				const td1 = tr.createEl('td', { cls: 'dn-td-name' });

				const tdNameLink = td1.createEl('a', { cls: this.dnSetFileIconClass(file.extension), text: file.name });

				tdNameLink.onClickEvent((evt: MouseEvent) => {
					if (leaf !== null && file !== null) {
						this.dnOpenFileAlt(file, evt);
					}
				});
				tdNameLink.setAttribute('tabindex', '0');
				tdNameLink.addEventListener('contextmenu', (evt: MouseEvent) => this.dnGenerateContextMenu(evt, file));


				const fExt = file.extension;
				const fSize = formatFileSize(file.stat.size);
				const fMTime = moment(file.stat.mtime).format(this.date_format);
				const fCTime = moment(file.stat.ctime).format(this.date_format);

				const td2 = tr.createEl('td', { cls: 'dn-td-ext' });

				const tdExtLink = td2.createEl('a', { cls: 'dn-ext', text: fExt, title: fExt });
				tdExtLink.onClickEvent((evt: MouseEvent) => {
					if (evt.button === 2) {
						evt.preventDefault();
					} else {
						this.INPUT_SEARCH.value = '.' + fExt;
						this.dnModalSearchVault(this.INPUT_SEARCH.value);
					}
				});

				tdExtLink.setAttribute('tabindex', '-1');

				const td3 = tr.createEl('td', { cls: 'dn-td-path' });
				const folder_path = getFolderStructure(file.path);

				const tdPathLink = td3.createEl('a', { cls: 'dn-folder-path', text: folder_path, title: file.path });
				tdPathLink.onClickEvent((evt: MouseEvent) => {
					if (evt.button === 2) {
						evt.preventDefault();
					} else {
						this.INPUT_SEARCH.value = folder_path;
						this.dnModalSearchVault(this.INPUT_SEARCH.value + '$');
					}
				});
				tdPathLink.setAttribute('tabindex', '-1');

				tr.createEl('td', { text: fSize, title: fSize + ' bytes', cls: 'dn-td-size' });
				tr.createEl('td', { text: fMTime, title: fCTime + ' - Created\n' + fMTime + ' - Modified', cls: 'dn-td-date' });

				const tags_per_file = getTagsPerFile(file);
				const props_per_file = getPropsPerFile(file);

				const td6 = tr.createEl('td', { title: tags_per_file, cls: 'dn-td-tags' });
				if (tags_per_file !== '') {
					const fTags = tags_per_file.split(' ');
					fTags.forEach((tag) => {
						const tdTagLink = td6.createEl('a', { cls: 'tag', text: tag, href: tag });
						tdTagLink.onClickEvent((evt: MouseEvent) => {
							this.handleTagActions(evt, tag);
						});
						tdTagLink.setAttribute('tabindex', '-1');
					});
				}

				const td7 = tr.createEl('td', { cls: 'dn-td-frontmatter' });
				if (props_per_file !== '') {
					const fProps = props_per_file.split('\n');
					fProps.forEach((prop) => {
						const tdPropsLink = td7.createEl('a', { cls: 'dn-tag', text: prop, title: props_per_file });
						tdPropsLink.onClickEvent((evt: MouseEvent) => {
							if (evt.button === 2) {
								evt.preventDefault();
							} else {
								this.INPUT_SEARCH.value = prop;
								this.dnModalSearchVault(this.INPUT_SEARCH.value);
							}
						});
						tdPropsLink.setAttribute('tabindex', '-1');
					});
				}

				const backlinks = getBacklinksToFile(file);
				const num_of_backlinks = backlinks.length.toString();
				tr.createEl('td', { text: num_of_backlinks, cls: 'dn-td-backlinks' });


				const outgoing_links = getOutgoingLinks(file);
				const num_of_outgoing_links = outgoing_links.length.toString();
				tr.createEl('td', { text: num_of_outgoing_links, cls: 'dn-td-outgoing-links' });


			}

			// Add pagination
			paginationContainer.empty();
			// Results count
			const totalFilesLabel = paginationContainer.createEl('div', { cls: 'dn-pagination-total-results', text: `File(s): ${f.length} ` });

			const dateFilterRangeLabel = totalFilesLabel.createEl('span', { cls: 'dn-date-range-filter-label' });
			dateFilterRangeLabel.setText(this.labelDateRangeFilter ? `${this.labelDateRangeFilter}` : '');

			// Current page
			const rightPagDiv = paginationContainer.createEl('div', { cls: 'dn-pagination-current-page', text: `Page ${currentPage} of ${this._total_pages} ` });

			const btnPrev = rightPagDiv.createEl('button', { cls: 'dn-btn-prev', text: '◀', title: 'Previous' });

			if (currentPage === 1) {
				btnPrev.disabled = true;
			} else {
				btnPrev.disabled = false;
			}
			btnPrev.addEventListener('click', async () => {
				if (currentPage > 1) {
					await this.dnShowModalSearchResults({ f, el, leaf, currentPage: currentPage - 1 });
				}
			});

			const btnNext = rightPagDiv.createEl('button', { cls: 'dn-btn-next', text: '▶', title: 'Next' });

			if (currentPage === this._total_pages) {
				btnNext.disabled = true;
			} else {
				btnNext.disabled = false;
			}

			btnNext.addEventListener('click', async () => {
				if (currentPage < this._total_pages) {
					await this.dnShowModalSearchResults({ f, el, leaf, currentPage: currentPage + 1 });
				}
			});

			this.dnUpdateSortIndicators(this._sort_column,
				this._sort_order,
				this._th1,
				this._th2,
				this._th3,
				this._th4,
				this._th5,
				this._th_bl,
				this._th_ol);

			const dnTableManager = new DNTableManager('#dn-table');
			// Hide columns
			dnTableManager.hideColumns(this.hide_columns);

		} else {
			tr.empty();
			paginationContainer.createEl('div', { cls: 'dn-pagination-total-results', text: `File(s): 0 ` });
			this._divSearchResults.createEl('p', { cls: 'dn-no-results-found', text: 'No files found.' });
		}
		this.current_page = currentPage;
	}

	setThumbnail(tdThumbnail: HTMLTableCellElement, file: TFile) {
		const file_extension = file.extension.toLowerCase();

		const extensions: Record<string, string> = {
			'md': 'note',
			// Images
			'avif': 'image',
			'bmp': 'image',
			'gif': 'image',
			'ico': 'image',
			'jpeg': 'image',
			'jpg': 'image',
			'png': 'image',
			'raw': 'image',
			'svg': 'image',
			'tif': 'image',
			'tiff': 'image',
			'webp': 'image',
			// Audio files
			'aac': 'audio',
			'aif': 'audio',
			'aifc': 'audio',
			'aiff': 'audio',
			'flac': 'audio',
			'm4a': 'audio',
			'mp3': 'audio',
			'ogg': 'audio',
			'wav': 'audio',
			'webm': 'audio',
			// Videos
			'avi': 'video',
			'mov': 'video',
			'mkv': 'video',
			'mp4': 'video',
			// PDF and other formats
			'pdf': 'pdf',
			'canvas': 'canvas',
			'base': 'base'
		};

		if (extensions[file_extension] === 'image') {
			tdThumbnail.setAttribute('class', 'dn-thumbnail-image dn-thumbnail-props');
			if (this.image_thumbnail) {
				const imgThumb = tdThumbnail.createEl('img');
				imgThumb.setAttribute('src', this.app.vault.adapter.getResourcePath(normalizePath(file.path)));
				imgThumb.setAttribute('loading', 'lazy');
			}

		} else if (extensions[file_extension] !== 'image' && file_extension in extensions) {
			tdThumbnail.setAttribute('class', 'dn-thumbnail-' + extensions[file_extension] + ' dn-thumbnail-props');
		}
		else {
			tdThumbnail.setAttribute('class', 'dn-thumbnail-other dn-thumbnail-props');
		}

	}

	async dnSortFilteredFiles(toggle: boolean) {
		switch (this._sort_column) {
			case 'name':
			case 'path':
			case 'ext':
				this.dnSortColumnString(this._sort_column, this._sort_order, toggle);
				break;
			case 'size':
			case 'modified':
			case 'backlinks':
			case 'outgoing':
				this.dnSortColumnNumber(this._sort_column, this._sort_order, toggle);
				break;
		}
	}

	async dnSortColumnWithSelect(): Promise<void> {
		const val = this._SELECT_SORT.value;
		if (this.dnIsValidSort(val)) {
			const selSort = val.split('-');
			this._sort_column = selSort[0];
			this._sort_order = selSort[1];

			switch (this._sort_column) {
				case 'name':
				case 'path':
				case 'ext':
					this.dnSortColumnString(this._sort_column, this._sort_order, false);
					break;
				case 'size':
				case 'modified':
				case 'backlinks':
				case 'outgoing':
					this.dnSortColumnNumber(this._sort_column, this._sort_order, false);
					break;
			}

			await this.dnShowModalSearchResults({ f: this._files_results, el: this._divSearchResults, leaf: this._leaf });

		}
	}

	dnIsValidSort(val: string): boolean {
		if (['name-asc', 'name-desc',
			'path-asc', 'path-desc',
			'ext-asc', 'ext-desc',
			'size-asc', 'size-desc',
			'modified-asc', 'modified-desc',
			'backlinks-asc', 'backlinks-desc',
			'outgoing-asc', 'outgoing-desc'].includes(val)) {
			return true;
		} else {
			return false;
		}
	}

	dnIsValidLayout(val: string): boolean {
		if (this._TABLE_LAYOUTS.includes(val)) {
			return true;
		} else {
			return false;
		}
	}

	async dnAlternateSortColumn(colName: string) {
		switch (colName) {
			case 'name':
				this.dnSortColumnString('name', this._sort_order, true);
				break;
			case 'path':
				this.dnSortColumnString('path', this._sort_order, true);
				break;
			case 'ext':
				this.dnSortColumnString('ext', this._sort_order, true);
				break;
			case 'size':
				this.dnSortColumnNumber('size', this._sort_order, true);
				break;
			case 'modified':
				this.dnSortColumnNumber('modified', this._sort_order, true);
				break;
			case 'backlinks':
				this.dnSortColumnNumber('backlinks', this._sort_order, true);
				break;
			case 'outgoing':
				this.dnSortColumnNumber('outgoing', this._sort_order, true);
				break;
		}
		await this.dnShowModalSearchResults({ f: this._files_results, el: this._divSearchResults, leaf: this._leaf });
	}

	dnUpdateSortIndicators(activeColumn: string, sortOrder: string,
		col1: HTMLTableCellElement,
		col2: HTMLTableCellElement,
		col3: HTMLTableCellElement,
		col4: HTMLTableCellElement,
		col5: HTMLTableCellElement,
		col_bl: HTMLTableCellElement,
		col_ol: HTMLTableCellElement) {
		col1.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col2.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col3.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col4.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col5.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col_bl.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col_ol.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		let activeThCell = col5;
		switch (activeColumn) {
			case 'name':
				activeThCell = col1;
				break;
			case 'ext':
				activeThCell = col2;
				break;
			case 'path':
				activeThCell = col3;
				break;
			case 'size':
				activeThCell = col4;
				break;
			case 'modified':
				activeThCell = col5;
				break;
			case 'backlinks':
				activeThCell = col_bl;
				break;
			case 'outgoing':
				activeThCell = col_ol;
				break;
		}
		activeThCell.classList.add('sort-active');
		activeThCell.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
	}

	dnSortColumnString(sortColumn: string, sortOrder: string, toggleSortOrder: boolean) {
		const supportedColumns = ['name', 'path', 'ext'];

		if (!supportedColumns.includes(sortColumn)) {
			return;
		}

		if (toggleSortOrder) {
			if (this._sort_column === sortColumn) {
				sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				this._sort_column = sortColumn;
				sortOrder = 'desc';
			}
			this._sort_order = sortOrder;
		}

		const sortValue = sortColumn + '-' + this._sort_order;

		this.dnSetSelectSortValue(sortValue);

		this._files_results.sort((fileA: TFile, fileB: TFile) => {
			let sortA: string;
			let sortB: string;
			let folderStructureA: string;
			let folderStructureB: string;
			switch (sortColumn) {
				case 'name':
					sortA = fileA.name.toLowerCase();
					sortB = fileB.name.toLowerCase();
					break;
				case 'ext':
					sortA = fileA.extension.toLowerCase();
					sortB = fileB.extension.toLowerCase();
					break;
				case 'path':
					folderStructureA = getFolderStructure(fileA.path);
					folderStructureB = getFolderStructure(fileB.path);
					sortA = folderStructureA.toLowerCase();
					sortB = folderStructureB.toLowerCase();
					break;
				default:
					sortA = fileA.name.toLowerCase();
					sortB = fileB.name.toLowerCase();
			}

			if (sortOrder === 'asc') {
				return sortA.localeCompare(sortB);
			} else if (sortOrder === 'desc') {
				return sortB.localeCompare(sortA);
			} else {
				return sortA.localeCompare(sortB);
			}
		});
	}

	dnSortColumnNumber(sortColumn: string, sortOrder: string, toggleSortOrder: boolean) {
		const supportedColumns = ['size', 'modified', 'backlinks', 'outgoing'];

		if (!supportedColumns.includes(sortColumn)) {
			return;
		}

		if (toggleSortOrder) {
			if (this._sort_column === sortColumn) {
				sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				this._sort_column = sortColumn;
				sortOrder = 'desc';
			}
			this._sort_order = sortOrder;
		}

		const sortValue = sortColumn + '-' + this._sort_order;

		this.dnSetSelectSortValue(sortValue);

		this._files_results.sort((fileA: TFile, fileB: TFile) => {
			let sortA = 0;
			let sortB = 0;

			switch (sortColumn) {
				case 'size':
					sortA = fileA.stat.size;
					sortB = fileB.stat.size;
					break;
				case 'modified':
					sortA = fileA.stat.mtime;
					sortB = fileB.stat.mtime;
					break;
				case 'backlinks':
					sortA = getBacklinksToFile(fileA).length;
					sortB = getBacklinksToFile(fileB).length;
					break;
				case 'outgoing':
					sortA = getOutgoingLinks(fileA).length;
					sortB = getOutgoingLinks(fileB).length;
					break;
			}

			if (sortOrder === 'asc') {
				return sortA - sortB;
			} else if (sortOrder === 'desc') {
				return sortB - sortA;
			} else {
				return sortA - sortB;
			}
		});
	}

	async dnGetRecentFiles(files: TFile[], num_files: number): Promise<TFile[]> {
		const arrRecentFiles = files;
		return arrRecentFiles.sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, num_files);
	}

	async dnCreateRecentFiles(title: string, divF: HTMLDivElement, files: TFile[], num_files: number) {
		if (files.length === 0) {
			divF.createEl('h3', { cls: 'dn-subtitles', text: title });
			divF.createEl('p', { cls: 'dn-no-results-found', text: 'No files found.' });
			divF.classList.add('dn-display-none');
		} else {
			divF.createEl('h3', { cls: 'dn-subtitles', text: title });
			let sortedFiles: TFile[] = [];
			if (title === 'Recently opened') {
				sortedFiles = files.slice(0, this.num_recent_files);
			} else if (title === 'Bookmarks') {
				sortedFiles = files.slice(0, this.num_bookmarked_files);
			} else {
				sortedFiles = await this.dnGetRecentFiles(files, this.num_recent_files);

			}
			sortedFiles.forEach(sfile => {

				const aLink = divF.createEl('a', {
					cls: this.dnSetFileIconClass(sfile.extension),
					text: sfile.basename,
					title: sfile.path
				});

				aLink.onClickEvent((evt: MouseEvent) => {
					if (sfile !== null) {
						this.dnOpenFileAlt(sfile, evt);
					}
				});

				aLink.setAttribute('tabindex', '0');

				if (sfile.extension !== 'md') {
					divF.createEl('span', { cls: 'nav-file-tag', text: sfile.extension })
				}

				divF.createEl('br');

				aLink.addEventListener('mouseover', (evt: MouseEvent) => { this.dnHandleHoverPreview(evt, sfile); });
				aLink.addEventListener('contextmenu', (evt: MouseEvent) => { this.dnGenerateContextMenu(evt, sfile); });
			});
		}
	}

	dnSetFileIconClass(ext: string) {
		const file_extension = ext.toLowerCase();

		const extensions: Record<string, string> = {
			'md': 'note',
			// Images
			'avif': 'image',
			'bmp': 'image',
			'gif': 'image',
			'ico': 'image',
			'jpeg': 'image',
			'jpg': 'image',
			'png': 'image',
			'raw': 'image',
			'svg': 'image',
			'tif': 'image',
			'tiff': 'image',
			'webp': 'image',
			// Audio files
			'aac': 'audio',
			'aif': 'audio',
			'aifc': 'audio',
			'aiff': 'audio',
			'flac': 'audio',
			'm4a': 'audio',
			'mp3': 'audio',
			'ogg': 'audio',
			'wav': 'audio',
			'webm': 'audio',
			// Videos
			'avi': 'video',
			'mov': 'video',
			'mkv': 'video',
			'mp4': 'video',
			// PDF and other formats
			'pdf': 'pdf',
			'canvas': 'canvas',
			'base': 'base'
		};

		if (file_extension in extensions) {
			return 'dn-f-' + extensions[file_extension];
		} else {
			return 'dn-f-other';
		}
	}

	// Custom Colors
	dnSetCustomColors(): void {
		document.body.style.setProperty('--dn-notes-color', this.color_notes);
		document.body.style.setProperty('--dn-images-color', this.color_images);
		document.body.style.setProperty('--dn-canvas-color', this.color_canvas);
		document.body.style.setProperty('--dn-videos-color', this.color_videos);
		document.body.style.setProperty('--dn-audios-color', this.color_audios);
		document.body.style.setProperty('--dn-pdfs-color', this.color_pdf);
		document.body.style.setProperty('--dn-other-color', this.color_other);
		document.body.style.setProperty('--dn-bases-color', this.color_bases);
	}

	dnToggleColoredFiles(): void {
		const dnMainContainer = document.getElementById("dn-container");
		if (this.colored_files) {
			dnMainContainer?.classList.add('dn-colored-files');
		} else {
			dnMainContainer?.classList.remove('dn-colored-files');
		}
		this.dnSetCustomColors();
	}

	dnSetView(view: number): void {
		const divElements = [this._VIEW_DASHBOARD, this._VIEW_NAVIGATOR, this._VIEW_TAGS];
		const topNavBtns = [this._BTN_DASHBOARD, this._BTN_NAVIGATOR, this._BTN_TAGS];

		divElements.forEach(el => {
			el.classList.add('dn-display-none');
			el.classList.remove('dn-flex');
		});
		topNavBtns.forEach(btn => btn.classList.remove('mod-cta'));

		switch (view) {
			case 1:
				this._VIEW_DASHBOARD.classList.remove('dn-display-none');
				this._VIEW_DASHBOARD.classList.add('dn-flex');
				this._BTN_DASHBOARD.classList.add('mod-cta');

				this.dnHideTopRightNav();
				this.INPUT_SEARCH.focus();
				break;
			case 2:
				this._VIEW_NAVIGATOR.classList.remove('dn-display-none');
				this._VIEW_NAVIGATOR.classList.add('dn-flex');
				this._BTN_NAVIGATOR.classList.add('mod-cta');

				this.dnShowTopRightNav();
				this.INPUT_SEARCH.focus();
				break;
			case 3:
				this._VIEW_TAGS.classList.remove('dn-display-none');
				this._VIEW_TAGS.classList.add('dn-flex');
				this._BTN_TAGS.classList.add('mod-cta');

				this.dnHideTopRightNav();
				this.TAGS_INPUT_SEARCH.focus();
				break;
			default:
				this._VIEW_DASHBOARD.classList.remove('dn-display-none');
				this._VIEW_DASHBOARD.classList.add('dn-flex');
				this._BTN_DASHBOARD.classList.add('mod-cta');

				this.dnHideTopRightNav();
				this.INPUT_SEARCH.focus();
		}

	}

	dnShowTopRightNav(): void {
		this._SELECT_SORT.classList.remove('dn-display-none');
		this._SELECT_TABLE_LAYOUT.classList.remove('dn-display-none');
		this.labelLayout.classList.remove('dn-display-none');
		this.labelSort.classList.remove('dn-display-none');
	}

	dnHideTopRightNav(): void {
		this._SELECT_SORT.classList.add('dn-display-none');
		this._SELECT_TABLE_LAYOUT.classList.add('dn-display-none');
		this.labelLayout.classList.add('dn-display-none');
		this.labelSort.classList.add('dn-display-none');
	}

	dnSetSelectSortValue(val: string): void {
		if (this.dnIsValidSort(val)) {

			this.selected_sort_value = val;
			this._SELECT_SORT.value = this.selected_sort_value;
		}
	}

	dnSetSelectLayoutValue(val: string): void {
		if (this.dnIsValidLayout(val)) {

			this._SELECT_TABLE_LAYOUT.value = val;
			this.dnSelectTableLayout();
		}
	}

	dnSelectTableLayout(): void {
		const val = this._SELECT_TABLE_LAYOUT.value;

		if (this._TABLE_LAYOUTS.includes(val)) {
			const tbl = document.getElementById('dn-table');
			this._TABLE_LAYOUTS.forEach(layout => tbl?.classList.remove(layout));
			tbl?.classList.add(val);
			this.selected_table_layout = val;
		}
	}

	private dnSelectTableRow(evt: MouseEvent) {
		if (!evt || typeof evt !== 'object') {
			return;
		}
		if (evt.target instanceof HTMLTableCellElement) {
			const allTr = document.querySelectorAll('#dn-table tr');
			allTr.forEach(row => row.classList.remove('tbl-selected'));
			const clickedTr = evt.target.parentElement as HTMLTableRowElement;
			clickedTr.classList.add('tbl-selected');
		}
	}

	private dnGenerateContextMenu(evt: MouseEvent, file: TFile) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		evt.stopPropagation();

		if (this._DN_CTX_MENU) {
			this._DN_CTX_MENU.hide();
		}

		const existingMenu = document.querySelector('.menu');
		if (existingMenu) {
			document.body.click();
		}

		this._DN_CTX_MENU = new Menu();

		const extension = file.extension;
		const totalLimit = 30;
		let displayTitle = "";

		if (file.name.length > totalLimit) {
			const charsToKeep = Math.max(0, totalLimit - extension.length - 6);

			displayTitle = `${file.basename.slice(0, charsToKeep)}... (${extension})`;
		} else {
			displayTitle = `${file.basename} (${extension})`;
		}

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle(`Open ${displayTitle}`)
				.setIcon('mouse-pointer-2')
				.onClick(() => {
					this.app.workspace.getLeaf(false).openFile(file);
					this.close();
				})
		);

		this._DN_CTX_MENU.addSeparator();

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Open in new tab')
				.setIcon('file-plus')
				.onClick(() => {
					this.app.workspace.getLeaf('tab').openFile(file);
					this.close();
				})
		);

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Open to the right')
				.setIcon('separator-vertical')
				.onClick(() => {
					this.app.workspace.getLeaf('split').openFile(file);
					this.close();
				})
		);

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Open in new window')
				.setIcon('picture-in-picture-2')
				.onClick(() => {
					this.app.workspace.getLeaf('window').openFile(file);
				})
		);

		this._DN_CTX_MENU.addSeparator();

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Show preview')
				.setIcon('eye')
				.onClick((evt: MouseEvent) => {
					this.dnShowPreviewFile(evt, file);
				})
		);


		this._DN_CTX_MENU.addSeparator();

		// Backlinks
		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Backlinks')
				.setIcon('links-coming-in')
				.onClick(() => {
					const backlinksModal = new DNSpecialBacklinksModal(this.app, this, file);
					this.openSubModal(backlinksModal);
				})
		);

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Outgoing links')
				.setIcon('links-going-out')
				.onClick(() => {
					const outgoingLinksModal = new DNSpecialOutgoingLinksModal(this.app, this, file);
					this.openSubModal(outgoingLinksModal);
				})
		);

		this._DN_CTX_MENU.addSeparator();

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('File tags')
				.setIcon('tags')
				.onClick(() => {
					// Tags modal
					const tagsModal = new DNFileTagsModal(this.app, file, {
						handleTagActions: (evt, tag) => this.handleTagActions(evt, tag),
						dnOpenFile: (file: TFile) => this.dnOpenFile(file)
					});
					this.openSubModal(tagsModal);
				})
		);

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('File frontmatter')
				.setIcon('text')
				.onClick(() => {
					// Frontmatter modal
					const fmModal = new DNFileFrontmatterModal(this.app, file, {
						mainInputSearch: this.INPUT_SEARCH,
						dnModalSearchVault: (val) => this.dnModalSearchVault(val),
						dnOpenFile: (file: TFile) => this.dnOpenFile(file),
					});
					this.openSubModal(fmModal);
				})
		);

		this._DN_CTX_MENU.addSeparator();

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('File properties')
				.setIcon('file-cog')
				.onClick(() => {
					const filePropsModal = new DNFilePropertiesModal(this.app, file, {
						handleTagActions: (evt, tag) => this.handleTagActions(evt, tag),
						dnModalSearchVault: (val) => this.dnModalSearchVault(val),
						dnOpenFile: (file) => this.dnOpenFile(file),
						mainInputSearch: this.INPUT_SEARCH,
						dateFormat: this.date_format
					});
					this.openSubModal(filePropsModal);

				})
		);

		this._DN_CTX_MENU.showAtMouseEvent(evt);
	}

	private dnHandleClick(evt: MouseEvent, file?: TFile) {
		if (!evt || typeof evt !== 'object' || !(file instanceof TFile)) {
			return;
		}

		this.dnSelectTableRow(evt);
	}

	private dnHandleDblClick(evt: MouseEvent, file?: TFile) {
		if (!evt || typeof evt !== 'object' || !(file instanceof TFile)) {
			return;
		}

		evt.preventDefault();
		this.dnSelectTableRow(evt);
		this.dnOpenFile(file);
	}

	private dnHandleIntersection = (entries: IntersectionObserverEntry[]) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) {
				entry.target.removeEventListener('click', this.dnHandleClick);
				entry.target.removeEventListener('dblclick', this.dnHandleDblClick);
			}
		});
	}

	private dnHandleHoverPreview(evt: MouseEvent, file: TFile) {
		evt.stopImmediatePropagation();
		if (evt.ctrlKey || evt.metaKey) {
			this.dnShowPreviewFile(evt, file);

		}
	}

	dnShowPreviewFile(evt: MouseEvent, file: TFile) {
		if (this.activePreview) {
			this.activePreview.close();
			this.activePreview = null;
		}

		this.activePreview = new DNPreviewModal(this.app, file, {
			dnOpenFile: (f: TFile) => this.dnOpenFile(f),
		});

		// Open the preview modal
		this.openSubModal(this.activePreview);

		// Wrap the original onClose to ensure our reference stays synced
		const originalOnClose = this.activePreview.onClose.bind(this.activePreview);
		this.activePreview.onClose = () => {
			originalOnClose();
			this.activePreview = null;
		};

		this.modalEl.addEventListener('click', () => this.dnHidePreview(), { once: true });
	}

	private dnHidePreview() {
		if (this.activePreview) {
			this.activePreview.close();
			this.activePreview = null;
		}

		this.modalEl.removeEventListener('click', () => this.dnHidePreview());
	}

	private dnHandleNormalSearch(rExp: RegExp, file: TFile): boolean {
		return rExp.test(file.name.toLowerCase())
			|| rExp.test(getFolderStructure(file.path).toLowerCase())
			|| rExp.test(moment(file.stat.mtime).format(this.date_format))
			|| rExp.test(getTagsPerFile(file).toLowerCase())
			|| rExp.test(getPropsPerFile(file).toLowerCase());
	}

	private dnHandleSpecialSearch(search: string, file: TFile) {

		const mtime = moment(file.stat.mtime);

		// Generate the UI label -> date range using @date(range)
		this.labelDateRangeFilter = this.generateDateRangeLabel(search);

		// Date range
		// - Starts with d( or date(
		// - Contains EXACTLY one delimiter'..' 
		// - Ends with )
		const dateMatch = search.match(/^(?:d|date)\((.*)\)$/);


		if (dateMatch) {
			const content = dateMatch[1].trim();

			// Check -> date range delimiter '..'
			if (content.includes('..')) {
				const parts = content.split('..');
				if (parts.length !== 2) return false; // Strict delimiter check (only one delimiter)

				let startStr = parts[0].trim();
				let endStr = parts[1].trim();

				// Handle open-ended syntax
				if (startStr === "") startStr = "1970-01-01";
				if (endStr === "") endStr = "@d";

				// Parse date -> dnParseDateRange
				const startDate = this.dnParseDateRange(startStr, false);
				const endDate = this.dnParseDateRange(endStr, true);

				if (!startDate || !endDate) return false;
				return mtime.isBetween(startDate, endDate, 'day', '[]');
			}

			else {
				const m = moment(content === "@d" || content === "d" ? moment() : content, ["YYYY-MM-DD", "YYYY-MM", "YYYY"], true);
				if (!m.isValid()) return false;

				if (content.length === 4) return mtime.isSame(m, 'year');
				if (content.length === 7) return mtime.isSame(m, 'month');
				return mtime.isSame(m, 'day');
			}
		}

		this.labelDateRangeFilter = "";

		switch (search) {
			case 'd':
			case 'day':
			case 'today':
				return mtime.isSame(moment(), 'day');
			case 'd-1':
			case 'day-1':
			case 'yesterday':
				return mtime.isBetween(moment().subtract(1, 'days'), moment(), 'day', '[]');
			case 'd-2':
			case 'day-2':
				return mtime.isBetween(moment().subtract(2, 'days'), moment(), 'day', '[]');
			case 'd-3':
			case 'day-3':
				return mtime.isBetween(moment().subtract(3, 'days'), moment(), 'day', '[]');
			case 'd-4':
			case 'day-4':
				return mtime.isBetween(moment().subtract(4, 'days'), moment(), 'day', '[]');
			case 'd-5':
			case 'day-5':
				return mtime.isBetween(moment().subtract(5, 'days'), moment(), 'day', '[]');
			case 'd-6':
			case 'day-6':
				return mtime.isBetween(moment().subtract(6, 'days'), moment(), 'day', '[]');
			case 'd-7':
			case 'day-7':
			case 'w':
			case 'week':
				return mtime.isBetween(moment().subtract(7, 'days'), moment(), 'day', '[]');
			case 'm':
			case 'month':
				return mtime.isSame(moment(), 'month');
			case 'm-1':
			case 'month-1':
				return mtime.isBetween(moment().subtract(1, 'month'), moment(), 'month', '[]');
			case 'm-2':
			case 'month-2':
				return mtime.isBetween(moment().subtract(2, 'month'), moment(), 'month', '[]');
			case 'm-3':
			case 'month-3':
				return mtime.isBetween(moment().subtract(3, 'month'), moment(), 'month', '[]');
			case 'm-4':
			case 'month-4':
				return mtime.isBetween(moment().subtract(4, 'month'), moment(), 'month', '[]');
			case 'm-5':
			case 'month-5':
				return mtime.isBetween(moment().subtract(5, 'month'), moment(), 'month', '[]');
			case 'm-6':
			case 'month-6':
				return mtime.isBetween(moment().subtract(6, 'month'), moment(), 'month', '[]');
			case 'm-7':
			case 'month-7':
				return mtime.isBetween(moment().subtract(7, 'month'), moment(), 'month', '[]');
			case 'm-8':
			case 'month-8':
				return mtime.isBetween(moment().subtract(8, 'month'), moment(), 'month', '[]');
			case 'm-9':
			case 'month-9':
				return mtime.isBetween(moment().subtract(9, 'month'), moment(), 'month', '[]');
			case 'm-10':
			case 'month-10':
				return mtime.isBetween(moment().subtract(10, 'month'), moment(), 'month', '[]');
			case 'm-11':
			case 'month-11':
				return mtime.isBetween(moment().subtract(11, 'month'), moment(), 'month', '[]');
			case 'm-12':
			case 'month-12':
				return mtime.isBetween(moment().subtract(12, 'month'), moment(), 'month', '[]');
			case 'y':
			case 'year':
				return mtime.isSame(moment(), 'year');
			case 'n':
			case 'notes':
				return this._notes.includes(file);
			case 'c':
			case 'canvases':
			case 'canvas':
				return this._canvas.includes(file);
			case 'i':
			case 'images':
				return this._images.includes(file);
			case 'a':
			case 'audio':
			case 'audios':
				return this._audios.includes(file);
			case 'v':
			case 'video':
			case 'videos':
				return this._videos.includes(file);
			case 'p':
			case 'pdf':
			case 'pdfs':
				return this._pdf.includes(file);
			case 'o':
			case 'other':
			case 'others':
				return this._other.includes(file);
			case 'bm':
			case 'bookmarks':
				return this._bookmarks.includes(file);
			case 'bb':
			case 'bases':
				return this._bases.includes(file);
			case 'tags':
				this.dnSetView(3);
				this.TAGS_INPUT_SEARCH.value = this.INPUT_SEARCH.value.replace(/@\S+/g, '');
				return this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);

			default:
				return false;
		}
	}

	private dnParseDateRange(part: string, isEnd: boolean): moment.Moment | null {
		let m;

		if (part === 'd' || part === '@d') {
			m = moment();
		} else {
			m = moment(part, ["YYYY-MM-DD", "YYYY-MM", "YYYY"], true);
		}

		if (!m || !m.isValid()) return null;

		if (isEnd) {
			if (part.length === 4) return m.endOf('year');
			if (part.length === 7) return m.endOf('month');
			return m.endOf('day');
		} else {
			if (part.length === 4) return m.startOf('year');
			if (part.length === 7) return m.startOf('month');
			return m.startOf('day');
		}
	}

	/**
	 * Date range label
	 * Input: "@d(2025-01..2025-03)" or "@d(2025-10)"
	 * Output: "Jan 1, 2025 → Mar 31, 2025" or "October 2025"
	 * Returns -> "" for non-matching syntax (like usual @d-7 syntax)
	 */
	private generateDateRangeLabel(search: string): string {

		const dateMatch = search.match(/^(?:d|date)\((.*)\)$/);

		if (!dateMatch) return "";

		const content = dateMatch[1].trim();

		// Check date range delimiter ..
		if (content.includes('..')) {
			const parts = content.split('..');
			if (parts.length !== 2) return "";

			const startStr = parts[0].trim();
			const endStr = parts[1].trim();

			// Resolve start date
			let startLabel = "Beginning";
			if (startStr !== "" && startStr !== "1970-01-01") {
				const mStart = moment(startStr, ["YYYY-MM-DD", "YYYY-MM", "YYYY"], true);
				if (mStart.isValid()) {
					// Snap to start of period
					startLabel = mStart.startOf('day').format("MMM D, YYYY");
				}
			}

			// Resolve end date
			let endLabel = "Today";
			if (endStr !== "" && endStr !== "@d" && endStr !== "d") {
				const mEnd = moment(endStr, ["YYYY-MM-DD", "YYYY-MM", "YYYY"], true);
				if (mEnd.isValid()) {
					// Snap to end of period based on input length
					if (endStr.length === 4) mEnd.endOf('year');
					else if (endStr.length === 7) mEnd.endOf('month');
					else mEnd.endOf('day');

					endLabel = mEnd.format("MMM D, YYYY");
				}
			}

			return `${startLabel} → ${endLabel}`;
		}

		// Handle specific params (Year, Month, or Day)
		const isToday = content === "@d" || content === "d";
		const m = isToday ? moment() : moment(content, ["YYYY-MM-DD", "YYYY-MM", "YYYY"], true);

		if (!m.isValid()) return "";

		if (isToday) return m.format("MMM D, YYYY");

		// Determine label style
		if (content.length === 4) return `Year ${m.format("YYYY")}`;
		if (content.length === 7) return m.format("MMMM YYYY");
		return m.format("MMM D, YYYY");
	}

	dnOpenFileAlt(f: TFile, evt: MouseEvent) {
		if (!evt || typeof evt !== 'object' || !(f instanceof TFile)) {
			return;
		}

		try {

			if ((evt.button === 0) && (evt.ctrlKey || evt.metaKey)) {
				this.app.workspace.getLeaf('tab').openFile(f);
			} else if (evt.button === 1) {
				this.app.workspace.getLeaf('tab').openFile(f);

			} else if (evt.button === 0) {
				this.dnOpenFile(f);
			}
		} catch (er) {
			return;
		}
	}

	dnOpenFile(file: TFile) {
		this.app.workspace.getLeaf(false).openFile(file);
		this.close();
	}


	// TODO: show Preview modal
	private handleTagActions(evt: MouseEvent, tag: string) {
		if (evt.button === 2) {
			evt.preventDefault();
		} else if (evt.button === 0 && (evt.shiftKey)) {
			this.dnAddTagToSearch(tag, false);
		} else if (evt.button === 0 && (evt.ctrlKey || evt.metaKey)) {
			this.dnAddTagToSearch(tag, true);
		} else if (evt.button === 1 && (evt.shiftKey || evt.ctrlKey || evt.metaKey)) {
			this.clearSearchField();
		} else {
			this.INPUT_SEARCH.value = tag;
			this.dnModalSearchVault(this.INPUT_SEARCH.value);
		}

	}

	private handleTagActionsTagsDashboard(evt: MouseEvent, tag: string) {
		this.modalEl.scrollTo({ top: 0, behavior: 'smooth' });
		this.TAGS_SIDEBAR_EL.scrollTo({ top: 0, behavior: 'smooth' });

		if (evt.button === 2) {
			evt.preventDefault();
		} else if (evt.button === 0 && (evt.shiftKey)) {
			this.dnAddTagToSearchTD(tag, false);
		} else if (evt.button === 0 && (evt.ctrlKey || evt.metaKey)) {
			this.dnAddTagToSearchTD(tag, true);
		} else if (evt.button === 1 && (evt.shiftKey || evt.ctrlKey || evt.metaKey)) {
			this.clearTagsSearchField();
		} else {
			this.TAGS_INPUT_SEARCH.value = tag;
			this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);
		}

	}

	// Tag actions -> add/remove tag and/or !tag
	dnAddTagToSearch(tag: string, exclude = false): void {
		let searchTerms = this.INPUT_SEARCH.value.split(' ');

		const lowerCaseTag = tag.toLowerCase();
		const targetTag = exclude ? `!${lowerCaseTag}` : lowerCaseTag;
		const oppositeTag = exclude ? lowerCaseTag : `!${lowerCaseTag}`;

		searchTerms = searchTerms.filter(term => term !== oppositeTag);

		const index = searchTerms.indexOf(targetTag);
		if (index !== -1) {
			searchTerms.splice(index, 1);
		} else {
			searchTerms.push(targetTag);
		}

		const newSearchValue = searchTerms.join(' ');
		this.INPUT_SEARCH.value = newSearchValue;
		this.dnModalSearchVault(this.INPUT_SEARCH.value);
	}

	dnAddTagToSearchTD(tag: string, exclude = false): void {
		let searchTerms = this.TAGS_INPUT_SEARCH.value.toLowerCase().split(' ');

		const lowerCaseTag = tag.toLowerCase();
		const targetTag = exclude ? `!${lowerCaseTag}` : lowerCaseTag;
		const oppositeTag = exclude ? lowerCaseTag : `!${lowerCaseTag}`;

		searchTerms = searchTerms.filter(term => term !== oppositeTag);

		const index = searchTerms.indexOf(targetTag);
		if (index !== -1) {
			searchTerms.splice(index, 1);
		} else {
			searchTerms.push(targetTag);
		}

		const newSearchValue = searchTerms.join(' ');
		this.TAGS_INPUT_SEARCH.value = newSearchValue;
		this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);
		this.modalEl.scrollTo({ top: 0, behavior: 'smooth' });
		this.TAGS_SIDEBAR_EL.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async dnLoadSearchOnClose() {
		if (this.remember_last_search) {
			this.INPUT_SEARCH.value = this.plugin.settings.onclose_search;
			this.plugin.saveSettings();
		} else {
			this.INPUT_SEARCH.value = '';
		}
	}

	dnSaveStateOnClose() {
		this.plugin.settings.primary_tags_results_visible = this.primary_tags_results_visible;
		this.plugin.settings.tags_sidebar = this.tags_sidebar;
		this.plugin.settings.tags_sidebar_sorted_by_frequency = this.tags_sidebar_sorted_by_frequency;
		if (this.remember_last_search) {
			this.plugin.settings.onclose_search = this.INPUT_SEARCH.value;
		} else {
			this.plugin.settings.onclose_search = '';
		}
		this.plugin.saveSettings();
	}

	async dnRedrawResultsTable() {
		await this.dnShowModalSearchResults({ f: this._files_results, el: this._divSearchResults, leaf: this._leaf, currentPage: this.current_page });
	}

	private dnTDGetTags(file: TFile): string[] {
		const cur_file = this.app.vault.getAbstractFileByPath(file.path);
		if (cur_file !== null) {

			const tags = this.app.metadataCache.getFileCache(file)?.tags;
			const frontmatter_tags = this.app.metadataCache.getFileCache(file)?.frontmatter;
			const arrTags: string[] = [];

			if (tags) {
				for (let i = 0, len = tags.length; i < len; i++) {

					if (arrTags.indexOf(tags[i].tag) < 0) {
						arrTags.push(tags[i].tag);
					}
				}
			}

			if (frontmatter_tags !== undefined && frontmatter_tags.tags) {
				for (let i = 0, len = frontmatter_tags.tags.length; i < len; i++) {
					const fmTag = '#' + frontmatter_tags.tags[i];
					if (arrTags.indexOf(fmTag) < 0) {
						arrTags.push(fmTag);
					}
				}

			}
			return arrTags;
		} else {
			return [];
		}
	}

	private dnTDSearchTags(val: string) {
		if (val === '') {
			this.TAGS_RECENT_FILES_EL.classList.remove('dn-hidden');
			this.BTN_CLEAR_TAGS_INPUT_SEARCH.style.display = 'none';
		} else {
			this.TAGS_RECENT_FILES_EL.classList.add('dn-hidden');
			this.BTN_CLEAR_TAGS_INPUT_SEARCH.style.display = 'flex';
		}

		const tagSearchInput = val.trim();

		if (!tagSearchInput) {

			this.TAGS_RESULTS_EL.empty();

			this.tagsCurrentPage = 0;
			this.filteredPrimaryTagNotes = [];

			this.generateTagsSidebar(this.TAGS_SIDEBAR_EL, this._data.tags);
			return;
		}

		this.TAGS_RESULTS_EL.empty();

		const allNotes = this._notes;

		const allInputTags = tagSearchInput.split(' ').filter(t => t.length > 0);
		const primarySearchTags = allInputTags
			.filter(t => !t.startsWith('!'))
			.map(t => t.startsWith('#') ? t : `#${t}`);
		const excludedSearchTags = allInputTags
			.filter(t => t.startsWith('!'))
			.map(t => t.substring(1).startsWith('#') ? t.substring(1) : `#${t.substring(1)}`);

		const normalizedPrimaryTags = primarySearchTags.map(t => t.toLowerCase());
		const normalizedExcludedTags = excludedSearchTags.map(t => t.toLowerCase());

		const primaryTagHeading = primarySearchTags.length > 1
			? `${primarySearchTags.join(' ')}`
			: `${primarySearchTags[0] || 'No primary tag(s)'}`;

		const primaryTagsDiv = this.TAGS_RESULTS_EL.createEl('div', { cls: 'dn-td-tag-group-card dn-td-primary-tag-group' });
		const headingEl = primaryTagsDiv.createEl('h3', { text: primaryTagHeading });

		if (excludedSearchTags.length > 0) {
			headingEl.createEl('span', {
				text: ` (NOT ${excludedSearchTags.join(' NOT ')})`,
				cls: 'dn-td-excluded-tags'
			});
		}

		const btnTogglePrimaryTagsResults = primaryTagsDiv.createEl('button', { cls: 'btn-td-toggle-primary-tags' });
		btnTogglePrimaryTagsResults.setAttribute('aria-label', 'Toggle primary tags results');
		btnTogglePrimaryTagsResults.setAttribute('data-tooltip-position', 'bottom');
		// Primary tags results container
		this.PRIMARY_TAGS_RESULTS_DIV = primaryTagsDiv.createEl('div', { cls: 'dn-td-primary-tags-results' });

		if (this.primary_tags_results_visible) {
			btnTogglePrimaryTagsResults.textContent = '-';
			this.PRIMARY_TAGS_RESULTS_DIV.classList.remove('dn-hidden');
		} else {
			btnTogglePrimaryTagsResults.textContent = '+';
			this.PRIMARY_TAGS_RESULTS_DIV.classList.add('dn-hidden');
		}

		btnTogglePrimaryTagsResults.onClickEvent(() => {

			this.primary_tags_results_visible = !this.primary_tags_results_visible;
			this.PRIMARY_TAGS_RESULTS_DIV.classList.toggle('dn-hidden', !this.primary_tags_results_visible);
			if (this.primary_tags_results_visible) {
				btnTogglePrimaryTagsResults.textContent = '-';
			} else {
				btnTogglePrimaryTagsResults.textContent = '+';
			}
		});

		const primaryTagNotes: TFile[] = [];
		const secondaryTagGroups = new Map<string, TFile[]>();

		for (const file of allNotes) {
			const tagsForFileOriginalCase = this.dnTDGetTags(file);
			const tagsForFileNormalized = tagsForFileOriginalCase.map(tag => tag.toLowerCase());

			const hasAllPrimaryTags = normalizedPrimaryTags.every(inputTag => tagsForFileNormalized.includes(inputTag));
			const hasExcludedTags = normalizedExcludedTags.some(excludedTag => tagsForFileNormalized.includes(excludedTag));

			if (hasAllPrimaryTags && !hasExcludedTags) {
				primaryTagNotes.push(file);

				const secondaryTagsOriginalCase = tagsForFileOriginalCase.filter(tag =>
					!normalizedPrimaryTags.includes(tag.toLowerCase()) && !normalizedExcludedTags.includes(tag.toLowerCase())
				);

				for (const secTagOriginalCase of secondaryTagsOriginalCase) {
					if (!secondaryTagGroups.has(secTagOriginalCase)) {
						secondaryTagGroups.set(secTagOriginalCase, []);
					}
					secondaryTagGroups.get(secTagOriginalCase)?.push(file);
				}
			}
		}

		this.filteredPrimaryTagNotes = primaryTagNotes.sort((a, b) => b.stat.mtime - a.stat.mtime);

		const sortedSecondaryTagGroups = new Map(
			Array.from(secondaryTagGroups.entries()).sort(([tagNameA], [tagNameB]) =>
				tagNameA.toLowerCase().localeCompare(tagNameB.toLowerCase())
			)
		);

		this.generateTagsSidebar(this.TAGS_SIDEBAR_EL, sortedSecondaryTagGroups);

		const TAGS_PAGINATION_LIMIT = 10;
		const startIndex = this.tagsCurrentPage * TAGS_PAGINATION_LIMIT;
		const endIndex = startIndex + TAGS_PAGINATION_LIMIT;

		const displayPrimaryNotes = this.filteredPrimaryTagNotes.slice(startIndex, endIndex);

		if (this.filteredPrimaryTagNotes.length === 0) {
			primaryTagsDiv.createEl('p', { text: 'No notes found matching the specified tag(s).', cls: 'dn-td-no-notes-message' });
		} else {
			// Create the pagination section
			const paginationDiv = this.PRIMARY_TAGS_RESULTS_DIV.createEl('div', { cls: 'dn-td-pagination' });

			// Add the total results count on the left
			paginationDiv.createEl('div', {
				text: `File(s): ${this.filteredPrimaryTagNotes.length}`,
				cls: 'dn-pagination-total-results'
			});

			const dnTdPaginationDiv = paginationDiv.createEl('div', { cls: 'dn-pagination-current-page' });
			const totalPages = Math.ceil(this.filteredPrimaryTagNotes.length / TAGS_PAGINATION_LIMIT);
			dnTdPaginationDiv.createEl('span', { text: ` Page ${this.tagsCurrentPage + 1} of ${totalPages} `, cls: 'dn-td-total-pages' });

			const prevButton = dnTdPaginationDiv.createEl('button', { text: '◀', title: 'Previous', cls: 'dn-btn-prev' });
			prevButton.disabled = this.tagsCurrentPage === 0;
			prevButton.onClickEvent(() => {
				this._tagsPrevPage();
			});

			const nextButton = dnTdPaginationDiv.createEl('button', { text: '▶', title: 'Next', cls: 'dn-btn-next' });
			nextButton.disabled = this.tagsCurrentPage >= totalPages - 1;
			nextButton.onClickEvent(() => {
				this._tagsNextPage();
			});

			for (const note of displayPrimaryNotes) {
				const linkPrimaryTag = this.PRIMARY_TAGS_RESULTS_DIV.createEl('a', {
					text: note.basename,
					href: note.path,
					title: `${note.path}\n\n${moment(note.stat.mtime).format(this.date_format)} - Modified\n${moment(note.stat.ctime).format(this.date_format)} - Created`,
					cls: 'dn-f-note'
				});
				linkPrimaryTag.setAttribute('data-href', note.path);
				linkPrimaryTag.setAttribute('tabindex', '0');
				linkPrimaryTag.onClickEvent((evt: MouseEvent) => {
					if (this._leaf !== null && note !== null) {
						this.dnOpenFileAlt(note, evt);
					}
				});
				linkPrimaryTag.addEventListener('mouseover', (evt: MouseEvent) => this.dnHandleHoverPreview(evt, note));
				linkPrimaryTag.addEventListener('contextmenu', (evt: MouseEvent) => this.dnGenerateContextMenu(evt, note));

			}
		}

		const secondaryTagsDiv = this.TAGS_RESULTS_EL.createEl('div', { cls: 'dn-td-secondary-tags-container' });

		for (const [secTag, notesInGroup] of sortedSecondaryTagGroups.entries()) {

			notesInGroup.sort((a, b) => b.stat.mtime - a.stat.mtime);

			const secTagDiv = secondaryTagsDiv.createEl('div', { cls: 'dn-td-tag-group-card dn-td-secondary-tag-group' });

			const secTagH3Link = secTagDiv.createEl('h3', { text: secTag });
			secTagH3Link.onClickEvent((evt: MouseEvent) => {
				this.handleTagActionsTagsDashboard(evt, secTag);
			});
			secTagH3Link.setAttribute('tabindex', '0');

			const displayNotes = notesInGroup.slice(0, 5);

			for (const note of displayNotes) {
				const linkSecondaryTag = secTagDiv.createEl('a', {
					text: note.basename,
					href: note.path,
					title: `${note.path}\n\n${moment(note.stat.mtime).format(this.date_format)} - Modified\n${moment(note.stat.ctime).format(this.date_format)} - Created`,
					cls: 'dn-f-note'
				});
				linkSecondaryTag.setAttribute('data-href', note.path);
				linkSecondaryTag.setAttribute('tabindex', '0');
				linkSecondaryTag.onClickEvent((evt: MouseEvent) => {
					if (this._leaf !== null && note !== null) {
						this.dnOpenFileAlt(note, evt);
					}
				});
				linkSecondaryTag.addEventListener('mouseover', (evt: MouseEvent) => this.dnHandleHoverPreview(evt, note));
				linkSecondaryTag.addEventListener('contextmenu', (evt: MouseEvent) => this.dnGenerateContextMenu(evt, note));
				secTagDiv.createEl('br');
			}

			if (notesInGroup.length > 5) {
				secTagDiv.createEl('br');
				secTagDiv.createEl('button', { text: `Show All (${notesInGroup.length})`, cls: 'dn-td-show-more' }).onClickEvent(() => {
					this.tagsCurrentPage = 0;

					const currentInput = this.TAGS_INPUT_SEARCH.value;
					const newTag = secTag.startsWith('#') ? secTag : `#${secTag}`;
					if (!currentInput.includes(newTag)) {
						this.TAGS_INPUT_SEARCH.value = currentInput + ' ' + newTag;
						this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);
					}

					this.modalEl.scrollTo({ top: 0, behavior: 'smooth' });
					this.TAGS_SIDEBAR_EL.scrollTo({ top: 0, behavior: 'smooth' });
				});
			}
		}
		this.TAGS_INPUT_SEARCH.focus();
	}

	private _tagsPrevPage() {
		if (this.tagsCurrentPage > 0) {
			this.tagsCurrentPage--;
			this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);
		}
	}

	private _tagsNextPage() {
		this.tagsCurrentPage++;
		this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value);
	}

	generateTagsSidebar(el: HTMLDivElement, tags: Map<string, TFile[]>) {

		el.empty();

		const container = el.createEl('div', { cls: 'dn-td-sidebar-container' });

		// Add sidebar title
		container.createEl('div', { text: 'Sort tags by:', cls: 'dn-tags-sidebar-label' });

		const sortButtonsContainer = container.createEl('div', { cls: 'dn-td-sidebar-sort-buttons' });

		const btnAlphaSort = sortButtonsContainer.createEl('button', {
			text: 'Tag name (A-Z)',
			cls: 'dn-td-sidebar-sort-button'
		});
		btnAlphaSort.setAttribute('aria-label', 'Sort sidebar tags by name (A-Z) ');
		btnAlphaSort.setAttribute('data-tooltip-position', 'bottom');

		const btnFrequencySort = sortButtonsContainer.createEl('button', {
			text: 'Frequency (high to low)',
			cls: 'dn-td-sidebar-sort-button'
		});

		btnFrequencySort.setAttribute('aria-label', 'Sort sidebar tags by frequency (high to low) ');
		btnFrequencySort.setAttribute('data-tooltip-position', 'bottom');

		if (this.tags_sidebar_sorted_by_frequency) {
			btnFrequencySort.classList.add('tags-sort-active');
			btnAlphaSort.classList.remove('tags-sort-active');
		} else {
			btnAlphaSort.classList.add('tags-sort-active');
			btnFrequencySort.classList.remove('tags-sort-active');
		}

		btnAlphaSort.onClickEvent(() => {
			this.tags_sidebar_sorted_by_frequency = false;
			btnAlphaSort.classList.add('tags-sort-active');
			btnFrequencySort.classList.remove('tags-sort-active');
			this.renderTags(tags);
		});

		btnFrequencySort.onClickEvent(() => {
			this.tags_sidebar_sorted_by_frequency = true;
			btnFrequencySort.classList.add('tags-sort-active');
			btnAlphaSort.classList.remove('tags-sort-active');
			this.renderTags(tags);
		});

		this.TAGS_SIDEBAR_LIST_DIV = container.createEl('div', { cls: 'dn-td-sidebar-tags-list' });

		this.renderTags(tags);

	}

	private renderTags(tags: Map<string, TFile[]>) {
		this.TAGS_SIDEBAR_LIST_DIV.empty();

		// Sort the tags array (alphabetically or by tag frequency)
		const tagsToRender = Array.from(tags.entries());
		if (this.tags_sidebar_sorted_by_frequency) {
			tagsToRender.sort((a, b) => b[1].length - a[1].length);
		} else {
			tagsToRender.sort((a, b) => {
				const tagNameA = a[0];
				const tagNameB = b[0];
				const lowerCaseTagNameA = tagNameA.toLowerCase();
				const lowerCaseTagNameB = tagNameB.toLowerCase();
				return lowerCaseTagNameA.localeCompare(lowerCaseTagNameB);
			});

		}

		if (tagsToRender.length === 0) {
			this.TAGS_SIDEBAR_LIST_DIV.createEl('div', {
				text: 'No matching tags found.',
				cls: 'dn-td-sidebar-tag-div'
			});
			return;
		}

		for (const [tag, files] of tagsToRender) {
			const tagEl = this.TAGS_SIDEBAR_LIST_DIV.createEl('div', { cls: 'dn-td-sidebar-tag-div' });
			tagEl.createEl('a', { cls: 'tag', text: tag.replace('#', ''), href: tag });
			tagEl.onClickEvent((evt: MouseEvent) => {
				this.handleTagActionsTagsDashboard(evt, tag);
			});
			tagEl.createEl('span', { text: files.length.toString(), cls: 'dn-tag-count' });
		}
	}

	onClose() {
		super.onClose();

		if (this.INPUT_SEARCH && this.INPUT_SEARCH.removeEventListener) {
			this.INPUT_SEARCH.removeEventListener('input', debounce(() => this.dnModalSearchVault(this.INPUT_SEARCH.value), 300, true));
		}
		this._th1.removeEventListener('dblclick', () => this.dnAlternateSortColumn('name'));
		this._th2.removeEventListener('dblclick', () => this.dnAlternateSortColumn('ext'));
		this._th3.removeEventListener('dblclick', () => this.dnAlternateSortColumn('path'));
		this._th4.removeEventListener('dblclick', () => this.dnAlternateSortColumn('size'));
		this._th5.removeEventListener('dblclick', () => this.dnAlternateSortColumn('modified'));
		this._SELECT_SORT.removeEventListener('change', () => { this.dnSortColumnWithSelect(); });

		this.TAGS_INPUT_SEARCH.removeEventListener('input', debounce(() => this.dnTDSearchTags(this.TAGS_INPUT_SEARCH.value), 300, true));

		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}

		this.dnSaveStateOnClose();

		this.dnHidePreview();
	}

}