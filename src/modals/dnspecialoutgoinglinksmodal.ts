import { App, Menu, Modal, TFile } from 'obsidian';
import { DNModal } from 'src/dn';
import { getOutgoingLinks } from 'src/utils/dnlinks';
import { getFolderStructure } from 'src/utils/format';
import { DNPreviewComponent } from '../utils/dnpreviewcomponent';

const ITEMS_PER_PAGE = 5;

export class DNSpecialOutgoingLinksModal extends Modal {
	private _originFile: TFile;
	private _outgoingLinks: TFile[];
	private _previewComponents: DNPreviewComponent[] = [];
	private _dn_modal: DNModal;
	private _currentPage = 1;

	constructor(app: App, modal: DNModal, _originFile: TFile) {
		super(app);
		this._originFile = _originFile;
		this._outgoingLinks = getOutgoingLinks(this._originFile);

		// Sort links modification time
		this._outgoingLinks.sort((a, b) => b.stat.mtime - a.stat.mtime);

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
		this._outgoingLinks = getOutgoingLinks(this._originFile);
		this._outgoingLinks.sort((a, b) => b.stat.mtime - a.stat.mtime);
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

		topStickyContainer.createEl('div', { text: 'Outgoing links', cls: 'setting-item setting-item-heading dn-modal-heading' });

		const rowName = topStickyContainer.createEl('div', { cls: 'dn-property-row' });
		rowName.createEl('div', { text: 'Origin file: ', cls: 'dn-property-name' });
		rowName.createEl('div', { text: this._originFile.name, cls: 'dn-property-value' });

		const rowPath = topStickyContainer.createEl('div', { cls: 'dn-property-row' });
		rowPath.createEl('div', { text: 'Path: ', cls: 'dn-property-name' });
		rowPath.createEl('div', { text: getFolderStructure(this._originFile.path), cls: 'dn-property-value' });

		const rowTotalOutgoingLinks = topStickyContainer.createEl('div', { cls: 'dn-property-row' });
		rowTotalOutgoingLinks.createEl('div', { text: 'Total: ', cls: 'dn-property-name' });

		const total_olinks = this._outgoingLinks.length;
		let total_olinks_string = '';
		if (total_olinks === 1) {
			total_olinks_string = this._outgoingLinks.length.toString() + ' outgoing link';

		} else {
			total_olinks_string = this._outgoingLinks.length.toString() + ' outgoing links'
		}

		rowTotalOutgoingLinks.createEl('div', { text: total_olinks_string, cls: 'dn-property-value' });

		// Pagination at the top of the container
		this.renderPagination(topStickyContainer);

		// Outgoing links container
		const listContainer = contentEl.createEl('div', { cls: 'dn-links-list-container' });

		// No outgoing links
		if (this._outgoingLinks.length === 0) {
			listContainer.createEl('div', { text: 'No outgoing links found.' });
			return;
		}

		// Pagination
		const startIndex = (this._currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const paginatedOLinks = this._outgoingLinks.slice(startIndex, endIndex);

		paginatedOLinks.forEach((oLinkFile) => {
			const listItemDiv = listContainer.createEl('div', { cls: 'dn-links-list-item' });

			const fileHeader = listItemDiv.createEl('div', { text: oLinkFile.path, cls: 'dn-link-file-header' });

			// Content -> dn preview component
			const contentPreviewEl = listItemDiv.createEl('div', { cls: 'dn-link-preview' });
			const previewComponent = new DNPreviewComponent(this.app, contentPreviewEl, oLinkFile);

			this._previewComponents.push(previewComponent);
			previewComponent.onload();

			fileHeader.addEventListener('click', (evt) => {
				evt.preventDefault();
				this.app.workspace.openLinkText(oLinkFile.path, this._originFile.path);
				this.close();
				this._dn_modal.close();
			});

			fileHeader.addEventListener('contextmenu', (evt: MouseEvent) => {
				const menu = new Menu();

				menu.addItem((item) => {
					item.setTitle('Open')
						.setIcon('mouse-pointer-2')
						.onClick(() => {
							this.app.workspace.openLinkText(oLinkFile.path, this._originFile.path);
							this.close();
							this._dn_modal.close();
						});
				});

				menu.addSeparator();

				menu.addItem((item) => {
					item.setTitle('Open in new tab')
						.setIcon('file-plus')
						.onClick(() => {
							this.app.workspace.openLinkText(oLinkFile.path, this._originFile.path, 'tab');
						});
				});

				menu.addItem((item) => {
					item.setTitle('Open to the right')
						.setIcon('separator-vertical')
						.onClick(() => {
							this.app.workspace.openLinkText(oLinkFile.path, this._originFile.path, 'split');
						});
				});

				menu.addItem((item) => {
					item.setTitle('Open in new window')
						.setIcon('picture-in-picture-2')
						.onClick(() => {
							this.app.workspace.openLinkText(oLinkFile.path, this._originFile.path, 'window');
						});
				});

				menu.showAtMouseEvent(evt);
			});
		});
	}

	private renderPagination(parentEl: HTMLElement) {
		const totalPages = Math.ceil(this._outgoingLinks.length / ITEMS_PER_PAGE);

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