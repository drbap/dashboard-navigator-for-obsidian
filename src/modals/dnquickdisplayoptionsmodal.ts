import { App, Setting, SliderComponent, ToggleComponent } from 'obsidian';
import DNPlugin from 'src/main';
import { DNBaseModal } from './dnbasemodal';

export class DNQuickDisplayOptionsModal extends DNBaseModal {
	plugin: DNPlugin;
	toggleHideExtColumn: ToggleComponent;
	toggleHidePathColumn: ToggleComponent;
	toggleHideSizeColumn: ToggleComponent;
	toggleHideDateColumn: ToggleComponent;
	toggleHideTagsColumn: ToggleComponent;
	toggleHideFrontmatterColumn: ToggleComponent;
	toggleImageThumbnail: ToggleComponent;
	toggleHideBLColumn: ToggleComponent;
	toggleHideOLColumn: ToggleComponent;
	sliderImageThumbnail: SliderComponent;

	constructor(app: App, plugin: DNPlugin) {
		super(app);
		this.plugin = plugin;
	}

	render() {
		const { contentEl } = this;
		contentEl.empty();

		// Ensure the ID matches if your navigation class expects it
		// contentEl.id = 'dn-container';

		const headingHiddenColumnsGroup = contentEl.createEl('div', { cls: 'setting-group' });
		const headingHiddenColumns1 = headingHiddenColumnsGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
		headingHiddenColumns1.createEl('div', { text: 'Hidden columns', cls: 'setting-item-name' });
		const headingHiddenColumnsGroupItems = headingHiddenColumnsGroup.createEl('div', { cls: 'setting-items' });

		// Helper function to create toggles
		const createHideToggle = (name: string, settingKey: keyof typeof this.plugin.settings, columnKey: string) => {
			new Setting(headingHiddenColumnsGroupItems)
				.setName(`Hide: ${name}`)
				.addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings[settingKey] as boolean)
						.onChange(async (val) => {
							(this.plugin.settings[settingKey] as boolean) = val;
							this.plugin.dnUpdateHideColumn(columnKey, val);
							await this.plugin.saveSettings();
							await this.plugin.DN_MODAL.dnRedrawResultsTable();
						});
				});
		};

		// Create all toggles
		createHideToggle('Ext', 'hide_ext', 'ext');
		createHideToggle('Path', 'hide_path', 'path');
		createHideToggle('Size', 'hide_size', 'size');
		createHideToggle('Date', 'hide_date', 'date');
		createHideToggle('Tags', 'hide_tags', 'tags');
		createHideToggle('Frontmatter', 'hide_frontmatter', 'frontmatter');
		createHideToggle('BL (backlinks)', 'hide_backlinks', 'backlinks');
		createHideToggle('OL (outgoing links)', 'hide_outgoing', 'outgoing');

		headingHiddenColumnsGroupItems.createEl('div', { text: 'Activate toggles to hide columns. Deactivate to show.', cls: 'dn-table-column-description' });

		contentEl.createEl('br');

		// Image thumbnails section
		const headingImageThumbnailsGroup = contentEl.createEl('div', { cls: 'setting-group' });
		const headingImageThumbnails1 = headingImageThumbnailsGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
		headingImageThumbnails1.createEl('div', { text: 'Image thumbnails', cls: 'setting-item-name' });
		const headingImageThumbnailsGroupItems = headingImageThumbnailsGroup.createEl('div', { cls: 'setting-items' });

		new Setting(headingImageThumbnailsGroupItems)
			.setName('Show image thumbnails')
			.setDesc('Activate to show image thumbnails. Deactivate to show image icons.')
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

		new Setting(headingImageThumbnailsGroupItems)
			.setName('Image thumbnails size')
			.setDesc('Adjust image thumbnails size in pixels.')
			.addSlider((sli) => {
				this.sliderImageThumbnail = sli;
				const slider_val = this.plugin.settings.thumbnail_size || 82;
				sli.setDynamicTooltip();
				sli.setLimits(50, 500, 1);
				sli.setValue(slider_val);
				sli.onChange((val: number) => {
					this.plugin.settings.thumbnail_size = val;
					this.plugin.dnSetThumbnailSize(val);
					this.plugin.saveSettings();
				});
			});

	}

}