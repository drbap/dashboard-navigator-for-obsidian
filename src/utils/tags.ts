import { TFile } from "obsidian";

export function getTagsPerFile(file: TFile): string {
	const cur_file = this.app.vault.getAbstractFileByPath(file.path);
	if (cur_file !== null) {

		const tags = this.app.metadataCache.getFileCache(file)?.tags;
		const frontmatter_tags = this.app.metadataCache.getFileCache(file)?.frontmatter;
		const arrTags: string[] = [];

		if (tags) {
			for (let i = 0, len = tags.length; i < len; i++) {

				if (arrTags.indexOf(tags[i].tag) < 0) {
					arrTags.push(tags[i].tag);
				}
			}
		}

		if (frontmatter_tags !== undefined && frontmatter_tags.tags) {
			for (let i = 0, len = frontmatter_tags.tags.length; i < len; i++) {
				const fmTag = '#' + frontmatter_tags.tags[i];
				if (arrTags.indexOf(fmTag) < 0) {
					arrTags.push(fmTag);
				}
			}

		}
		return arrTags.join(' ');
	} else {
		return '';
	}

}

export function getPropsPerFile(file: TFile): string {
	const fileProperties: string[] = [];

	const cache = this.app.metadataCache.getFileCache(file);

	if (cache?.frontmatter) {
		for (const [key, value] of Object.entries(cache.frontmatter)) {
			fileProperties.push(`'${key}: ${value}'`);
		}
	}

	return fileProperties.join(' \n');
}


