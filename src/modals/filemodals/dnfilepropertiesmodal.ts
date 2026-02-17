
import { App, TFile, moment } from 'obsidian';
import { formatFileSize, formatFileSizeKBMB, getFolderStructure } from 'src/utils/format';
import { getPropsPerFile, getTagsPerFile } from 'src/utils/tags';
import { DNBaseModal } from '../dnbasemodal';
import { DNModalHelpers } from '../typesmodals';

export class DNFilePropertiesModal extends DNBaseModal {
	private file: TFile;
	private helpers: DNModalHelpers;

	constructor(app: App, file: TFile, helpers: DNModalHelpers) {
		super(app);
		this.file = file;
		this.helpers = helpers;
	}


	render() {
		const { contentEl } = this;

		contentEl.classList.add('dn-properties-modal');

		// Header
		contentEl.createEl('div', {
			text: 'File properties',
			cls: 'setting-item setting-item-heading dn-modal-heading'
		});

		const date_fmt = this.helpers.dateFormat || "YYYY-MM-DD";

		// Info Rows
		this.renderRow(contentEl, 'Name: ', this.file.name);


		const rowExt = contentEl.createEl('div', { cls: 'dn-property-row' });
		rowExt.createEl('div', { text: 'Extension: ', cls: 'dn-property-name' });

		const rowExtValue = rowExt.createEl('div', { cls: 'dn-property-value' });
		rowExtValue.createEl('span', { text: this.file.extension, cls: 'nav-file-tag' });

		this.renderRow(contentEl, 'Path: ', getFolderStructure(this.file.path));

		contentEl.createEl('br');

		const rowSize = contentEl.createEl('div', { cls: 'dn-property-row' });
		rowSize.createEl('div', { text: 'Size: ', cls: 'dn-property-name' });
		rowSize.createEl('div', { text: formatFileSize(this.file.stat.size) + ' bytes' + formatFileSizeKBMB(this.file.stat.size) });

		contentEl.createEl('br');

		const rowDateCreated = contentEl.createEl('div', { cls: 'dn-property-row' });
		rowDateCreated.createEl('div', { text: 'Created: ', cls: 'dn-property-name' });
		rowDateCreated.createEl('div', { text: moment(this.file.stat.ctime).format(date_fmt) });

		const rowDateModified = contentEl.createEl('div', { cls: 'dn-property-row' });
		rowDateModified.createEl('div', { text: 'Modified: ', cls: 'dn-property-name' });
		rowDateModified.createEl('div', { text: moment(this.file.stat.mtime).format(date_fmt) });

		contentEl.createEl('br');

		const rowTags = contentEl.createEl('div', { cls: 'dn-property-row' });
		rowTags.createEl('div', { text: 'Tag(s): ', cls: 'dn-property-name' });
		const propTags = rowTags.createEl('div');

		const curTags = getTagsPerFile(this.file);

		if (curTags !== '') {

			const tags = curTags.split(' ');
			for (let i = 0, len = tags.length; i < len; i++) {

				const aTagLink = propTags.createEl('a', { text: tags[i], href: tags[i], cls: 'tag' });
				aTagLink.setAttribute('tabindex', '0');

				aTagLink.onClickEvent((evt: MouseEvent) => {
					this.helpers.handleTagActions?.(evt, tags[i]);
					aTagLink.focus();
				});
			}
		} else {
			propTags.createEl('span', { text: 'No tags' });
		}

		const rowFrontmatter = contentEl.createEl('div', { cls: 'dn-property-row' });
		rowFrontmatter.createEl('div', { text: 'Frontmatter: ', cls: 'dn-property-name' });
		const rowFrontmatterValue = rowFrontmatter.createEl('div', { cls: 'dn-property-value' });

		const frontmatterProps = rowFrontmatterValue.createEl('div', { cls: 'dn-properties-frontmatter' });
		frontmatterProps.setAttribute('contenteditable', 'true');
		frontmatterProps.setAttribute('spellcheck', 'false');

		const curProps = getPropsPerFile(this.file);

		if (curProps) {

			const prop = curProps.split(' \n');

			for (let i = 0, len = prop.length; i < len; i++) {

				const fmLink = frontmatterProps.createEl('a', { text: prop[i], cls: 'dn-fproperties' });
				fmLink.setAttribute('tabindex', '0');

				fmLink.onClickEvent((evt: MouseEvent) => {

					if (evt.button === 2) {
						evt.preventDefault();
					} else {

						if (this.helpers.mainInputSearch) {
							this.helpers.mainInputSearch.value = prop[i];
						}

						this.helpers.dnModalSearchVault?.(prop[i]);

						this.close();
					}

				});

				frontmatterProps.createEl('br');

			}
		} else {

			frontmatterProps.createEl('span', { text: 'No frontmatter' });

		}

		contentEl.createEl('br');

		const divBottom = contentEl.createEl('div', { cls: 'dn-div-bottom-properties' });

		const btnPropsOpen = divBottom.createEl('button', { text: 'Open', cls: 'dn-btn-properties-open-file' });
		btnPropsOpen.onClickEvent(() => {
			this.helpers.dnOpenFile?.(this.file);
			this.close();
		});

		frontmatterProps.blur();
	}

	private renderRow(parent: HTMLElement, label: string, value: string) {
		const row = parent.createDiv({ cls: 'dn-property-row' });
		row.createDiv({ text: label, cls: 'dn-property-name-sm' });
		row.createDiv({ text: value, cls: 'dn-property-value' });
	}

}

