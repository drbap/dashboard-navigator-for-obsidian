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
    sliderFontSize: SliderComponent;
    textExcludedExtensions: TextComponent;
    textExcludedFolders: TextComponent;
    colorCompNotes: ColorComponent;
    colorCompCanvas: ColorComponent;
    colorCompImages: ColorComponent;
    colorCompVideos: ColorComponent;
    colorCompAudios: ColorComponent;
    colorCompPdf: ColorComponent;
    colorCompOther: ColorComponent;
    toggleColoredFiles: ToggleComponent;
    toggleHidePathColumn: ToggleComponent;
    toggleHideSizeColumn: ToggleComponent;
    toggleHideDateColumn: ToggleComponent;
    toggleHideTagsColumn: ToggleComponent;

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

        // Default DN view: Dashboard or Navigator
        new Setting(containerEl)
            .setName('Default view')
            .setDesc('Select view when opening window')
            .addDropdown(sel => {
                this.dropdownDefaultView = sel;
                sel.addOption('1', 'Dashboard');
                sel.addOption('2', 'Navigator');
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

        // Table layout
        new Setting(containerEl)
            .setName('Navigator table layout')
            .setDesc('Select table results layout')
            .addDropdown(sel => {
                this.dropdownTableLayout = sel;
                sel.addOption('dn-tbl-default', 'Default');
                sel.addOption('dn-tbl-row', 'Row striped');
                sel.addOption('dn-tbl-column', 'Column striped');
                sel.addOption('dn-tbl-bordered', 'Bordered');
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

        // Date format
        new Setting(containerEl)
            .setName('Date format')
            .setDesc('Select date format')
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
        new Setting(containerEl)
            .setName('Font size')
            .setDesc('Select font size in pixels for results and links')
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

        // Results/files per page
        new Setting(containerEl)
            .setName('Files per page')
            .setDesc('Number of results per page')
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

        // Recent files by type
        new Setting(containerEl)
            .setName('Recent files')
            .setDesc('Number of recent files per category')
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

        // Navigator: Hide column - path
        new Setting(containerEl)
            .setName('Hide column: Path')
            .setDesc('Navigator: Hide path column')
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
        new Setting(containerEl)
            .setName('Hide column: Size')
            .setDesc('Navigator: Hide size column')
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
        new Setting(containerEl)
            .setName('Hide column: Date')
            .setDesc('Navigator: Hide date column')
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
        new Setting(containerEl)
            .setName('Hide column: Tags')
            .setDesc('Navigator: Hide tags column')
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

        // Excluded file extensions
        new Setting(containerEl)
            .setName('Excluded file extensions')
            .setDesc('File extensions to exclude, separated by commas')
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
        new Setting(containerEl)
            .setName('Excluded folders')
            .setDesc('List of folder paths to exclude, separated by commas')
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

        // Toggle colored files
        new Setting(containerEl)
            .setName('Toggle colored files')
            .setDesc('Turn on/off colored files')
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
        new Setting(containerEl)
            .setName('Color: Notes')
            .setDesc('Color of notes')
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

        // 2 Color -> Canvas
        new Setting(containerEl)
            .setName('Color: Canvas')
            .setDesc('Color of canvas')
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
        new Setting(containerEl)
            .setName('Color: Images')
            .setDesc('Color of images')
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
        new Setting(containerEl)
            .setName('Color: Videos')
            .setDesc('Color of videos')
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
        new Setting(containerEl)
            .setName('Color: Audios')
            .setDesc('Color of audios')
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
        new Setting(containerEl)
            .setName('Color: PDF')
            .setDesc('Color of PDF files')
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

        // 7 Color -> Other files
        new Setting(containerEl)
            .setName('Color: Other files')
            .setDesc('Color of other files')
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
