import { Modal, App } from 'obsidian';
import { DNKeyboardNavigation } from 'src/utils/dnkeyboardnavigation';

export abstract class DNBaseModal extends Modal {
	public nav: DNKeyboardNavigation;

	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.classList.add('dn-modal-container');

		// Every modal gets its own fresh keyboard engine
		this.nav = new DNKeyboardNavigation(this.contentEl);

		// Build the UI
		await this.render();

		// Start listening
		this.nav.start();
		this.nav.refreshFocusableElements();
	}

	onClose() {
		if (this.nav) this.nav.stop();
		this.contentEl.empty();
	}

	/**
	 * Parent (DNModal) uses this to pause itself and open a child.
	 */
	public openSubModal(subModal: DNBaseModal) {
		// THE STOP COMMAND: Explicitly pause the parent's navigation
		if (this.nav) this.nav.stop();

		const originalOnClose = subModal.onClose.bind(subModal);

		subModal.onClose = () => {
			originalOnClose();

			// Resume parent navigation when child closes
			if (this.nav) {
				this.nav.start();
				this.nav.refreshFocusableElements();
			}

			subModal.onClose = originalOnClose;
		};

		subModal.open();
	}

	abstract render(): Promise<void> | void;
}