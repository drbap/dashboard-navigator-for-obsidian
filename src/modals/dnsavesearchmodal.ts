import { App, debounce, Notice } from 'obsidian';
import DNPlugin from 'src/main';
import { sanitizeInput } from 'src/utils/helper';
import { DNBaseModal } from './dnbasemodal';

export interface DNSaveSearchItem {
	id: number;
	query: string;
	description: string;
}

export class DNSaveSearchModal extends DNBaseModal {
	plugin: DNPlugin;

	constructor(app: App, plugin: DNPlugin) {
		super(app);
		this.plugin = plugin;
	}


	render() {

		const { contentEl } = this;

		contentEl.createEl('div', { text: 'Save search', cls: 'setting-item setting-item-heading dn-modal-heading' });

		let current_search = this.plugin.DN_MODAL.INPUT_SEARCH.value;

		const divSaveSearchQuery = contentEl.createEl('div', { cls: 'dn-save-search-row' });
		const divSaveSearchQueryInput = divSaveSearchQuery.createEl('div', { cls: 'dn-save-search-value dn-save-search-query' });

		const currentSearchInput = divSaveSearchQueryInput.createEl('input', {
			type: 'text',
			placeholder: 'Enter your search...'
		});

		currentSearchInput.value = this.plugin.DN_MODAL.INPUT_SEARCH.value;

		contentEl.createEl('br');

		const divSaveDescription = contentEl.createEl('div', { cls: 'dn-save-search-row' });
		const divSaveDescriptionInput = divSaveDescription.createEl('div', { cls: 'dn-save-search-value dn-save-search-description' });

		const descriptionInput = divSaveDescriptionInput.createEl('input', {
			type: 'text',
			placeholder: 'Description... (optional)',
		});

		const divBottom = contentEl.createEl('div', { cls: 'dn-save-button-container' });

		// Create buttons
		const btnSaveSearch = divBottom.createEl('button', { text: 'Save', cls: 'mod-cta' });
		const btnCancel = divBottom.createEl('button', { text: 'Cancel' });


		// Add event listeners
		currentSearchInput.addEventListener('input', debounce(() => {
			current_search = currentSearchInput.value;
			this.plugin.DN_MODAL.INPUT_SEARCH.value = current_search;
			this.plugin.DN_MODAL.dnModalSearchVault(current_search);
		}, 300, true));

		btnSaveSearch.onclick = async () => {
			const sanitizedDescription = sanitizeInput(descriptionInput.value);
			const query = current_search;

			if (!query) {
				new Notice('Please enter a search.');
				return;
			}

			// Verify if the saved_searches array exists in settings, initialize if not
			if (!this.plugin.settings.saved_searches) {
				this.plugin.settings.saved_searches = [];
			}

			// Generate ID using Date.now()
			let save_id = Date.now();
			// Check if existing ID
			while (this.plugin.settings.saved_searches.some(item => item.id === save_id)) {
				save_id = Date.now();
			}

			// Store current search
			const newSavedSearch: DNSaveSearchItem = {
				id: save_id,
				query: query,
				description: sanitizedDescription
			};

			this.plugin.settings.saved_searches.push(newSavedSearch);

			await this.plugin.saveSettings();

			new Notice('Search saved successfully!');

			this.close();
		};

		btnCancel.onclick = () => {
			this.close();
		};


		this.nav.refreshFocusableElements();
	}

}