import { App } from 'obsidian';
import { DNBaseModal } from './dnbasemodal';

export class DNConfirmModal extends DNBaseModal {
	private title: string;
	private message: string;
	private btnText: string;
	private btnCls: string;

	// Updated type to allow null for safe cleanup
	private resolve: ((value: boolean) => void) | null = null;
	private promise: Promise<boolean>;

	constructor(app: App, title: string, message: string, btnText: string, btnCls = 'mod-cta') {
		super(app);
		this.title = title;
		this.message = message;
		this.btnText = btnText;
		this.btnCls = btnCls;

		// Create the promise and capture the resolve function
		this.promise = new Promise((res) => {
			this.resolve = res;
		});
	}

	/**
	 * Public getter to await the user's decision
	 */
	public get resultPromise(): Promise<boolean> {
		return this.promise;
	}

	render() {
		const { contentEl } = this;

		contentEl.createEl('div', { text: this.title, cls: 'setting-item setting-item-heading dn-modal-heading' });
		contentEl.createEl('p', { text: this.message, cls: 'dn-confirm-message' });

		const btnContainer = contentEl.createEl('div', { cls: 'dn-confirm-button-container' });

		// Confirm button
		const btnConfirm = btnContainer.createEl('button', { text: this.btnText, cls: this.btnCls });
		btnConfirm.onclick = () => {
			if (this.resolve) {
				this.resolve(true);
				this.resolve = null; // Clear so onClose doesn't resolve(false)
			}
			this.close();
		};

		// Cancel button
		const btnCancel = btnContainer.createEl('button', { text: 'Cancel', cls: 'mod-cancel' });
		btnCancel.onclick = () => {
			if (this.resolve) {
				this.resolve(false);
				this.resolve = null;
			}
			this.close();
		};

	}

	onClose() {
		if (this.resolve) {
			this.resolve(false);
			this.resolve = null;
		}

		super.onClose();

	}
}