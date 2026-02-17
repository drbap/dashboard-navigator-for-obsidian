import { App, ColorComponent, DropdownComponent, PluginSettingTab, Setting, SliderComponent, TextComponent, ToggleComponent } from 'obsidian';
import DNPlugin from './main';
import { DEFAULT_SETTINGS } from './main';

export class DNSettingTab extends PluginSettingTab {

    plugin: DNPlugin;
    dropdownDateFormat: DropdownComponent;
    dropdownFilesPerPage: DropdownComponent;
    dropdownDefaultView: DropdownComponent;
    dropdownTableLayout: DropdownComponent;
    dropdownRecentFiles: DropdownComponent;
    dropdownBookmarkedFiles: DropdownComponent;
    sliderFontSize: SliderComponent;
    sliderImageThumbnail: SliderComponent;
    textExcludedExtensions: TextComponent;
    textExcludedFolders: TextComponent;
    colorCompNotes: ColorComponent;
    colorCompCanvas: ColorComponent;
    colorCompImages: ColorComponent;
    colorCompVideos: ColorComponent;
    colorCompAudios: ColorComponent;
    colorCompPdf: ColorComponent;
    colorCompBases: ColorComponent;
    colorCompOther: ColorComponent;
    toggleColoredFiles: ToggleComponent;
    toggleHideExtColumn: ToggleComponent;
    toggleHidePathColumn: ToggleComponent;
    toggleHideSizeColumn: ToggleComponent;
    toggleHideDateColumn: ToggleComponent;
    toggleHideTagsColumn: ToggleComponent;
    toggleHideFrontmatterColumn: ToggleComponent;
    toggleHideBLColumn: ToggleComponent;
    toggleHideOLColumn: ToggleComponent;
    toggleImageThumbnail: ToggleComponent;
    togglePieChartModule: ToggleComponent;
    toggleRememberLastSearch: ToggleComponent;

    constructor(app: App, plugin: DNPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Open dashboard navigator')
            .addButton((btn) => {
                btn.setButtonText('Open')
                    .setTooltip('Open dashboard navigator')
                    .onClick((evt: MouseEvent) => {
                        this.plugin.DN_MODAL.open();
                    })
            });

        const headingPreferencesGroup = containerEl.createEl('div', { cls: 'setting-group' });
        headingPreferencesGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
        const headingPreferencesGroupItems = headingPreferencesGroup.createEl('div', { cls: 'setting-items' });


        // Default DN view: Dashboard, Navigator or Tags
        new Setting(headingPreferencesGroupItems)
            .setName('Default modal view')
            .setDesc('Select the initial view for this plugin\'s modal when it opens using its primary ribbon icon.')
            .addDropdown(sel => {
                this.dropdownDefaultView = sel;
                sel.addOption('1', 'Dashboard');
                sel.addOption('2', 'Navigator');
                sel.addOption('3', 'Tags');
                sel.onChange(async (val: string) => {

                    this.plugin.settings.default_view = parseInt(val);

                    this.plugin.DN_MODAL.default_view = this.plugin.settings.default_view;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.default_view.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownDefaultView.setValue(DEFAULT_SETTINGS.default_view.toString());
                    this.plugin.settings.default_view = DEFAULT_SETTINGS.default_view;
                    this.plugin.DN_MODAL.default_view = this.plugin.settings.default_view;
                    this.plugin.saveSettings();
                });
            });

        // Date format
        new Setting(headingPreferencesGroupItems)
            .setName('Date format')
            .setDesc('Select date format.')
            .addDropdown(sel => {
                this.dropdownDateFormat = sel;
                sel.addOption('YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss');
                sel.addOption('YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm');
                sel.addOption('YYYY-MM-DD', 'YYYY-MM-DD');
                sel.addOption('DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm:ss');
                sel.addOption('DD/MM/YYYY HH:mm', 'DD/MM/YYYY HH:mm');
                sel.addOption('DD/MM/YYYY', 'DD/MM/YYYY');
                sel.onChange(async (val: string) => {

                    this.plugin.settings.date_format = val;

                    this.plugin.DN_MODAL.date_format = this.plugin.settings.date_format;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.date_format.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownDateFormat.setValue(DEFAULT_SETTINGS.date_format.toString());
                    this.plugin.settings.date_format = DEFAULT_SETTINGS.date_format;
                    this.plugin.DN_MODAL.date_format = this.plugin.settings.date_format;
                    this.plugin.saveSettings();
                });
            });

        // Font size
        new Setting(headingPreferencesGroupItems)
            .setName('Font size')
            .setDesc('Select font size in pixels for results and links.')
            .addSlider((sli) => {
                this.sliderFontSize = sli;
                let slider_val: number;
                if (this.plugin.settings.font_size) {
                    slider_val = this.plugin.settings.font_size;
                } else {
                    slider_val = DEFAULT_SETTINGS.font_size;
                }
                sli.setDynamicTooltip();
                sli.setLimits(12, 24, 1);
                sli.setValue(slider_val);
                sli.onChange((val: number) => {

                    this.plugin.settings.font_size = val;
                    this.plugin.dnSetFontSize(val);
                    this.plugin.saveSettings();
                })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.sliderFontSize.setValue(DEFAULT_SETTINGS.font_size);
                    this.plugin.settings.font_size = DEFAULT_SETTINGS.font_size;
                    this.plugin.dnSetFontSize(this.plugin.settings.font_size);
                    this.plugin.saveSettings();
                });
            });


        // Recent files by type
        new Setting(headingPreferencesGroupItems)
            .setName('Recent files')
            .setDesc('Dashboard: Number of recent files per category.')
            .addDropdown(sel => {
                this.dropdownRecentFiles = sel;
                sel.addOption('3', '3');
                sel.addOption('4', '4');
                sel.addOption('5', '5');
                sel.addOption('10', '10');
                sel.onChange(async (val: string) => {

                    this.plugin.settings.num_recent_files = parseInt(val);

                    this.plugin.DN_MODAL.num_recent_files = this.plugin.settings.num_recent_files;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.num_recent_files.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownRecentFiles.setValue(DEFAULT_SETTINGS.num_recent_files.toString());
                    this.plugin.settings.num_recent_files = DEFAULT_SETTINGS.num_recent_files;
                    this.plugin.DN_MODAL.num_recent_files = this.plugin.settings.num_recent_files;
                    this.plugin.saveSettings();
                });
            });

        // Bookmarks
        new Setting(headingPreferencesGroupItems)
            .setName('Bookmarks')
            .setDesc('Dashboard: Number of bookmarks to display.')
            .addDropdown(sel => {
                this.dropdownBookmarkedFiles = sel;
                sel.addOption('3', '3');
                sel.addOption('4', '4');
                sel.addOption('5', '5');
                sel.addOption('10', '10');
                sel.onChange(async (val: string) => {

                    this.plugin.settings.num_bookmarked_files = parseInt(val);

                    this.plugin.DN_MODAL.num_bookmarked_files = this.plugin.settings.num_bookmarked_files;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.num_bookmarked_files.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownBookmarkedFiles.setValue(DEFAULT_SETTINGS.num_bookmarked_files.toString());
                    this.plugin.settings.num_bookmarked_files = DEFAULT_SETTINGS.num_bookmarked_files;
                    this.plugin.DN_MODAL.num_bookmarked_files = this.plugin.settings.num_bookmarked_files;
                    this.plugin.saveSettings();
                });
            });

        new Setting(headingPreferencesGroupItems)
            .setName('Show pie chart panel')
            .setDesc('Dashboard: Displays a pie chart of file types and a count of all files and folders.')
            .addToggle((toggle) => {
                this.togglePieChartModule = toggle;
                toggle
                    .setValue(this.plugin.settings.show_dashboard_piechart)
                    .onChange(async (val) => {
                        this.plugin.settings.show_dashboard_piechart = val;
                        this.plugin.DN_MODAL.show_dashboard_piechart = this.plugin.settings.show_dashboard_piechart;
                        await this.plugin.saveSettings();
                    });
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.togglePieChartModule.setValue(DEFAULT_SETTINGS.show_dashboard_piechart);
                    this.plugin.settings.show_dashboard_piechart = DEFAULT_SETTINGS.show_dashboard_piechart;
                    this.plugin.DN_MODAL.show_dashboard_piechart = this.plugin.settings.show_dashboard_piechart;
                    this.plugin.saveSettings();
                });
            });

        // Navigator results layout
        new Setting(headingPreferencesGroupItems)
            .setName('Search results layout')
            .setDesc('Navigator: Select search results layout.')
            .addDropdown(sel => {
                this.dropdownTableLayout = sel;
                sel.addOption('dn-tbl-default', 'Default');
                sel.addOption('dn-tbl-row', 'Row striped');
                sel.addOption('dn-tbl-column', 'Column striped');
                sel.addOption('dn-tbl-bordered', 'Bordered');
                sel.addOption('dn-tbl-cards', 'Cards');
                sel.onChange(async (val: string) => {

                    this.plugin.settings.selected_table_layout = val;

                    this.plugin.DN_MODAL.selected_table_layout = this.plugin.settings.selected_table_layout;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.selected_table_layout.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownTableLayout.setValue(DEFAULT_SETTINGS.selected_table_layout.toString());
                    this.plugin.settings.selected_table_layout = DEFAULT_SETTINGS.selected_table_layout;
                    this.plugin.DN_MODAL.selected_table_layout = this.plugin.settings.selected_table_layout;
                    this.plugin.saveSettings();
                });
            });


        // Results/files per page
        new Setting(headingPreferencesGroupItems)
            .setName('Files per page')
            .setDesc('Navigator: Number of results per page.')
            .addDropdown(sel => {
                this.dropdownFilesPerPage = sel;
                sel.addOption('10', '10');
                sel.addOption('20', '20');
                sel.addOption('30', '30');
                sel.addOption('50', '50');
                sel.addOption('100', '100');
                sel.onChange(async (val: string) => {

                    this.plugin.settings.files_per_page = parseInt(val);

                    this.plugin.DN_MODAL.files_per_page = this.plugin.settings.files_per_page;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.files_per_page.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownFilesPerPage.setValue(DEFAULT_SETTINGS.files_per_page.toString());
                    this.plugin.settings.files_per_page = DEFAULT_SETTINGS.files_per_page;
                    this.plugin.DN_MODAL.files_per_page = this.plugin.settings.files_per_page;
                    this.plugin.saveSettings();
                });
            });

        // Remember last search
        new Setting(headingPreferencesGroupItems)
            .setName('Remember last search')
            .setDesc('Keeps the search query in the main input field. Turn this off for a fresh, empty search every time.')
            .addToggle((toggle) => {
                this.toggleRememberLastSearch = toggle;
                toggle
                    .setValue(this.plugin.settings.remember_last_search)
                    .onChange(async (val) => {
                        this.plugin.settings.remember_last_search = val;
                        this.plugin.DN_MODAL.remember_last_search = this.plugin.settings.remember_last_search;
                        await this.plugin.saveSettings();
                    });
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleRememberLastSearch.setValue(DEFAULT_SETTINGS.remember_last_search);
                    this.plugin.settings.remember_last_search = DEFAULT_SETTINGS.remember_last_search;
                    this.plugin.DN_MODAL.remember_last_search = this.plugin.settings.remember_last_search;
                    this.plugin.saveSettings();
                });
            });

        const headingColumnsGroup = containerEl.createEl('div', { cls: 'setting-group' });
        const headingColumns1 = headingColumnsGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
        headingColumns1.createEl('div', { text: 'Hidden columns', cls: 'setting-item-name' });
        const headingColumnsGroupItems = headingColumnsGroup.createEl('div', { cls: 'setting-items' });

        // Navigator: Hide column - ext
        new Setting(headingColumnsGroupItems)
            .setName('Hide: Ext')
            .setDesc('Navigator: Hide file extension column.')
            .addToggle((toggle) => {
                this.toggleHideExtColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_ext)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_ext = val;
                        this.plugin.dnUpdateHideColumn("ext", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideExtColumn.setValue(DEFAULT_SETTINGS.hide_ext);
                    this.plugin.settings.hide_ext = DEFAULT_SETTINGS.hide_ext;
                    this.plugin.dnUpdateHideColumn("ext", DEFAULT_SETTINGS.hide_ext);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - path
        new Setting(headingColumnsGroupItems)
            .setName('Hide: Path')
            .setDesc('Navigator: Hide path column.')
            .addToggle((toggle) => {
                this.toggleHidePathColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_path)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_path = val;
                        this.plugin.dnUpdateHideColumn("path", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHidePathColumn.setValue(DEFAULT_SETTINGS.hide_path);
                    this.plugin.settings.hide_path = DEFAULT_SETTINGS.hide_path;
                    this.plugin.dnUpdateHideColumn("path", DEFAULT_SETTINGS.hide_path);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - size
        new Setting(headingColumnsGroupItems)
            .setName('Hide: Size')
            .setDesc('Navigator: Hide size column.')
            .addToggle((toggle) => {
                this.toggleHideSizeColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_size)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_size = val;
                        this.plugin.dnUpdateHideColumn("size", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideSizeColumn.setValue(DEFAULT_SETTINGS.hide_size);
                    this.plugin.settings.hide_size = DEFAULT_SETTINGS.hide_size;
                    this.plugin.dnUpdateHideColumn("size", DEFAULT_SETTINGS.hide_size);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - date
        new Setting(headingColumnsGroupItems)
            .setName('Hide: Date')
            .setDesc('Navigator: Hide date column.')
            .addToggle((toggle) => {
                this.toggleHideDateColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_date)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_date = val;
                        this.plugin.dnUpdateHideColumn("date", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideDateColumn.setValue(DEFAULT_SETTINGS.hide_date);
                    this.plugin.settings.hide_date = DEFAULT_SETTINGS.hide_date;
                    this.plugin.dnUpdateHideColumn("date", DEFAULT_SETTINGS.hide_date);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - tags
        new Setting(headingColumnsGroupItems)
            .setName('Hide: Tags')
            .setDesc('Navigator: Hide tags column.')
            .addToggle((toggle) => {
                this.toggleHideTagsColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_tags)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_tags = val;
                        this.plugin.dnUpdateHideColumn("tags", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideTagsColumn.setValue(DEFAULT_SETTINGS.hide_tags);
                    this.plugin.settings.hide_tags = DEFAULT_SETTINGS.hide_tags;
                    this.plugin.dnUpdateHideColumn("tags", DEFAULT_SETTINGS.hide_tags);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - frontmatter
        new Setting(headingColumnsGroupItems)
            .setName('Hide: Frontmatter')
            .setDesc('Navigator: Hide frontmatter properties column.')
            .addToggle((toggle) => {
                this.toggleHideFrontmatterColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_frontmatter)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_frontmatter = val;
                        this.plugin.dnUpdateHideColumn("frontmatter", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideFrontmatterColumn.setValue(DEFAULT_SETTINGS.hide_frontmatter);
                    this.plugin.settings.hide_frontmatter = DEFAULT_SETTINGS.hide_frontmatter;
                    this.plugin.dnUpdateHideColumn("frontmatter", DEFAULT_SETTINGS.hide_frontmatter);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - backlinks
        new Setting(headingColumnsGroupItems)
            .setName('Hide: BL (Backlinks)')
            .setDesc('Navigator: Hide backlinks column.')
            .addToggle((toggle) => {
                this.toggleHideBLColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_backlinks)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_backlinks = val;
                        this.plugin.dnUpdateHideColumn("backlinks", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideBLColumn.setValue(DEFAULT_SETTINGS.hide_backlinks);
                    this.plugin.settings.hide_backlinks = DEFAULT_SETTINGS.hide_backlinks;
                    this.plugin.dnUpdateHideColumn("backlinks", DEFAULT_SETTINGS.hide_backlinks);
                    this.plugin.saveSettings();
                });
            });

        // Navigator: Hide column - outgoing links
        new Setting(headingColumnsGroupItems)
            .setName('Hide: OL (Outgoing links)')
            .setDesc('Navigator: Hide outgoing links column.')
            .addToggle((toggle) => {
                this.toggleHideOLColumn = toggle;
                toggle
                    .setValue(this.plugin.settings.hide_outgoing)
                    .onChange(async (val) => {
                        this.plugin.settings.hide_outgoing = val;
                        this.plugin.dnUpdateHideColumn("outgoing", val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleHideOLColumn.setValue(DEFAULT_SETTINGS.hide_outgoing);
                    this.plugin.settings.hide_outgoing = DEFAULT_SETTINGS.hide_outgoing;
                    this.plugin.dnUpdateHideColumn("outgoing", DEFAULT_SETTINGS.hide_outgoing);
                    this.plugin.saveSettings();
                });
            });

        // Image thumbnails
        const headingImageThumbnailsGroup = containerEl.createEl('div', { cls: 'setting-group' });
        const headingImageThumbnails1 = headingImageThumbnailsGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
        headingImageThumbnails1.createEl('div', { text: 'Image thumbnails', cls: 'setting-item-name' });
        const headingImageThumbnailsGroupItems = headingImageThumbnailsGroup.createEl('div', { cls: 'setting-items' });


        new Setting(headingImageThumbnailsGroupItems)
            .setName('Show image thumbnails')
            .setDesc('Navigator: Activate to show image thumbnails. Deactivate to show image icons.')
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
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleImageThumbnail.setValue(DEFAULT_SETTINGS.image_thumbnail);
                    this.plugin.settings.image_thumbnail = DEFAULT_SETTINGS.image_thumbnail;
                    this.plugin.DN_MODAL.image_thumbnail = this.plugin.settings.image_thumbnail;
                    this.plugin.saveSettings();
                });
            });

        // Thumbnail size
        new Setting(headingImageThumbnailsGroupItems)
            .setName('Image thumbnails size')
            .setDesc('Navigator: Adjust image thumbnails size')
            .addSlider((sliderThumbnail) => {
                this.sliderImageThumbnail = sliderThumbnail;
                let slider_val: number;
                if (this.plugin.settings.thumbnail_size) {
                    slider_val = this.plugin.settings.thumbnail_size;
                } else {
                    slider_val = DEFAULT_SETTINGS.thumbnail_size;
                }
                sliderThumbnail.setDynamicTooltip();
                sliderThumbnail.setLimits(50, 500, 1);
                sliderThumbnail.setValue(slider_val);
                sliderThumbnail.onChange((val: number) => {

                    this.plugin.settings.thumbnail_size = val;
                    this.plugin.dnSetThumbnailSize(val);
                    this.plugin.saveSettings();
                })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.sliderImageThumbnail.setValue(DEFAULT_SETTINGS.thumbnail_size);
                    this.plugin.settings.thumbnail_size = DEFAULT_SETTINGS.thumbnail_size;
                    this.plugin.dnSetThumbnailSize(this.plugin.settings.thumbnail_size);
                    this.plugin.saveSettings();
                });
            });


        // Excluded file extensions
        const headingExcludedFilesFoldersGroup = containerEl.createEl('div', { cls: 'setting-group' });
        const headingExcludedFilesFolders1 = headingExcludedFilesFoldersGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
        headingExcludedFilesFolders1.createEl('div', { text: 'Excluded files and folders', cls: 'setting-item-name' });
        const headingExcludedFilesFoldersGroupItems = headingExcludedFilesFoldersGroup.createEl('div', { cls: 'setting-items' });

        new Setting(headingExcludedFilesFoldersGroupItems)
            .setName('Excluded file extensions')
            .setDesc('File extensions to exclude, separated by commas.')
            .addText((text) => {
                this.textExcludedExtensions = text;
                text
                    .setPlaceholder("File extensions to exclude")
                    .setValue(this.plugin.settings.excluded_ext)
                    .onChange(async (val) => {
                        this.plugin.settings.excluded_ext = val;
                        this.plugin.DN_MODAL.excluded_extensions = this.plugin.dnGetExcludedExtensions(val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.textExcludedExtensions.setValue('');
                    this.plugin.settings.excluded_ext = '';
                    this.plugin.DN_MODAL.excluded_extensions = [];
                    this.plugin.saveSettings();
                });
            });

        // Excluded folders
        new Setting(headingExcludedFilesFoldersGroupItems)
            .setName('Excluded folders')
            .setDesc('List of folder paths to exclude, separated by commas.')
            .addText((text) => {
                this.textExcludedFolders = text;
                text
                    .setPlaceholder("Folder paths to exclude")
                    .setValue(this.plugin.settings.excluded_path)
                    .onChange(async (val) => {
                        this.plugin.settings.excluded_path = val;
                        this.plugin.DN_MODAL.excluded_folders = this.plugin.dnGetExcludedFolders(val);
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.textExcludedFolders.setValue('');
                    this.plugin.settings.excluded_path = '';
                    this.plugin.DN_MODAL.excluded_folders = [];
                    this.plugin.saveSettings();
                });
            });

        const headingFileColorsGroup = containerEl.createEl('div', { cls: 'setting-group' });
        const headingFileColors1 = headingFileColorsGroup.createEl('div', { cls: 'setting-item setting-item-heading' });
        headingFileColors1.createEl('div', { text: 'File colors', cls: 'setting-item-name' });
        const headingFileColorsGroupItems = headingFileColorsGroup.createEl('div', { cls: 'setting-items' });

        // Toggle colored files
        new Setting(headingFileColorsGroupItems)
            .setName('Toggle colored files')
            .setDesc('Turn on/off colored files.')
            .addToggle((toggle) => {
                this.toggleColoredFiles = toggle;
                toggle
                    .setValue(this.plugin.settings.colored_files)
                    .onChange(async (val) => {
                        this.plugin.settings.colored_files = val;
                        this.plugin.DN_MODAL.colored_files = val;
                        this.plugin.DN_MODAL.dnToggleColoredFiles();
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.toggleColoredFiles.setValue(DEFAULT_SETTINGS.colored_files);
                    this.plugin.settings.colored_files = DEFAULT_SETTINGS.colored_files;
                    this.plugin.DN_MODAL.colored_files = DEFAULT_SETTINGS.colored_files;
                    this.plugin.DN_MODAL.dnToggleColoredFiles();
                    this.plugin.saveSettings();
                });
            });

        // 1 Color -> Notes
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Notes')
            .setDesc('Color of notes.')
            .addColorPicker((color) => {
                this.colorCompNotes = color;
                color
                    .setValue(this.plugin.settings.color_notes)
                    .onChange(async (val) => {
                        this.plugin.settings.color_notes = val;
                        this.plugin.DN_MODAL.color_notes = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();
                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompNotes.setValue(DEFAULT_SETTINGS.color_notes);
                    this.plugin.settings.color_notes = DEFAULT_SETTINGS.color_notes;
                    this.plugin.DN_MODAL.color_notes = DEFAULT_SETTINGS.color_notes;
                    this.plugin.DN_MODAL.dnSetCustomColors();
                    this.plugin.saveSettings();
                });
            });

        // 2 Color -> Canvases
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Canvases')
            .setDesc('Color of canvases.')
            .addColorPicker((color) => {
                this.colorCompCanvas = color;
                color
                    .setValue(this.plugin.settings.color_canvas)
                    .onChange(async (val) => {
                        this.plugin.settings.color_canvas = val;
                        this.plugin.DN_MODAL.color_canvas = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompCanvas.setValue(DEFAULT_SETTINGS.color_canvas);
                    this.plugin.settings.color_canvas = DEFAULT_SETTINGS.color_canvas;
                    this.plugin.DN_MODAL.color_canvas = DEFAULT_SETTINGS.color_canvas;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

        // 3 Color -> Images
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Images')
            .setDesc('Color of images.')
            .addColorPicker((color) => {
                this.colorCompImages = color;
                color
                    .setValue(this.plugin.settings.color_images)
                    .onChange(async (val) => {
                        this.plugin.settings.color_images = val;
                        this.plugin.DN_MODAL.color_images = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompImages.setValue(DEFAULT_SETTINGS.color_images);
                    this.plugin.settings.color_images = DEFAULT_SETTINGS.color_images;
                    this.plugin.DN_MODAL.color_images = DEFAULT_SETTINGS.color_images;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

        // 4 Color -> Videos
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Videos')
            .setDesc('Color of videos.')
            .addColorPicker((color) => {
                this.colorCompVideos = color;
                color
                    .setValue(this.plugin.settings.color_videos)
                    .onChange(async (val) => {
                        this.plugin.settings.color_videos = val;
                        this.plugin.DN_MODAL.color_videos = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompVideos.setValue(DEFAULT_SETTINGS.color_videos);
                    this.plugin.settings.color_videos = DEFAULT_SETTINGS.color_videos;
                    this.plugin.DN_MODAL.color_videos = DEFAULT_SETTINGS.color_videos;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

        // 5 Color -> Audios
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Audio files')
            .setDesc('Color of audio files.')
            .addColorPicker((color) => {
                this.colorCompAudios = color;
                color
                    .setValue(this.plugin.settings.color_audios)
                    .onChange(async (val) => {
                        this.plugin.settings.color_audios = val;
                        this.plugin.DN_MODAL.color_audios = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompAudios.setValue(DEFAULT_SETTINGS.color_audios);
                    this.plugin.settings.color_audios = DEFAULT_SETTINGS.color_audios;
                    this.plugin.DN_MODAL.color_audios = DEFAULT_SETTINGS.color_audios;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

        // 6 Color -> PDF
        new Setting(headingFileColorsGroupItems)
            .setName('Color: PDF')
            .setDesc('Color of PDF files.')
            .addColorPicker((color) => {
                this.colorCompPdf = color;
                color
                    .setValue(this.plugin.settings.color_pdf)
                    .onChange(async (val) => {
                        this.plugin.settings.color_pdf = val;
                        this.plugin.DN_MODAL.color_pdf = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompPdf.setValue(DEFAULT_SETTINGS.color_pdf);
                    this.plugin.settings.color_pdf = DEFAULT_SETTINGS.color_pdf;
                    this.plugin.DN_MODAL.color_pdf = DEFAULT_SETTINGS.color_pdf;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

        // 7 Color -> Base files
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Bases')
            .setDesc('Color of .base files.')
            .addColorPicker((color) => {
                this.colorCompBases = color;
                color
                    .setValue(this.plugin.settings.color_bases)
                    .onChange(async (val) => {
                        this.plugin.settings.color_bases = val;
                        this.plugin.DN_MODAL.color_bases = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompBases.setValue(DEFAULT_SETTINGS.color_bases);
                    this.plugin.settings.color_bases = DEFAULT_SETTINGS.color_bases;
                    this.plugin.DN_MODAL.color_bases = DEFAULT_SETTINGS.color_bases;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

        // 8 Color -> Other files
        new Setting(headingFileColorsGroupItems)
            .setName('Color: Other files')
            .setDesc('Color of other files.')
            .addColorPicker((color) => {
                this.colorCompOther = color;
                color
                    .setValue(this.plugin.settings.color_other)
                    .onChange(async (val) => {
                        this.plugin.settings.color_other = val;
                        this.plugin.DN_MODAL.color_other = val;
                        this.plugin.DN_MODAL.dnSetCustomColors();

                        await this.plugin.saveSettings();
                    })
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.colorCompOther.setValue(DEFAULT_SETTINGS.color_other);
                    this.plugin.settings.color_other = DEFAULT_SETTINGS.color_other;
                    this.plugin.DN_MODAL.color_other = DEFAULT_SETTINGS.color_other;
                    this.plugin.DN_MODAL.dnSetCustomColors();

                    this.plugin.saveSettings();
                });
            });

    }
}
