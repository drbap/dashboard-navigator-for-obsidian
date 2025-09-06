import { App, Menu, Modal, TFile } from 'obsidian';
import { DNModal } from 'src/dn';
import { getBacklinksToFile } from 'src/utils/dnlinks';
import { getFolderStructure } from 'src/utils/format';
import { DNPreviewComponent } from '../utils/dnpreviewcomponent';

const ITEMS_PER_PAGE = 5;

export class DNSpecialBacklinksModal extends Modal {
	private _targetFile: TFile;
	private _backlinks: TFile[];
	private _previewComponents: DNPreviewComponent[] = [];
	private _dn_modal: DNModal;
	private _currentPage = 1;

	constructor(app: App, modal: DNModal, _targetFile: TFile) {
		super(app);
		this._targetFile = _targetFile;
		this._backlinks = getBacklinksToFile(this._targetFile);

		// Sort backlinks modification time
		this._backlinks.sort((a, b) => b.stat.mtime - a.stat.mtime);

		this._dn_modal = modal;
	}

	onOpen() {
		this.renderContent();
	}

	onClose() {
		const { contentEl } = this;
		// Unload all preview components
		this._previewComponents.forEach(comp => comp.onunload());
		this._previewComponents = [];
		contentEl.empty();
	}

	private reloadContent() {
		this._backlinks = getBacklinksToFile(this._targetFile);
		this._backlinks.sort((a, b) => b.stat.mtime - a.stat.mtime);
		this.renderContent();
	}

	private renderContent() {
		const { contentEl } = this;
		contentEl.empty();

		const topStickyContainer = contentEl.createEl('div', { cls: 'dn-modal-sticky' });

		const btnClosePreview = topStickyContainer.createEl('div', { cls: 'modal-close-button' });

		btnClosePreview.onClickEvent(() => {
			this.close();
		});

		topStickyContainer.createEl('div', { text: 'Backlinks', cls: 'setting-item setting-item-heading dn-modal-heading' });

		const rowName = topStickyContainer.createEl('div', { cls: 'dn-property-row' });
		rowName.createEl('div', { text: 'Target file: ', cls: 'dn-property-name' });
		rowName.createEl('div', { text: this._targetFile.name, cls: 'dn-property-value' });

		const rowPath = topStickyContainer.createEl('div', { cls: 'dn-property-row' });
		rowPath.createEl('div', { text: 'Path: ', cls: 'dn-property-name' });
		rowPath.createEl('div', { text: getFolderStructure(this._targetFile.path), cls: 'dn-property-value' });

		const rowTotalBacklinks = topStickyContainer.createEl('div', { cls: 'dn-property-row' });
		rowTotalBacklinks.createEl('div', { text: 'Total: ', cls: 'dn-property-name' });

		const total_backlinks = this._backlinks.length;
		let total_backlinks_string = '';
		if (total_backlinks === 1) {
			total_backlinks_string = this._backlinks.length.toString() + ' backlink';

		} else {
			total_backlinks_string = this._backlinks.length.toString() + ' backlinks'
		}

		rowTotalBacklinks.createEl('div', { text: total_backlinks_string, cls: 'dn-property-value' });

		// Pagination at the top of the container
		this.renderPagination(topStickyContainer);

		// Backlinks container
		const listContainer = contentEl.createEl('div', { cls: 'dn-links-list-container' });

		// No backlinks
		if (this._backlinks.length === 0) {
			listContainer.createEl('div', { text: 'No backlinks found.' });
			return;
		}

		// Pagination
		const startIndex = (this._currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const paginatedBacklinks = this._backlinks.slice(startIndex, endIndex);

		paginatedBacklinks.forEach((backlinkFile) => {
			const listItemDiv = listContainer.createEl('div', { cls: 'dn-links-list-item' });

			const fileHeader = listItemDiv.createEl('div', { text: backlinkFile.path, cls: 'dn-link-file-header' });

			// Content -> dn preview component
			const contentPreviewEl = listItemDiv.createEl('div', { cls: 'dn-link-preview' });
			const previewComponent = new DNPreviewComponent(this.app, contentPreviewEl, backlinkFile);

			this._previewComponents.push(previewComponent);
			previewComponent.onload();

			fileHeader.addEventListener('click', (evt) => {
				evt.preventDefault();
				this.app.workspace.openLinkText(backlinkFile.path, this._targetFile.path);
				this.close();
				this._dn_modal.close();
			});

			fileHeader.addEventListener('contextmenu', (evt: MouseEvent) => {
				const menu = new Menu();

				menu.addItem((item) => {
					item.setTitle('Open')
						.setIcon('mouse-pointer-2')
						.onClick(() => {
							this.app.workspace.openLinkText(backlinkFile.path, this._targetFile.path);
							this.close();
							this._dn_modal.close();
						});
				});

				menu.addSeparator();

				menu.addItem((item) => {
					item.setTitle('Open in new tab')
						.setIcon('file-plus')
						.onClick(() => {
							this.app.workspace.openLinkText(backlinkFile.path, this._targetFile.path, 'tab');
						});
				});

				menu.addItem((item) => {
					item.setTitle('Open to the right')
						.setIcon('separator-vertical')
						.onClick(() => {
							this.app.workspace.openLinkText(backlinkFile.path, this._targetFile.path, 'split');
						});
				});

				menu.addItem((item) => {
					item.setTitle('Open in new window')
						.setIcon('picture-in-picture-2')
						.onClick(() => {
							this.app.workspace.openLinkText(backlinkFile.path, this._targetFile.path, 'window');
						});
				});

				menu.showAtMouseEvent(evt);
			});
		});
	}

	private renderPagination(parentEl: HTMLElement) {
		const totalPages = Math.ceil(this._backlinks.length / ITEMS_PER_PAGE);

		const paginationDiv = parentEl.createEl('div', { cls: 'dn-modal-sticky-pagination' });

		if (totalPages > 0) {

			const btnReload = paginationDiv.createEl('button', { cls: 'dn-btn-next', text: 'Reload', title: 'Reload content' });
			btnReload.addEventListener('click', () => {
				this.reloadContent();
			});

			paginationDiv.createEl('span', {
				text: `Page ${this._currentPage} of ${totalPages}`,
				cls: 'pagination-status',
			});

			const btnPrev = paginationDiv.createEl('button', { cls: 'dn-btn-prev', text: '◀', title: 'Previous' });
			btnPrev.disabled = this._currentPage === 1;
			btnPrev.addEventListener('click', () => {
				this._currentPage -= 1;
				this.renderContent();
			});


			const btnNext = paginationDiv.createEl('button', { cls: 'dn-btn-next', text: '▶', title: 'Next' });
			btnNext.disabled = this._currentPage === totalPages;
			btnNext.addEventListener('click', () => {
				this._currentPage += 1;
				this.renderContent();
			});


		}

	}
}