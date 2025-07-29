import { App, Modal, Setting, ToggleComponent } from 'obsidian';
import DNPlugin from 'src/main';

export class DNQuickDisplayOptionsModal extends Modal {
	plugin: DNPlugin;
	toggleHideExtColumn: ToggleComponent;
	toggleHidePathColumn: ToggleComponent;
	toggleHideSizeColumn: ToggleComponent;
	toggleHideDateColumn: ToggleComponent;
	toggleHideTagsColumn: ToggleComponent;
	toggleHideFrontmatterColumn: ToggleComponent;
	toggleImageThumbnail: ToggleComponent;


	constructor(app: App, plugin: DNPlugin) {
		super(app);
		this.plugin = plugin;
	}


	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('div', { text: 'Navigator view: Quick display options', cls: 'setting-item setting-item-heading dn-modal-heading' });

		contentEl.createEl('div', { text: 'Hidden columns', cls: 'setting-item setting-item-heading' });

		// Navigator: Hide column - ext
		new Setting(contentEl)
			.setName('Hide: Ext')
			.addToggle((toggle) => {
				this.toggleHideExtColumn = toggle;
				toggle
					.setValue(this.plugin.settings.hide_ext)
					.onChange(async (val) => {
						this.plugin.settings.hide_ext = val;
						this.plugin.dnUpdateHideColumn("ext", val);
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					});
			})

		// Navigator: Hide column - path
		new Setting(contentEl)
			.setName('Hide: Path')
			.addToggle((toggle) => {
				this.toggleHidePathColumn = toggle;
				toggle
					.setValue(this.plugin.settings.hide_path)
					.onChange(async (val) => {
						this.plugin.settings.hide_path = val;
						this.plugin.dnUpdateHideColumn("path", val);
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					});
			});

		// Navigator: Hide column - size
		new Setting(contentEl)
			.setName('Hide: Size')
			.addToggle((toggle) => {
				this.toggleHideSizeColumn = toggle;
				toggle
					.setValue(this.plugin.settings.hide_size)
					.onChange(async (val) => {
						this.plugin.settings.hide_size = val;
						this.plugin.dnUpdateHideColumn("size", val);
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					});
			});

		// Navigator: Hide column - date
		new Setting(contentEl)
			.setName('Hide: Date')
			.addToggle((toggle) => {
				this.toggleHideDateColumn = toggle;
				toggle
					.setValue(this.plugin.settings.hide_date)
					.onChange(async (val) => {
						this.plugin.settings.hide_date = val;
						this.plugin.dnUpdateHideColumn("date", val);
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					});
			});

		// Navigator: Hide column - tags
		new Setting(contentEl)
			.setName('Hide: Tags')
			.addToggle((toggle) => {
				this.toggleHideTagsColumn = toggle;
				toggle
					.setValue(this.plugin.settings.hide_tags)
					.onChange(async (val) => {
						this.plugin.settings.hide_tags = val;
						this.plugin.dnUpdateHideColumn("tags", val);
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					});
			});

		// Navigator: Hide column - frontmatter
		new Setting(contentEl)
			.setName('Hide: Frontmatter')
			.addToggle((toggle) => {
				this.toggleHideFrontmatterColumn = toggle;
				toggle
					.setValue(this.plugin.settings.hide_frontmatter)
					.onChange(async (val) => {
						this.plugin.settings.hide_frontmatter = val;
						this.plugin.dnUpdateHideColumn("frontmatter", val);
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					})
			});
		// Description
		contentEl.createEl('div', { text: 'Activate toggles to hide columns. Deactivate to show.', cls: 'dn-table-column-description' });

		// Image thumbnails
		contentEl.createEl('div', { text: 'Image thumbnails', cls: 'setting-item setting-item-heading' });

		new Setting(contentEl)
			.setName('Show image thumbnails')
			.addToggle((toggle) => {
				this.toggleImageThumbnail = toggle;
				toggle
					.setValue(this.plugin.settings.image_thumbnail)
					.onChange(async (val) => {
						this.plugin.settings.image_thumbnail = val;
						this.plugin.DN_MODAL.image_thumbnail = this.plugin.settings.image_thumbnail;
						await this.plugin.saveSettings();
						await this.plugin.DN_MODAL.dnRedrawResultsTable();
					});
			});
		// Description
		contentEl.createEl('div', { text: 'Activate to show image thumbnails. Deactivate to show image icons.', cls: 'dn-table-column-description' });

	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
