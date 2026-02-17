import { App, TFile, MarkdownRenderer, normalizePath, Component } from 'obsidian';
import { getFolderStructure } from 'src/utils/format';
import { DNBaseModal } from '../dnbasemodal';
import { DNModalHelpers } from '../typesmodals';

export class DNPreviewModal extends DNBaseModal {
	private file: TFile;
	private helpers: DNModalHelpers;
	private previewComponent: Component;

	private isDragging = false;
	private startX: number;
	private startY: number;

	constructor(app: App, file: TFile, helpers: DNModalHelpers) {
		super(app);
		this.file = file;
		this.helpers = helpers;
		this.previewComponent = new Component();
	}

	async onOpen() {
		super.onOpen();
		this.prepareFloatingWindow();
		this.previewComponent.load();
		this.render();
	}

	onClose() {
		this.previewComponent.unload();
		super.onClose();
	}

	private prepareFloatingWindow() {
		const { modalEl, containerEl } = this;

		const modalBg = containerEl.querySelector('.modal-bg') as HTMLElement;
		if (modalBg) modalBg.style.display = 'none';

		containerEl.style.pointerEvents = 'none';
		modalEl.style.pointerEvents = 'auto';
		modalEl.classList.add('dn-preview');
	}

	render() {
		const { contentEl, modalEl } = this;
		contentEl.empty();

		const topStickyBar = contentEl.createEl('div', { cls: 'dn-preview-top-bar' });

		const btnDivClosePreview = topStickyBar.createEl('div', {
			text: '✕',
			cls: 'dn-preview-close-button' // Using the class name from your CSS
		});

		btnDivClosePreview.onClickEvent((evt: MouseEvent) => {
			evt.stopPropagation();
			this.close();
		});

		// Drag Handle / Title Bar
		const previewTop = topStickyBar.createEl('div', { cls: 'dn-preview-titlebar' });
		this.renderRow(previewTop, 'Name: ', this.file.name);
		this.renderRow(previewTop, 'Path: ', getFolderStructure(this.file.path));

		// Buttons
		const divButtons = topStickyBar.createEl('div', { cls: 'dn-div-top-preview-btns' });

		const btnOpen = divButtons.createEl('button', { text: 'Open', cls: 'dn-btn-preview-action' });
		btnOpen.setAttribute('tabindex', '0');

		btnOpen.onClickEvent(() => {
			this.helpers.dnOpenFile?.(this.file);
			this.close();
		});

		// Open in new tab
		const btnTab = divButtons.createEl('button', { text: 'Open in new tab', cls: 'dn-btn-preview-action' });
		btnTab.setAttribute('tabindex', '0');

		btnTab.onClickEvent(() => {
			this.app.workspace.getLeaf('tab').openFile(this.file);
			this.close();
		});

		// Open in new window
		const btnWindow = divButtons.createEl('button', { text: 'Open in new window', cls: 'dn-btn-preview-action' });
		btnWindow.setAttribute('tabindex', '0');

		btnWindow.onClickEvent(() => {
			this.app.workspace.getLeaf('window').openFile(this.file);
			this.close();
		});

		// Render Area
		const renderContainer = contentEl.createEl('div', { cls: 'dn-pr-content' });
		try {
			MarkdownRenderer.render(
				this.app,
				'![[' + normalizePath(this.file.path) + ']]',
				renderContainer,
				normalizePath(this.file.path),
				this.previewComponent
			);
		} catch (e) {
			renderContainer.setText("Preview unavailable.");
		}

		this.initDragLogic(previewTop, modalEl);
	}

	private initDragLogic(handle: HTMLElement, target: HTMLElement) {

		const onMouseMove = (e: MouseEvent) => {
			if (!this.isDragging) return;
			target.style.position = 'fixed';
			target.style.left = `${e.clientX - this.startX}px`;
			target.style.top = `${e.clientY - this.startY}px`;
			target.style.margin = '0';
		};

		const onMouseUp = () => {
			this.isDragging = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};

		handle.addEventListener('mousedown', (e) => {
			// Block drag if clicking a button
			if (e.button !== 0 || (e.target as HTMLElement).tagName === 'BUTTON') return;

			this.isDragging = true;
			const rect = target.getBoundingClientRect();
			this.startX = e.clientX - rect.left;
			this.startY = e.clientY - rect.top;
			window.addEventListener('mousemove', onMouseMove);
			window.addEventListener('mouseup', onMouseUp);
		});
	}

	private renderRow(parent: HTMLElement, label: string, value: string) {
		const row = parent.createDiv({ cls: 'dn-property-row' });
		row.createDiv({ text: label, cls: 'dn-property-name-sm' });
		row.createDiv({ text: value, cls: 'dn-property-value' });
	}
}