import { App, debounce, Menu, Modal, TAbstractFile, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { formatFileSize, getFolderStructure } from './utils/format';
import { DNPieChart } from './utils/piechart';
import { moment } from 'obsidian';

export class DNModal extends Modal {
	private _files: TFile[];
	private _folders: TFolder[];
	private _notes: TFile[];
	private _recent: TFile[];
	private _images: TFile[];
	private _canvas: TFile[];
	private _audios: TFile[];
	private _videos: TFile[];
	private _pdf: TFile[];
	private _other: TFile[];
	private _BTN_DASHBOARD: HTMLButtonElement;
	private _BTN_NAVIGATOR: HTMLButtonElement;
	private _VIEW_DASHBOARD: HTMLElement;
	private _VIEW_NAVIGATOR: HTMLElement;
	private _INPUT_SEARCH: HTMLInputElement;
	private _divSearchResults: HTMLDivElement;
	private _leaf: WorkspaceLeaf;
	private _filtered_files: TFile[];
	private _sort_order: string = 'desc';
	private _sort_column: string = 'modified';
	private _th1: HTMLTableCellElement;
	private _th2: HTMLTableCellElement;
	private _th3: HTMLTableCellElement;
	private _th4: HTMLTableCellElement;
	private _th5: HTMLTableCellElement;
	private _total_pages: number;

	private _SELECT_SORT: HTMLSelectElement;
	private _SELECT_TABLE_LAYOUT: HTMLSelectElement;

	private _selected_category: string = '';
	private _TABLE_LAYOUTS: string[] = ['dn-tbl-default', 'dn-tbl-row', 'dn-tbl-column', 'dn-tbl-bordered'];
	selected_table_layout: string = 'dn-tbl-default';
	selected_sort_value: string = 'modified-desc';

	num_recent_files: number = 5;
	files_per_page: number = 20;
	date_format: string = 'YYYY-MM-DD HH:mm';
	default_view: number = 1;
	excluded_extensions: string[] = [];
	excluded_folders: string[] = [];
	// File colors
	color_notes: string = '#bf48ff';
	color_images: string = '#007fff';
	color_canvas: string = '#ff7f28';
	color_videos: string = '#d34848';
	color_audios: string = '#bfbf00';
	color_pdf: string = '#00a300';
	color_other: string = '#828282';
	colored_files: boolean = false;

	labelLayout: HTMLSpanElement;
	labelSort: HTMLSpanElement;
	private readonly intersectionObserver: IntersectionObserver;
	private _DN_CTX_MENU: Menu;

	constructor(app: App) {
		super(app);
		this.intersectionObserver = new IntersectionObserver(this.dnHandleIntersection);
	}

	async onOpen() {

		const { contentEl } = this;

		this._files = [];
		this._folders = [];
		this._notes = [];
		this._recent = [];
		this._images = [];
		this._canvas = [];
		this._audios = [];
		this._videos = [];
		this._pdf = [];
		this._other = [];

		const leaf = this.app.workspace?.getMostRecentLeaf();
		if (leaf !== null) {
			this._leaf = leaf;
		}

		const dnFilesAndFolders: TAbstractFile[] = this.app.vault.getAllLoadedFiles();
		for (const absF of dnFilesAndFolders) {
			if (absF instanceof TFile) {
				this._files.push(absF);
			} else if ((absF instanceof TFolder) && (!absF.isRoot())) {
				this._folders.push(absF);
			}
		}

		this._filtered_files = this._files.filter(
			(file) => {
				return !this.excluded_extensions.includes(file.extension.toLowerCase())
					&& !this.excluded_folders.some(folder => file.path.startsWith(folder));
			}
		);

		this._files = this._filtered_files;

		await this.dnOrganizeFiles({ arr: this._filtered_files });

		this._recent = await this.dnGetRecentFiles(this._filtered_files);

		this.dnCreateMainUI(contentEl);

		this.dnSetView(this.default_view);
		this.dnSetSelectLayoutValue(this.selected_table_layout);
		this.dnSetSelectSortValue(this.selected_sort_value);

		this.dnToggleColoredFiles();
	}

	dnSetCustomColors(): void {
		document.body.style.setProperty('--dn-notes-color', this.color_notes);
		document.body.style.setProperty('--dn-images-color', this.color_images);
		document.body.style.setProperty('--dn-canvas-color', this.color_canvas);
		document.body.style.setProperty('--dn-videos-color', this.color_videos);
		document.body.style.setProperty('--dn-audios-color', this.color_audios);
		document.body.style.setProperty('--dn-pdfs-color', this.color_pdf);
		document.body.style.setProperty('--dn-other-color', this.color_other);
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

	async dnCreateMainUI(el: HTMLElement) {

		const mainContainer = el.createEl('div', { cls: 'dn-container' });
		mainContainer.setAttribute('id', 'dn-container');
		// Top Navigation
		this.dnCreateInputSearch(mainContainer);

		const topNav = mainContainer.createEl('div', { cls: 'dn-top-nav' });

		const leftTopNav = topNav.createEl('div');
		const rightTopNav = topNav.createEl('div');

		this._BTN_DASHBOARD = leftTopNav.createEl('button', { text: 'Dashboard', cls: 'mod-cta' });
		this._BTN_DASHBOARD.onClickEvent((evt: MouseEvent) => {
			this.dnSetView(1);
		});

		this._BTN_NAVIGATOR = leftTopNav.createEl('button', { text: 'Navigator' });
		this._BTN_NAVIGATOR.onClickEvent((evt: MouseEvent) => {
			this.dnSearchVault(this._INPUT_SEARCH.value);
			this.dnSetView(2);
		});

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

		const option1 = this._SELECT_SORT.createEl('option', { text: 'File name (A to Z)', value: 'name-asc' });
		const option2 = this._SELECT_SORT.createEl('option', { text: 'File name (Z to A)', value: 'name-desc' });
		const option3 = this._SELECT_SORT.createEl('option', { text: 'Path (A to Z)', value: 'path-asc' });
		const option4 = this._SELECT_SORT.createEl('option', { text: 'Path (Z to A)', value: 'path-desc' });
		const option5 = this._SELECT_SORT.createEl('option', { text: 'File size (smallest to largest)', value: 'size-asc' });
		const option6 = this._SELECT_SORT.createEl('option', { text: 'File size (largest to smallest)', value: 'size-desc' });
		const option7 = this._SELECT_SORT.createEl('option', { text: 'Date/time (oldest to newest)', value: 'modified-asc' });
		const option8 = this._SELECT_SORT.createEl('option', { text: 'Date/time (newest to oldest)', value: 'modified-desc' });


		// Containers
		this._VIEW_DASHBOARD = mainContainer.createEl('div', { cls: 'dn-flex' });

		this._VIEW_NAVIGATOR = mainContainer.createEl('div', { cls: 'dn-display-none' });

		this._divSearchResults = this._VIEW_NAVIGATOR.createEl('div', { cls: 'dn-div-table' });

		this.dnShowSearchResults({ f: this._filtered_files, el: this._divSearchResults, leaf: this._leaf })

		// Vault Stats container
		const divVaultStats = this._VIEW_DASHBOARD.createEl('div');
		divVaultStats.setAttribute('id', 'dn-vault-stats');

		const divVaultGraph = this._VIEW_DASHBOARD.createEl('div');
		divVaultGraph.setAttribute('id', 'dn-vault-graph');

		const divRecentFiles = this._VIEW_DASHBOARD.createEl('div');
		divRecentFiles.setAttribute('id', 'dn-recent-files');

		const divRecentNotes = this._VIEW_DASHBOARD.createEl('div');
		divRecentNotes.setAttribute('id', 'dn-recent-notes');;

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

		// Vault Stats

		const btnNotes = await this.dnCreateBtn(divVaultStats,
			'dn-btn-notes',
			'Notes',
			this._notes,
			this._divSearchResults,
			this._leaf);


		const btnCanvas = await this.dnCreateBtn(divVaultStats,
			'dn-btn-canvas',
			'Canvas',
			this._canvas,
			this._divSearchResults,
			this._leaf);

		const btnImages = await this.dnCreateBtn(divVaultStats,
			'dn-btn-images',
			'Images',
			this._images,
			this._divSearchResults,
			this._leaf);

		const btnAudios = await this.dnCreateBtn(divVaultStats,
			'dn-btn-audios',
			'Audios',
			this._audios,
			this._divSearchResults,
			this._leaf);

		const btnVideos = await this.dnCreateBtn(divVaultStats,
			'dn-btn-videos',
			'Videos',
			this._videos,
			this._divSearchResults,
			this._leaf);

		const btnPDF = await this.dnCreateBtn(divVaultStats,
			'dn-btn-pdf',
			'PDF',
			this._pdf,
			this._divSearchResults,
			this._leaf);

		const btnOther = await this.dnCreateBtn(divVaultStats,
			'dn-btn-other',
			'Other',
			this._other,
			this._divSearchResults,
			this._leaf);

		// Pie chart
		const canvasPieChart1 = divVaultGraph.createEl('canvas');
		canvasPieChart1.setAttribute('id', 'dashboard-canvas');

		const styles = getComputedStyle(document.body);

		const labelColor = styles.getPropertyValue('--text-muted');

		const pieChart1 = new DNPieChart(canvasPieChart1, 10, 12, 50, labelColor);

		pieChart1.addData(this._notes.length, this.color_notes, 'Notes');
		pieChart1.addData(this._images.length, this.color_images, 'Images');
		pieChart1.addData(this._canvas.length, this.color_canvas, 'Canvas');
		pieChart1.addData(this._videos.length, this.color_videos, 'Videos');
		pieChart1.addData(this._audios.length, this.color_audios, 'Audios');
		pieChart1.addData(this._pdf.length, this.color_pdf, 'PDF');
		pieChart1.addData(this._other.length, this.color_other, 'Other');
		pieChart1.draw();

		// Total files
		const divStatsFrame = divVaultGraph.createEl('div', { cls: 'dn-stats-files-folders' });

		divStatsFrame.createEl('div', { cls: 'dn-stats-files', text: 'Files: ' + this._filtered_files.length });

		// Total folders

		divStatsFrame.createEl('div', { cls: 'dn-stats-folders', text: 'Folders: ' + this._folders.length });

		// Recent files by type/category

		await this.dnCreateRecentFiles('Recent files', divRecentFiles, this._recent, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent notes', divRecentNotes, this._notes, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent canvas', divCanvas, this._canvas, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent images', divImages, this._images, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent audios', divAudios, this._audios, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent videos', divVideos, this._videos, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent PDFs', divPDFs, this._pdf, this.num_recent_files);
		await this.dnCreateRecentFiles('Recent other files', divOther, this._other, this.num_recent_files);
	}

	async dnCreateBtn(elDiv: HTMLElement,
		btnId: string,
		btnTitle: string,
		btnCategoryFiles: TFile[],
		displayEl: HTMLElement,
		leaf: WorkspaceLeaf) {

		let btn = elDiv.createEl('div', { cls: 'dn-btn-stats' });

		btn.setAttribute('id', btnId)
		btn.createEl('span', { cls: 'dn-btn-stats-label', text: btnTitle });
		btn.createEl('span', { cls: 'dn-btn-stats-icon' });
		btn.createEl('span', { cls: 'dn-btn-stats-number', text: btnCategoryFiles.length.toString() });
		btn.onClickEvent((evt: MouseEvent) => {
			this._filtered_files = btnCategoryFiles;
			this._selected_category = ' (' + btnTitle + ')';
			this.dnSortFilteredFiles(false);
			this.dnShowSearchResults({ f: btnCategoryFiles, el: displayEl, leaf });
			this.dnSetView(2);
		});

		return btn;
	}

	async dnCreateRecentFiles(title: string, divF: HTMLDivElement, files: TFile[], num_files: number) {
		if (files.length === 0) {
			divF.createEl('h3', { cls: 'dn-subtitles', text: title });
			divF.createEl('p', { cls: 'dn-no-results-found', text: 'No files found.' });
			divF.classList.add('dn-display-none');
		} else {
			divF.createEl('h3', { cls: 'dn-subtitles', text: title });
			const sortedFiles = await this.dnGetRecentFiles(files);
			sortedFiles.forEach(sfile => {
				divF.createEl('a', { cls: this.dnSetFileIconClass(sfile.extension), text: sfile.basename, title: sfile.path }).onClickEvent((evt: MouseEvent) => {
					if (sfile !== null) {
						this.dnOpenFileAlt(sfile, evt);
					}
				});
				if (sfile.extension !== 'md') {
					divF.createEl('span', { cls: 'nav-file-tag', text: sfile.extension })
				}

				divF.createEl('br');
			});
		}
	}


	dnCreateInputSearch(el: HTMLElement): void {
		const searchContainer = el.createEl('div', { cls: 'dn-search-input-container' });
		this._INPUT_SEARCH = searchContainer.createEl('input', { type: 'search', placeholder: 'Search...' });
		this._INPUT_SEARCH.setAttribute('id', 'dn-input-filter');
		this._INPUT_SEARCH.spellcheck = false;
		this._INPUT_SEARCH.focus();
		const clearInputSearch = searchContainer.createEl('div', { cls: 'search-input-clear-button' }).onClickEvent((evt: MouseEvent) => {
			this._INPUT_SEARCH.value = '';
			this._INPUT_SEARCH.focus();
			this.dnSearchVault(this._INPUT_SEARCH.value);
		});
		// Keyup event listener with debounce
		this._INPUT_SEARCH.addEventListener('input', debounce(() => this.dnSearchVault(this._INPUT_SEARCH.value), 300, true));
	}

	async dnSearchVault(val: string) {
		let rExp;
		try {
			rExp = new RegExp(val.toLowerCase(), 'iu');

		} catch (error) {
			return;
		}

		this.dnSetView(2);

		const isDateSearch = val.startsWith('@');

		if (isDateSearch) {
			this._INPUT_SEARCH.classList.add('dn-input-datesearch');
		} else {
			this._INPUT_SEARCH.classList.remove('dn-input-datesearch');
		}

		this._filtered_files = this._files.filter(
			file => {
				if (isDateSearch) {

					let mtime = moment(file.stat.mtime);
					const dateSearch = val.slice(1).toLowerCase().split(' ');

					switch (dateSearch[0]) {
						case 'day':
						case 'today':
							return mtime.isSame(moment(), 'day');
						case 'day-1':
						case 'yesterday':
							return mtime.isSame(moment().subtract(1, 'days'), 'day');
						case 'day-2':
							return mtime.isSame(moment().subtract(2, 'days'), 'day');
						case 'day-3':
							return mtime.isSame(moment().subtract(3, 'days'), 'day');
						case 'day-4':
							return mtime.isSame(moment().subtract(4, 'days'), 'day');
						case 'day-5':
							return mtime.isSame(moment().subtract(5, 'days'), 'day');
						case 'day-6':
							return mtime.isSame(moment().subtract(6, 'days'), 'day');
						case 'day-7':
							return mtime.isSame(moment().subtract(7, 'days'), 'day');
						case 'week':
							return mtime.isBetween(moment().subtract(7, 'days'), moment(), 'day', '[]');
						case 'month':
							return mtime.isSame(moment(), 'month');
						case 'year':
							return mtime.isSame(moment(), 'year');
						default:
							return false;
					}
				} else {
					return rExp.test(file.name.toLowerCase())
						|| rExp.test(getFolderStructure(file.path).toLowerCase())
						|| rExp.test(moment(file.stat.mtime).format(this.date_format))
						|| rExp.test(this.dnGetTagsPerFile(file).toLowerCase());
				}
			});

		this._selected_category = '';

		this.dnSortFilteredFiles(false);

		await this.dnShowSearchResults({ f: this._filtered_files, el: this._divSearchResults, leaf: this._leaf });

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

	async dnSortFilteredFiles(toggle: boolean) {
		switch (this._sort_column) {
			case 'name':
			case 'path':
				this.dnSortColumnString(this._sort_column, this._sort_order, toggle);
				break;
			case 'size':
			case 'modified':
				this.dnSortColumnNumber(this._sort_column, this._sort_order, toggle);
				break;
		}
	}

	dnSortColumnWithSelect(): void {
		const val = this._SELECT_SORT.value;
		if (this.dnIsValidSort(val)) {
			const selSort = val.split('-');
			this._sort_column = selSort[0];
			this._sort_order = selSort[1];

			switch (this._sort_column) {
				case 'name':
				case 'path':
					this.dnSortColumnString(this._sort_column, this._sort_order, false);
					break;
				case 'size':
				case 'modified':
					this.dnSortColumnNumber(this._sort_column, this._sort_order, false);
					break;
			}

			this.dnShowSearchResults({ f: this._filtered_files, el: this._divSearchResults, leaf: this._leaf });

		}
	}

	dnIsValidSort(val: string): boolean {
		if (['name-asc', 'name-desc', 'path-asc', 'path-desc',
			'size-asc', 'size-desc', 'modified-asc', 'modified-desc'].includes(val)) {
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

	async dnShowSearchResults({ f, el, leaf, currentPage = 1 }: { f: TFile[]; el: HTMLElement; leaf: WorkspaceLeaf; currentPage?: number }): Promise<void> {

		el.empty();

		const paginationContainer = this._divSearchResults.createEl('div', { cls: 'dn-pagination' });
		const table = el.createEl('table', { cls: this.selected_table_layout });
		table.setAttribute('id', 'dn-table');

		const thead = table.createEl('thead');
		const tr = thead.createEl('tr');
		this._th1 = tr.createEl('th', { text: 'Name' });
		this._th2 = tr.createEl('th', { text: 'Path' });
		this._th3 = tr.createEl('th', { text: 'Size' });
		this._th4 = tr.createEl('th', { text: 'Date' });
		this._th5 = tr.createEl('th', { text: 'Tags' });

		this._th1.addEventListener('dblclick', () => this.dnAlternateSortColumn('name'));
		this._th2.addEventListener('dblclick', () => this.dnAlternateSortColumn('path'));
		this._th3.addEventListener('dblclick', () => this.dnAlternateSortColumn('size'));
		this._th4.addEventListener('dblclick', () => this.dnAlternateSortColumn('modified'));
		const tbody = table.createEl('tbody');
		tbody.setAttribute('id', 'dn-table-results');

		if (f.length > 0) {

			if (this.intersectionObserver) {
				this.intersectionObserver.disconnect();
			}
			// Pagination
			this._total_pages = Math.ceil(f.length / this.files_per_page);
			const paginatedData = f.slice((currentPage - 1) * this.files_per_page, currentPage * this.files_per_page);

			paginatedData.forEach(async file => {
				let tr = tbody.createEl('tr');
				// Events
				tr.addEventListener('contextmenu', (evt: MouseEvent) => { this.dnHandleClick(evt, file) });
				tr.addEventListener('click', (evt: MouseEvent) => { this.dnHandleClick(evt, file) });
				tr.addEventListener('dblclick', (evt: MouseEvent) => { this.dnHandleDblClick(evt, file) });

				this.intersectionObserver.observe(tr);

				let td1 = tr.createEl('td');
				let td1Link = td1.createEl('a', { cls: this.dnSetFileIconClass(file.extension), text: file.name }).onClickEvent((evt: MouseEvent) => {
					if (leaf !== null && file !== null) {
						this.dnOpenFileAlt(file, evt);
					}
				});

				let fSize = formatFileSize(file.stat.size);
				let fMTime = moment(file.stat.mtime).format(this.date_format);
				let td2 = tr.createEl('td');
				let folder_path = getFolderStructure(file.path);
				let td2_path = td2.createEl('a', { cls: 'dn-folder-path', text: folder_path, title: file.path }).onClickEvent((evt: MouseEvent) => {
					this._INPUT_SEARCH.value = folder_path;
					this.dnSearchVault(this._INPUT_SEARCH.value + '$');
				});

				let td3 = tr.createEl('td', { text: fSize, title: fSize + ' bytes' });
				let td4 = tr.createEl('td', { text: fMTime, title: fMTime });
				let tags_per_file = this.dnGetTagsPerFile(file);
				let td5 = tr.createEl('td', { title: tags_per_file });
				let fTags = tags_per_file.split(' ');
				fTags.forEach((tag) => {
					td5.createEl('a', { cls: 'dn-tag', text: tag }).onClickEvent((evt: MouseEvent) => {
						this._INPUT_SEARCH.value = tag;
						this.dnSearchVault(this._INPUT_SEARCH.value);
					});
				});

			});

			// Add pagination
			paginationContainer.empty();
			const resultsCount = paginationContainer.createEl('span', { cls: 'dn-pagination-total-results', text: `File(s): ${f.length}` + this._selected_category });
			const currentPageIndicator = paginationContainer.createEl('span', { cls: 'dn-pagination-current-page', text: `Page ${currentPage} of ${this._total_pages}` });

			const btnPrev = paginationContainer.createEl('button', { cls: 'dn-btn-prev', text: '◀', title: 'Previous' });
			if (currentPage === 1) {
				btnPrev.disabled = true;
			} else {
				btnPrev.disabled = false;
			}
			btnPrev.addEventListener('click', () => {
				if (currentPage > 1) {
					this.dnShowSearchResults({ f, el, leaf, currentPage: currentPage - 1 });
				}
			});
			const btnNext = paginationContainer.createEl('button', { cls: 'dn-btn-next', text: '▶', title: 'Next' });
			if (currentPage === this._total_pages) {
				btnNext.disabled = true;
			} else {
				btnNext.disabled = false;
			}

			btnNext.addEventListener('click', () => {
				if (currentPage < this._total_pages) {
					this.dnShowSearchResults({ f, el, leaf, currentPage: currentPage + 1 });
				}
			});

			this.dnUpdateSortIndicators(this._sort_column,
				this._sort_order,
				this._th1,
				this._th2,
				this._th3,
				this._th4);

		} else {
			tr.empty();
			this._divSearchResults.createEl('p', { cls: 'dn-no-results-found', text: 'No files found.' });
		}
	}

	dnAlternateSortColumn(colName: string) {
		switch (colName) {
			case 'name':
				this.dnSortColumnString('name', this._sort_order, true);
				break;
			case 'path':
				this.dnSortColumnString('path', this._sort_order, true);
				break;
			case 'size':
				this.dnSortColumnNumber('size', this._sort_order, true);
				break;
			case 'modified':
				this.dnSortColumnNumber('modified', this._sort_order, true);
				break;
		}
		this.dnShowSearchResults({ f: this._filtered_files, el: this._divSearchResults, leaf: this._leaf });
	}

	dnGetTagsPerFile(file: TFile): string {
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

					if (arrTags.indexOf(frontmatter_tags.tags[i]) < 0) {
						arrTags.push('#' + frontmatter_tags.tags[i]);
					}
				}

			}
			return arrTags.join(' ');
		} else {
			return '';
		}

	}

	dnUpdateSortIndicators(activeColumn: string, sortOrder: string, col1: HTMLTableCellElement, col2: HTMLTableCellElement, col3: HTMLTableCellElement, col4: HTMLTableCellElement) {
		col1.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col2.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col3.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		col4.classList.remove('sort-active', 'sort-asc', 'sort-desc');
		let activeThCell = col4;
		switch (activeColumn) {
			case 'name':
				activeThCell = col1;
				break;
			case 'path':
				activeThCell = col2;
				break;
			case 'size':
				activeThCell = col3;
				break;
			case 'modified':
				activeThCell = col4;
				break;
		}
		activeThCell.classList.add('sort-active');
		activeThCell.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
	}

	dnSortColumnString(sortColumn: string, sortOrder: string, toggleSortOrder: boolean) {
		const supportedColumns = ['name', 'path'];

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

		this._filtered_files.sort((fileA: TFile, fileB: TFile) => {
			let sortA: string;
			let sortB: string;
			switch (sortColumn) {
				case 'name':
					sortA = fileA.name.toLowerCase();
					sortB = fileB.name.toLowerCase();
					break;
				case 'path':
					const folderStructureA = getFolderStructure(fileA.path);
					const folderStructureB = getFolderStructure(fileB.path);
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
		const supportedColumns = ['size', 'modified'];

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

		this._filtered_files.sort((fileA: TFile, fileB: TFile) => {
			let sortA: number = 0;
			let sortB: number = 0;

			switch (sortColumn) {
				case 'size':
					sortA = fileA.stat.size;
					sortB = fileB.stat.size;
					break;
				case 'modified':
					sortA = fileA.stat.mtime;
					sortB = fileB.stat.mtime;
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


	async dnGetRecentFiles(files: TFile[]): Promise<TFile[]> {
		const arrRecentFiles = files;
		return arrRecentFiles.sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, this.num_recent_files);
	}

	async dnOrganizeFiles({ arr }: { arr: TFile[] }): Promise<void> {
		const arrNotes: TFile[] = [];
		const arrImages: TFile[] = [];
		const arrAudios: TFile[] = [];
		const arrCanvas: TFile[] = [];
		const arrVideos: TFile[] = [];
		const arrPDFs: TFile[] = [];
		const arrOther: TFile[] = [];

		// formats
		const extensions: Record<string, TFile[]> = {
			'md': arrNotes,
			'png': arrImages,
			'jpg': arrImages,
			'webp': arrImages,
			'ico': arrImages,
			'bmp': arrImages,
			'gif': arrImages,
			'tif': arrImages,
			'tiff': arrImages,
			'raw': arrImages,
			'mp3': arrAudios,
			'wav': arrAudios,
			'ogg': arrAudios,
			'webm': arrAudios,
			'mp4': arrVideos,
			'avi': arrVideos,
			'pdf': arrPDFs,
			'canvas': arrCanvas
		};

		for (let i = 0, len = arr.length; i < len; i++) {
			const f = arr[i].extension.toLowerCase();
			const targetArr = extensions[f];
			if (targetArr) {
				targetArr.push(arr[i]);
			} else {
				arrOther.push(arr[i]);
			}
		}

		this._notes = arrNotes;
		this._images = arrImages;
		this._audios = arrAudios;
		this._videos = arrVideos;
		this._pdf = arrPDFs;
		this._canvas = arrCanvas;
		this._other = arrOther;
	}

	dnSetFileIconClass(ext: string) {
		const file_extension = ext.toLowerCase();

		const extensions: Record<string, string> = {
			'md': 'note',
			'png': 'image',
			'jpg': 'image',
			'webp': 'image',
			'ico': 'image',
			'bmp': 'image',
			'gif': 'image',
			'tif': 'image',
			'tiff': 'image',
			'raw': 'image',
			'mp3': 'audio',
			'wav': 'audio',
			'ogg': 'audio',
			'webm': 'audio',
			'mp4': 'video',
			'avi': 'video',
			'pdf': 'pdf',
			'canvas': 'canvas'
		};

		if (file_extension in extensions) {
			return 'dn-f-' + extensions[file_extension];
		} else {
			return 'dn-f-other';
		}
	}

	dnSetView(view: number): void {
		const divElements = [this._VIEW_DASHBOARD, this._VIEW_NAVIGATOR];
		const topNavBtns = [this._BTN_DASHBOARD, this._BTN_NAVIGATOR];

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
				break;
			case 2:
				this._VIEW_NAVIGATOR.classList.remove('dn-display-none');
				this._VIEW_NAVIGATOR.classList.add('dn-flex');
				this._BTN_NAVIGATOR.classList.add('mod-cta');
				this.dnShowTopRightNav();
				break;
			default:
				this._VIEW_DASHBOARD.classList.remove('dn-display-none');
				this._VIEW_DASHBOARD.classList.add('dn-flex');
				this._BTN_DASHBOARD.classList.add('mod-cta');
				this.dnHideTopRightNav();
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
			} else if (evt.button === 2 && !(evt.target instanceof HTMLTableCellElement)) {
				evt.preventDefault();
				this.dnGenerateContextMenu(evt, f);
			}
		} catch (er) {
			return;
		}
	}

	dnOpenFile(file: TFile) {
		this.app.workspace.getLeaf(false).openFile(file);
		this.close();
	}

	private dnHandleClick(evt: MouseEvent, file?: TFile) {
		if (!evt || typeof evt !== 'object' || !(file instanceof TFile)) {
			return;
		}

		this.dnSelectTableRow(evt);
		if (evt.button === 2) {
			evt.preventDefault();
			this.dnGenerateContextMenu(evt, file);
		}
	}

	private dnHandleDblClick(evt: MouseEvent, file?: TFile) {
		if (!evt || typeof evt !== 'object' || !(file instanceof TFile)) {
			return;
		}

		evt.preventDefault();
		this.dnSelectTableRow(evt);
		this.dnOpenFile(file);
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
		this._DN_CTX_MENU = new Menu();

		this._DN_CTX_MENU.addItem((item) =>
			item
				.setTitle('Open')
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
				.setTitle('File properties')
				.setIcon('file-cog')
				.onClick(() => {
					const mdFileProps = new Modal(this.app);
					mdFileProps.contentEl.createEl('h4', { text: 'Properties' });

					const propFileName = mdFileProps.contentEl.createEl('div');
					propFileName.createEl('span', { text: 'File name: ', cls: 'dn-properties' });
					propFileName.createEl('span', { text: file.basename });
					mdFileProps.contentEl.createEl('br');

					const propFileExt = mdFileProps.contentEl.createEl('div');
					propFileExt.createEl('span', { text: 'Extension: ', cls: 'dn-properties' });
					propFileExt.createEl('span', { text: file.extension, cls: 'nav-file-tag' });
					mdFileProps.contentEl.createEl('br');

					const propFilePath = mdFileProps.contentEl.createEl('div');
					propFilePath.createEl('span', { text: 'Path: ', cls: 'dn-properties' });
					propFilePath.createEl('span', { text: getFolderStructure(file.path) });
					mdFileProps.contentEl.createEl('br');

					const propFileSize = mdFileProps.contentEl.createEl('div');
					propFileSize.createEl('span', { text: 'Size: ', cls: 'dn-properties' });
					propFileSize.createEl('span', { text: formatFileSize(file.stat.size) + ' bytes' });
					mdFileProps.contentEl.createEl('br');

					const propDateCreated = mdFileProps.contentEl.createEl('div');
					propDateCreated.createEl('span', { text: 'Created: ', cls: 'dn-properties' });
					propDateCreated.createEl('span', { text: moment(file.stat.ctime).format(this.date_format) });
					mdFileProps.contentEl.createEl('br');

					const propDateModified = mdFileProps.contentEl.createEl('div');
					propDateModified.createEl('span', { text: 'Modified: ', cls: 'dn-properties' });
					propDateModified.createEl('span', { text: moment(file.stat.mtime).format(this.date_format) });
					mdFileProps.contentEl.createEl('br');

					const propTags = mdFileProps.contentEl.createEl('div');
					const curTags = this.dnGetTagsPerFile(file);
					propTags.createEl('span', { text: 'Tag(s): ', cls: 'dn-properties' });
					if (curTags) {
						const tags = curTags.split(' ');
						for (let i = 0, len = tags.length; i < len; i++) {
							propTags.createEl('a', { text: tags[i], cls: 'dn-tag' }).onClickEvent((evt: MouseEvent) => {
								mdFileProps.close();
								this._INPUT_SEARCH.value = tags[i];
								this.dnSearchVault(this._INPUT_SEARCH.value);
							});
						};
					} else {
						propTags.createEl('span', { text: 'No tags' });
					}

					mdFileProps.contentEl.createEl('br');



					mdFileProps.contentEl.createEl('hr');

					const divBottom = mdFileProps.contentEl.createEl('div', { cls: 'dn-div-bottom-properties' });
					const btnCloseProps = divBottom.createEl('button', { text: 'Ok', cls: 'dn-btn-close-properties' });
					btnCloseProps.onClickEvent(() => {
						mdFileProps.close();
					});

					mdFileProps.open();
				})
		);

		this._DN_CTX_MENU.showAtMouseEvent(evt);
	}

	private dnHandleIntersection = (entries: IntersectionObserverEntry[]) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) {
				entry.target.removeEventListener('contextmenu', this.dnHandleClick);
				entry.target.removeEventListener('click', this.dnHandleClick);
				entry.target.removeEventListener('dblclick', this.dnHandleDblClick);
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();

		if (this._INPUT_SEARCH && this._INPUT_SEARCH.removeEventListener) {
			this._INPUT_SEARCH.removeEventListener('input', debounce(() => this.dnSearchVault(this._INPUT_SEARCH.value), 300, true));
		}
		this._th1.removeEventListener('dblclick', () => this.dnAlternateSortColumn('name'));
		this._th2.removeEventListener('dblclick', () => this.dnAlternateSortColumn('path'));
		this._th3.removeEventListener('dblclick', () => this.dnAlternateSortColumn('size'));
		this._th4.removeEventListener('dblclick', () => this.dnAlternateSortColumn('modified'));
		this._SELECT_SORT.removeEventListener('change', () => { this.dnSortColumnWithSelect(); });

		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}
	}
}
