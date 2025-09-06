import { TFile } from "obsidian";

export function getBacklinksToFile(file: TFile): TFile[] {
    const currentFilePath = file.path;
    const backlinks: TFile[] = [];

    try {
        const resolvedLinks = this.app.metadataCache.resolvedLinks;

        for (const [sourceFilePath, linkMap] of Object.entries(resolvedLinks)) {

            if (Object.keys(linkMap as object).includes(currentFilePath)) {
                const sourceFile = this.app.vault.getAbstractFileByPath(sourceFilePath);

                if (sourceFile instanceof TFile) {
                    backlinks.push(sourceFile);
                }
            }
        }
        return backlinks;

    } catch (error) {
        return [];
    }
}

export function getOutgoingLinks(file: TFile): TFile[] {
    const outgoingLinks: Set<TFile> = new Set();
    const metadataCache = this.app.metadataCache;

    const fileCache = metadataCache.getFileCache(file);
    if (fileCache && fileCache.links) {
        for (const link of fileCache.links) {
            const linkedFile = metadataCache.getFirstLinkpathDest(link.link, file.path);
            if (linkedFile instanceof TFile) {
                outgoingLinks.add(linkedFile);
            }
        }
    }

    if (fileCache && fileCache.embeds) {
        for (const embed of fileCache.embeds) {
            const embeddedFile = metadataCache.getFirstLinkpathDest(embed.link, file.path);
            if (embeddedFile instanceof TFile) {
                outgoingLinks.add(embeddedFile);
            }
        }
    }

    return Array.from(outgoingLinks);
}