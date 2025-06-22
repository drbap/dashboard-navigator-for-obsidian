import { App, Modal } from 'obsidian';

export class DNConfirmModal extends Modal {
	private title: string;
	private message: string;
	private btnText: string;
	private btnCls: string;
	private resolve: (value: boolean | PromiseLike<boolean>) => void;
	private promise: Promise<boolean>;

	constructor(app: App, title: string, message: string, btnText: string, btnCls = 'mod-cta') {
		super(app);
		this.title = title;
		this.message = message;
		this.btnText = btnText;
		this.btnCls = btnCls;
		// Create a new promise and store its resolve function
		this.promise = new Promise((resolve) => {
			this.resolve = resolve;
		});
	}

	/**
	 * Returns the promise that will resolve with the user's decision (true for confirm, false for cancel).
	 */
	public get resultPromise(): Promise<boolean> {
		return this.promise;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('div', { text: this.title, cls: 'setting-item setting-item-heading dn-modal-heading' });
		contentEl.createEl('p', { text: this.message, cls: 'dn-confirm-message' });

		const btnContainer = contentEl.createEl('div', { cls: 'dn-confirm-button-container' });

		// Confirm button
		const btnConfirm = btnContainer.createEl('button', { text: this.btnText, cls: this.btnCls });
		btnConfirm.onclick = () => {
			this.resolve(true);
			this.close();
		};

		// Cancel button
		const btnCancel = btnContainer.createEl('button', { text: 'Cancel', cls: 'mod-cancel' });
		btnCancel.onclick = () => {
			this.resolve(false); // Resolve the promise with false
			this.close(); // Close the modal
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		// If the modal is closed without a button click, resolve with false (cancel)
		if (this.resolve) {
			this.resolve(false);
		}
	}
}
