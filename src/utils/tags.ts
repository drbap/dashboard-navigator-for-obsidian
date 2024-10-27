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

				if (arrTags.indexOf(frontmatter_tags.tags[i]) < 0) {
					arrTags.push('#' + frontmatter_tags.tags[i]);
				}
			}

		}
		return arrTags.join(' ');
	} else {
		return '';
	}

}