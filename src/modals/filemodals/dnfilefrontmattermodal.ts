import { App, TFile } from 'obsidian';
import { getFolderStructure } from 'src/utils/format';
import { getPropsPerFile } from 'src/utils/tags';
import { DNBaseModal } from '../dnbasemodal';
import { DNModalHelpers } from '../typesmodals';

export class DNFileFrontmatterModal extends DNBaseModal {
	private file: TFile;
	private helpers: DNModalHelpers;

	constructor(app: App, file: TFile, helpers: DNModalHelpers) {
		super(app);
		this.file = file;
		this.helpers = helpers;
	}



	render() {
		const { contentEl } = this;

		contentEl.classList.add('dn-frontmatter-modal');

		// Header
		contentEl.createEl('div', {
			text: 'File frontmatter',
			cls: 'setting-item setting-item-heading dn-modal-heading'
		});

		// Info Rows
		this.renderRow(contentEl, 'Name: ', this.file.name);
		this.renderRow(contentEl, 'Path: ', getFolderStructure(this.file.path));


		const frontmatterDiv = contentEl.createEl('div', { cls: 'dn-properties-frontmatter-modal' });
		frontmatterDiv.setAttribute('contenteditable', 'true');
		frontmatterDiv.setAttribute('spellcheck', 'false');

		const curProps = getPropsPerFile(this.file);
		if (curProps) {
			const prop = curProps.split(' \n');
			for (let i = 0, len = prop.length; i < len; i++) {
				const fmLink = frontmatterDiv.createEl('a', { text: prop[i], cls: 'dn-fproperties' });
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
				frontmatterDiv.createEl('br');
			}
		} else {
			frontmatterDiv.createEl('span', { text: 'No frontmatter' });
		}

		contentEl.createEl('br');

		const divBottom = contentEl.createEl('div', { cls: 'dn-div-bottom-properties' });

		const btnPropsOpen = divBottom.createEl('button', { text: 'Open', cls: 'dn-btn-properties-open-file' });
		btnPropsOpen.onClickEvent(() => {
			this.helpers.dnOpenFile?.(this.file);
			this.close();
		});


		frontmatterDiv.blur();
	}

	private renderRow(parent: HTMLElement, label: string, value: string) {
		const row = parent.createDiv({ cls: 'dn-property-row' });
		row.createDiv({ text: label, cls: 'dn-property-name-sm' });
		row.createDiv({ text: value, cls: 'dn-property-value' });
	}

}


