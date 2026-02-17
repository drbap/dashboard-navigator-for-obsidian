/**
 * DNKeyboardNavigation
 * Handles focus trapping, Tab-looping, and Enter
 */
export class DNKeyboardNavigation {
	private containerEl: HTMLElement;
	private focusableElements: HTMLElement[] = [];
	private observer: MutationObserver | null = null;
	private previousActiveElement: HTMLElement | null = null;

	// The selector determines what the "Tab" key can land on
	public static readonly FOCUSABLE_SELECTOR = [
		'.dn-modal-container label:has(input[type="checkbox"])',
		'.dn-modal-container input:not(label input):not([disabled])',
		'.dn-modal-container textarea:not([disabled])',
		'.dn-modal-container button:not([disabled])',
		'.dn-modal-container select:not([disabled])',
		'.dn-modal-container .search-input-clear-button',
		'.dn-modal-container a[tabindex]:not([tabindex="-1"])',
		'.dn-modal-container .dn-saved-search-item:not([tabindex="-1"])',
		'.dn-modal-container .dn-btn-stats',
		'.dn-modal-container .dn-btn-next',
		'.dn-modal-container .dn-btn-prev',
		'.dn-modal-container .dn-link-file-header',
		'.dn-modal-container .dn-td-sidebar-container a.tag'
	].join(',');

	constructor(containerEl: HTMLElement) {
		this.containerEl = containerEl;
		this.handleKeyDown = this.handleKeyDown.bind(this);

		// Auto-refresh when DOM structure changes significantly
		this.observer = new MutationObserver(() => this.refreshFocusableElements());
	}

	/**
	 * Scans the container for focusable elements and filters out hidden/disabled items.
	 */
	public refreshFocusableElements(): HTMLElement[] {
		if (!this.containerEl || !document.body.contains(this.containerEl)) return [];

		const elements = Array.from(
			this.containerEl.querySelectorAll<HTMLElement>(DNKeyboardNavigation.FOCUSABLE_SELECTOR)
		);

		this.focusableElements = elements.filter(el => {
			// offsetParent is null if the element or any ancestor has display: none
			const isVisible = el.offsetParent !== null;

			const isDisabled = (el as HTMLButtonElement).disabled === true ||
				el.classList.contains('is-disabled') ||
				el.getAttribute('aria-disabled') === 'true';

			return isVisible && !isDisabled;
		});

		return this.focusableElements;
	}

	/**
	 * Main navigation
	 */
	private handleKeyDown(evt: KeyboardEvent) {
		if (evt.key === 'Tab') {
			// Re-scan to ensure we aren't tabbing to something that just disappeared
			const focusable = this.refreshFocusableElements();
			if (focusable.length === 0) return;

			const activeElement = document.activeElement as HTMLElement;
			const currentIndex = focusable.indexOf(activeElement);

			evt.preventDefault();
			evt.stopPropagation();

			let nextIndex: number;

			if (currentIndex === -1) {
				// If focus is outside the modal, start at the beginning (or end if shifting)
				nextIndex = evt.shiftKey ? focusable.length - 1 : 0;
			} else {
				// Standard looping logic
				if (evt.shiftKey) {
					nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
				} else {
					nextIndex = (currentIndex + 1) % focusable.length;
				}
			}

			focusable[nextIndex]?.focus();
		}

		// --- ENTER ---
		if (evt.key === 'Enter') {
			const active = document.activeElement as HTMLElement;

			// Ensure the active element is actually inside our container
			if (!active || !this.containerEl.contains(active)) return;

			// List of tags that already handle the Enter key natively.
			const nativeHandlers = ['INPUT', 'TEXTAREA', 'SELECT'];
			const needsManualClick = !nativeHandlers.includes(active.tagName);

			if (needsManualClick) {
				evt.preventDefault();
				active.click();
			}
		}
	}

	/**
	 * Activates the listeners and captures the background focus state.
	 */
	public start() {
		this.previousActiveElement = document.activeElement as HTMLElement;
		this.refreshFocusableElements();

		// Observer: only watch for structural changes or visibility toggles
		this.observer?.observe(this.containerEl, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['class', 'disabled', 'hidden', 'style']
		});

		// Use capture phase (true) to intercept events before other listeners
		window.addEventListener('keydown', this.handleKeyDown, true);

		// Auto-focus the first element in the modal
		if (this.focusableElements.length > 0) {
			this.focusableElements[0].focus();
		}
	}

	/**
	 * Deactivates listeners and restores focus to the background UI.
	 */
	public stop() {
		this.observer?.disconnect();
		window.removeEventListener('keydown', this.handleKeyDown, true);

		if (this.previousActiveElement && document.body.contains(this.previousActiveElement)) {
			const el = this.previousActiveElement;
			// Timeout ensures focus shifts after the modal is fully removed from the DOM
			setTimeout(() => el.focus(), 50);
		}
	}
}