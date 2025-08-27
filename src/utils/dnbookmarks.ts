export interface BookmarkItem {
	type: 'file' | 'group';
	ctime: number;
	path?: string;
	items?: BookmarkItem[];
	title?: string;
}

export interface BookmarksJson {
	items: BookmarkItem[];
}

export function getBookmarkedFiles(bookmarksJson: string): string[] {
	const bookmarksPaths = new Set<string>();
	const stack: BookmarkItem[] = [];

	try {
		const bookmarks: BookmarksJson = JSON.parse(bookmarksJson);

		if (bookmarks.items) {
			for (let i = bookmarks.items.length - 1; i >= 0; i--) {
				stack.push(bookmarks.items[i]);
			}
		}

		while (stack.length > 0) {
			const currentItem: BookmarkItem | undefined = stack.pop();

			if (!currentItem) continue;

			if (currentItem.type === 'file' && currentItem.path) {
				bookmarksPaths.add(currentItem.path);
			}
			else if (currentItem.type === 'group' && currentItem.items) {
				for (let i = currentItem.items.length - 1; i >= 0; i--) {
					stack.push(currentItem.items[i]);
				}
			}
		}
	} catch (error) {
		return [];
	}

	return Array.from(bookmarksPaths);
}