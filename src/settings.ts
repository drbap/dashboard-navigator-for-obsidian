import { App, DropdownComponent, PluginSettingTab, Setting } from 'obsidian';
import DNPlugin from './main';
import { DEFAULT_SETTINGS } from './main';

export class DNSettingTab extends PluginSettingTab {

    plugin: DNPlugin;
    dropdownDateFormat: DropdownComponent;
    dropdownFilesPerPage: DropdownComponent;
    dropdownDefaultView: DropdownComponent;
    dropdownTableLayout: DropdownComponent;
    dropdownRecentFiles: DropdownComponent;

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
                        this.plugin._DN_MODAL.open();
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

                    this.plugin._DN_MODAL.default_view = this.plugin.settings.default_view;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.default_view.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownDefaultView.setValue(DEFAULT_SETTINGS.default_view.toString());
                    this.plugin.settings.default_view = DEFAULT_SETTINGS.default_view;
                    this.plugin._DN_MODAL.default_view = this.plugin.settings.default_view;
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

                    this.plugin._DN_MODAL.selected_table_layout = this.plugin.settings.selected_table_layout;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.selected_table_layout.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownTableLayout.setValue(DEFAULT_SETTINGS.selected_table_layout.toString());
                    this.plugin.settings.selected_table_layout = DEFAULT_SETTINGS.selected_table_layout;
                    this.plugin._DN_MODAL.selected_table_layout = this.plugin.settings.selected_table_layout;
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

                    this.plugin._DN_MODAL.date_format = this.plugin.settings.date_format;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.date_format.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownDateFormat.setValue(DEFAULT_SETTINGS.date_format.toString());
                    this.plugin.settings.date_format = DEFAULT_SETTINGS.date_format;
                    this.plugin._DN_MODAL.date_format = this.plugin.settings.date_format;
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

                    this.plugin._DN_MODAL.files_per_page = this.plugin.settings.files_per_page;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.files_per_page.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownFilesPerPage.setValue(DEFAULT_SETTINGS.files_per_page.toString());
                    this.plugin.settings.files_per_page = DEFAULT_SETTINGS.files_per_page;
                    this.plugin._DN_MODAL.files_per_page = this.plugin.settings.files_per_page;
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

                    this.plugin._DN_MODAL.num_recent_files = this.plugin.settings.num_recent_files;

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.num_recent_files.toString());
            }).addExtraButton((btn) => {
                btn.setIcon('rotate-ccw');
                btn.setTooltip('Restore default')
                btn.onClick(() => {
                    this.dropdownRecentFiles.setValue(DEFAULT_SETTINGS.num_recent_files.toString());
                    this.plugin.settings.num_recent_files = DEFAULT_SETTINGS.num_recent_files;
                    this.plugin._DN_MODAL.num_recent_files = this.plugin.settings.num_recent_files;
                    this.plugin.saveSettings();
                });
            });

    }
}
