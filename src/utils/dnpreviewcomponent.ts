import { Component, TFile, App, MarkdownRenderer, normalizePath } from 'obsidian';

export class DNPreviewComponent extends Component {
	private containerEl: HTMLElement;
	private file: TFile;
	private app: App;

	constructor(app: App, containerEl: HTMLElement, file: TFile) {
		super();
		this.app = app;
		this.containerEl = containerEl;
		this.file = file;
	}

	async onload() {
		this.containerEl.empty();

		// Render the markdown content to the container element
		try {
			MarkdownRenderer.render(
				this.app,
				'![[' + normalizePath(this.file.path) + ']]',
				this.containerEl,
				normalizePath(this.file.path),
				this
			);
		} catch (error) {
			return;
		}

	}
}
