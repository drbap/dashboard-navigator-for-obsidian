import { App, AbstractInputSuggest } from 'obsidian';

export class DNTagSuggestions extends AbstractInputSuggest<string> {
	private allTags: string[]; // All tags like #tagName

	constructor(
		app: App,
		protected inputEl: HTMLInputElement,
		allTags: string[]) {
		super(app, inputEl);
		this.allTags = allTags;
	}

	private getActiveTagInfo(query: string): { prefix: string, typedTag: string, startIndex: number } | null {
		const cursorPosition = this.inputEl.selectionStart || 0;
		const textBeforeCursor = query.substring(0, cursorPosition);

		const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
		const currentWordStart = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
		const currentWord = textBeforeCursor.substring(currentWordStart);

		// prefix ! -> exclude tag
		let prefix = '';
		let typedTag = '';
		let startIndex = -1;

		if (currentWord.startsWith('!#')) {
			prefix = '!#';
			typedTag = currentWord.substring(2);
			startIndex = currentWordStart;
		} else if (currentWord.startsWith('#')) {
			prefix = '#';
			typedTag = currentWord.substring(1);
			startIndex = currentWordStart;
		} else {
			return null;
		}

		return { prefix, typedTag, startIndex };
	}

	getSuggestions(query: string): string[] {
		const tagInfo = this.getActiveTagInfo(query);

		if (!tagInfo) {
			return [];
		}

		const { typedTag } = tagInfo;

		if (typedTag.length === 0) {
			return [];
		}

		return this.allTags
			.filter(fullTagWithHash => {
				const tagWithoutHash = fullTagWithHash.substring(1);
				return tagWithoutHash.toLowerCase().startsWith(typedTag.toLowerCase());
			})
			.map(fullTagWithHash => fullTagWithHash.substring(1));
	}

	renderSuggestion(tagWithoutHash: string, el: HTMLElement): void {
		const query = this.inputEl.value;
		const tagInfo = this.getActiveTagInfo(query);

		if (!tagInfo) {
			el.createEl('div', { text: tagWithoutHash });
			return;
		}

		const { prefix, typedTag } = tagInfo;
		const fullTagToDisplay = prefix + tagWithoutHash;

		const matchIndex = tagWithoutHash.toLowerCase().indexOf(typedTag.toLowerCase());

		if (matchIndex === -1) {
			el.createEl('div', { text: fullTagToDisplay });
			return;
		}

		const suggestionEl = el.createEl('div');

		// Render the prefix -> !#tag or #tag
		suggestionEl.createSpan({ text: prefix });

		suggestionEl.createSpan({ text: tagWithoutHash.substring(0, matchIndex) });

		suggestionEl.createSpan({
			cls: 'suggestion-highlight',
			text: tagWithoutHash.substring(matchIndex, matchIndex + typedTag.length)
		});

		suggestionEl.createSpan({ text: tagWithoutHash.substring(matchIndex + typedTag.length) });
	}

	selectSuggestion(tagWithoutHash: string, evt: MouseEvent | KeyboardEvent): void {
		const query = this.inputEl.value;
		const tagInfo = this.getActiveTagInfo(query);

		if (!tagInfo) {
			this.close();
			return;
		}

		const { prefix, startIndex } = tagInfo;

		const textBeforeCurrentWord = query.substring(0, startIndex);
		const textAfterCurrentWord = query.substring(this.inputEl.selectionStart || 0);

		const newValue = `${textBeforeCurrentWord}${prefix}${tagWithoutHash} ${textAfterCurrentWord}`;

		this.inputEl.value = newValue;

		const newCursorPos = textBeforeCurrentWord.length + prefix.length + tagWithoutHash.length + 1;
		this.inputEl.setSelectionRange(newCursorPos, newCursorPos);

		const inputEvent = new Event('input', { bubbles: true });
		this.inputEl.dispatchEvent(inputEvent);

		this.close();
	}
}