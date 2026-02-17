import { App, TFile } from 'obsidian';
import { getFolderStructure } from 'src/utils/format';
import { getTagsPerFile } from 'src/utils/tags';
import { DNBaseModal } from '../dnbasemodal';
import { DNModalHelpers } from '../typesmodals';

export class DNFileTagsModal extends DNBaseModal {
	private file: TFile;
	private helpers: DNModalHelpers;

	constructor(app: App, file: TFile, helpers: DNModalHelpers) {
		super(app);
		this.file = file;
		this.helpers = helpers;
	}

	render() {
		const { contentEl } = this;

		contentEl.classList.add('dn-tags-modal');

		// Header
		contentEl.createEl('div', {
			text: 'File tags',
			cls: 'setting-item setting-item-heading dn-modal-heading'
		});

		// Info Rows
		this.renderRow(contentEl, 'Name: ', this.file.name);
		this.renderRow(contentEl, 'Path: ', getFolderStructure(this.file.path));

		// Tags List Section
		const tagsDiv = contentEl.createDiv({ cls: 'dn-tags-list' });
		tagsDiv.setAttribute('contenteditable', 'true');
		tagsDiv.setAttribute('spellcheck', 'false');

		const mTags = getTagsPerFile(this.file);

		if (mTags?.trim()) {
			mTags.split(' ').forEach((tag) => {
				const tagLine = tagsDiv.createDiv({ cls: 'dn-tag-line' });
				const tagAnchor = tagLine.createEl('a', { cls: 'tag', text: tag });
				tagAnchor.setAttribute('tabindex', '0');

				tagAnchor.onClickEvent((evt: MouseEvent) => {
					this.helpers.handleTagActions?.(evt, tag);
					tagAnchor.focus();
				});
			});
		} else {
			tagsDiv.createEl('span', { text: 'No tags' });
		}

		// Footer Buttons
		const divBottom = contentEl.createDiv({ cls: 'dn-div-bottom-properties' });

		const btnOpen = divBottom.createEl('button', { text: 'Open', cls: 'dn-btn-properties-open-file' })
		btnOpen.setAttribute('tabindex', '0');
		btnOpen.onClickEvent(() => {
			this.helpers.dnOpenFile?.(this.file);
			this.close();
		});

		tagsDiv.blur();
	}

	private renderRow(parent: HTMLElement, label: string, value: string) {
		const row = parent.createDiv({ cls: 'dn-property-row' });
		row.createDiv({ text: label, cls: 'dn-property-name-sm' });
		row.createDiv({ text: value, cls: 'dn-property-value' });
	}

}