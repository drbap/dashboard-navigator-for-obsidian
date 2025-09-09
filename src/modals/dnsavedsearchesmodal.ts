import { App, debounce, Modal, Notice } from 'obsidian';
import DNPlugin from 'src/main';
import { DNSaveSearchItem } from './dnsavesearchmodal';
import { DNConfirmModal } from './dnconfirmmodal';

export class DNSavedSearchesModal extends Modal {
	plugin: DNPlugin;
	private savedSearchContainer: HTMLElement;
	private _INPUT_FILTER: HTMLInputElement;
	CLEAR_INPUT_FILTER: HTMLDivElement;
	private textToFilter = '';

	constructor(app: App, plugin: DNPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('div', { text: 'Saved searches', cls: 'setting-item setting-item-heading dn-modal-heading' });

		const filterDiv = contentEl.createEl('div', { cls: 'dn-filter-container' });
		this._INPUT_FILTER = filterDiv.createEl('input', {
			type: 'text',
			placeholder: 'Filter saved searches...',
			cls: 'dn-filter-input'
		});
		this._INPUT_FILTER.spellcheck = false;

		this.CLEAR_INPUT_FILTER = filterDiv.createEl('div', { cls: 'search-input-clear-button' });
		this.CLEAR_INPUT_FILTER.setAttribute('aria-label', 'Clear search');
		this.CLEAR_INPUT_FILTER.addEventListener('click', () => {
			this._INPUT_FILTER.value = '';
			this.textToFilter = '';
			this.renderSavedSearches();
		});

		this._INPUT_FILTER.value = this.textToFilter;

		this._INPUT_FILTER.addEventListener('input', debounce(() => {
			this.textToFilter = this._INPUT_FILTER.value.toLowerCase();
			this.renderSavedSearches();
		}, 300, true));

		this.savedSearchContainer = contentEl.createEl('div', { cls: 'dn-saved-search-list' });

		this.renderSavedSearches();

		const divBtnClose = contentEl.createEl('div', { cls: 'dn-div-modal-bottom' });
		const btnClose = divBtnClose.createEl('button', { text: 'Close', cls: 'dn-btn-properties-close' });
		btnClose.onclick = () => this.close();
	}


	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private renderSavedSearches() {
		this.savedSearchContainer.empty();

		if (this._INPUT_FILTER.value === '') {
			this.CLEAR_INPUT_FILTER.style.display = 'none';
		} else {
			this.CLEAR_INPUT_FILTER.style.display = 'flex';
		}

		// Ensure the saved_searches array exists in settings, initialize if not
		if (!this.plugin.settings.saved_searches) {
			this.plugin.settings.saved_searches = [];
		}

		// Apply filter if textToFilter is not empty
		const filteredSearches = this.plugin.settings.saved_searches.filter(item => {
			if (this.textToFilter === '') {
				return true; // No filter, show all
			}
			// Check if query or description contains the filter string
			return item.query.toLowerCase().includes(this.textToFilter) ||
				item.description.toLowerCase().includes(this.textToFilter);
		});

		// Display a message if no searches are saved or no results match the filter
		if (filteredSearches.length === 0) {
			const message = (this.textToFilter === '') ? 'No saved searches.' : 'No searches match your filter.';
			this.savedSearchContainer.createEl('p', { text: message, cls: 'dn-no-searches-message' });
			return;
		}

		// Iterate through each filtered search item and render its entry
		filteredSearches.forEach((item: DNSaveSearchItem) => { // Removed index, no longer needed for deletion
			this.renderSearchEntry(item); // Pass the item directly
		});
	}

	/**
	 * Renders a saved search entry.
	 * @param item The DNSaveSearchItem object to render.
	 */
	private renderSearchEntry(item: DNSaveSearchItem) {
		const divSearchItem = this.savedSearchContainer.createEl('div', { cls: 'dn-saved-search-item' });

		// Display the saved search query text (read-only)
		divSearchItem.createEl('div', { text: item.query, cls: 'dn-saved-search-query' });

		divSearchItem.createEl('div', { text: item.description, cls: 'dn-saved-search-description' });

		divSearchItem.addEventListener('click', () => {
			if (this.plugin.DN_MODAL && this.plugin.DN_MODAL.INPUT_SEARCH) {
				this.plugin.DN_MODAL.INPUT_SEARCH.value = item.query;
				this.plugin.DN_MODAL.dnModalSearchVault(this.plugin.DN_MODAL.INPUT_SEARCH.value);
			} else {
				new Notice('Search input not found.');
			}
		});

		divSearchItem.addEventListener('dblclick', () => {
			if (this.plugin.DN_MODAL && this.plugin.DN_MODAL.INPUT_SEARCH) {
				this.plugin.DN_MODAL.INPUT_SEARCH.value = item.query;
				this.plugin.DN_MODAL.dnModalSearchVault(this.plugin.DN_MODAL.INPUT_SEARCH.value);
				this.close();
			} else {
				new Notice('Search input not found.');
			}
		});

		// Div for action buttons
		const divActions = divSearchItem.createEl('div', { cls: 'dn-saved-search-actions' });

		const btnDeleteSearch = divActions.createEl('button', { cls: 'dn-action-button dn-delete-button' });
		btnDeleteSearch.setAttribute('aria-label', 'Delete search');
		btnDeleteSearch.onclick = async (evt) => {
			evt.stopPropagation();

			const confirmModal = new DNConfirmModal(this.app, 'Delete search', 'Are you sure you want to delete this saved search?', 'Delete', 'mod-warning');
			confirmModal.open();

			// User must confirm
			const confirmed = await confirmModal.resultPromise;

			if (confirmed) {

				const initialLength = this.plugin.settings.saved_searches.length;

				this.plugin.settings.saved_searches = this.plugin.settings.saved_searches.filter(
					savedItem => savedItem.id !== item.id
				);

				if (this.plugin.settings.saved_searches.length < initialLength) {
					await this.plugin.saveSettings();
					new Notice('Saved search deleted.');
					this.renderSavedSearches();
				} else {
					new Notice('Error: Could not find search to delete.');
				}
			}
		};
	}
}