import { App, TAbstractFile, TFile, TFolder } from 'obsidian';
import { getBookmarkedFiles } from 'src/utils/dnbookmarks';

export interface DNData {
	all_files: TFile[];
	folders: TFolder[];
	last_opened: TFile[];
	bookmarks: TFile[];
	filtered_files: TFile[];
	notes: TFile[];
	images: TFile[];
	canvas: TFile[];
	audios: TFile[];
	videos: TFile[];
	pdf: TFile[];
	bases: TFile[];
	other: TFile[];
	tags: Map<string, TFile[]>;
	tagNames: string[];
}

export class DNDataManager {
	private dataCache: DNData | null = null;
	private cacheHash = '';

	public async getDataCache(
		app: App,
		excludedExtensions: string[],
		excludedFolders: string[]
	): Promise<DNData> {
		const allLoadedAbstractFiles: TAbstractFile[] = app.vault.getAllLoadedFiles();
		const currentHash = await this.generateHash(allLoadedAbstractFiles, excludedExtensions, excludedFolders);

		if (this.cacheHash === currentHash && this.dataCache) {
			// console.log('Using cached data.');
			return this.dataCache;
		} else {

			// console.log('Vault state changed, rebuilding cache.');
			const newData = await this.generateDataCache(app, allLoadedAbstractFiles, excludedExtensions, excludedFolders);
			this.dataCache = newData;
			this.cacheHash = currentHash;
			return newData;
		}

	}

	private async generateDataCache(
		app: App,
		allLoadedAbstractFiles: TAbstractFile[],
		excludedExtensions: string[],
		excludedFolders: string[]
	): Promise<DNData> {
		// Initialize all properties of the DNData object locally
		const data: DNData = {
			all_files: [],
			folders: [],
			last_opened: [],
			bookmarks: [],
			filtered_files: [],
			notes: [],
			images: [],
			canvas: [],
			audios: [],
			videos: [],
			pdf: [],
			bases: [],
			other: [],
			tags: new Map<string, TFile[]>(),
			tagNames: []
		};

		// Populate all_files and folders -> iterating once
		for (const absF of allLoadedAbstractFiles) {
			if (absF instanceof TFile) {
				data.all_files.push(absF);
			} else if ((absF instanceof TFolder) && (!absF.isRoot())) {
				data.folders.push(absF);
			}
		}

		// Apply filtering  -> excluded extensions and folders
		data.filtered_files = this.filterFiles(data.all_files, excludedExtensions, excludedFolders);

		// Organize the filtered files into categories
		this.organizeFiles(data.filtered_files, data);

		// Update tags
		data.tags = await this.dnGetAllTagsCount(app, data.all_files);
		data.tagNames = Array.from(data.tags.keys());

		return data;
	}

	private filterFiles(files: TFile[], excludedExtensions: string[], excludedFolders: string[]): TFile[] {
		return files.filter(file => {
			const isExcludedExtension = excludedExtensions.includes(file.extension.toLowerCase());
			const isExcludedFolder = excludedFolders.some(folder => file.path.startsWith(folder));
			return !isExcludedExtension && !isExcludedFolder;
		});
	}

	private organizeFiles(files: TFile[], data: DNData): void {
		const extensions: Record<string, TFile[]> = {
			'md': data.notes,
			// Images
			'avif': data.images,
			'bmp': data.images,
			'gif': data.images,
			'ico': data.images,
			'jpeg': data.images,
			'jpg': data.images,
			'png': data.images,
			'raw': data.images,
			'svg': data.images,
			'tif': data.images,
			'tiff': data.images,
			'webp': data.images,
			// Audio files
			'aac': data.audios,
			'aif': data.audios,
			'aifc': data.audios,
			'aiff': data.audios,
			'flac': data.audios,
			'm4a': data.audios,
			'mp3': data.audios,
			'ogg': data.audios,
			'wav': data.audios,
			'webm': data.audios,
			// Videos
			'avi': data.videos,
			'mov': data.videos,
			'mkv': data.videos,
			'mp4': data.videos,
			// PDF and Canvas
			'pdf': data.pdf,
			'base': data.bases,
			'canvas': data.canvas
		};

		for (const file of files) {
			const ext = file.extension.toLowerCase();
			const targetArr = extensions[ext];
			if (targetArr) {
				targetArr.push(file);
			} else {
				data.other.push(file);
			}
		}
	}

	private async generateHash(
		allAbstractFiles: TAbstractFile[],
		excludedExtensions: string[],
		excludedFolders: string[]
	): Promise<string> {
		let stringToHash = '';
		// Include path and mtime of ALL files for the hash, ensuring any change triggers rebuild
		for (const file of allAbstractFiles) {
			// Check if it's a TFile and has stat, otherwise just use path
			if (file instanceof TFile && file.stat) {
				stringToHash += `${file.path}|${file.stat.mtime}|`;
			} else {
				stringToHash += `${file.path}|`; // For folders, just use path
			}
		}

		stringToHash += JSON.stringify(excludedExtensions) + '|';
		stringToHash += JSON.stringify(excludedFolders) + '|';

		const encoder = new TextEncoder();
		const data = encoder.encode(stringToHash);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

		return hashHex;
	}

	getLastOpenedFiles(app: App): TFile[] {
		const lo_files: TFile[] = [];
		const lastOpenPaths = app.workspace.getLastOpenFiles();
		for (const path of lastOpenPaths) {
			const file = app.vault.getAbstractFileByPath(path);
			if (file instanceof TFile) {
				lo_files.push(file);
			}
		}
		return lo_files;
	}

	async getBookmarkedVaultFiles(app: App, excludedExtensions: string[], excludedFolders: string[]): Promise<TFile[]> {
		const bookmarkedFiles: TFile[] = [];
		try {
			const bookmarksJsonContent = await app.vault.adapter.read('.obsidian/bookmarks.json');
			const bookmarkPaths = getBookmarkedFiles(bookmarksJsonContent);

			if (Array.isArray(bookmarkPaths)) {
				for (const path of bookmarkPaths) {
					const file = app.vault.getAbstractFileByPath(path);
					if (file instanceof TFile) {
						const isExcludedExtension = excludedExtensions.includes(file.extension.toLowerCase());
						const isExcludedFolder = excludedFolders.some(folder => file.path.startsWith(folder));

						if (!isExcludedExtension && !isExcludedFolder) {
							bookmarkedFiles.push(file);
						}
					}
				}
			}
		} catch (error) {
			return [];
		}
		return bookmarkedFiles;
	}

	async dnGetAllTagsCount(app: App, files: TFile[]): Promise<Map<string, TFile[]>> {

		const tagFiles = new Map<string, TFile[]>();

		for (const file of files) {
			const metadata = app.metadataCache.getFileCache(file);
			const fileTags = new Set<string>();

			if (metadata?.tags) {
				for (const tag of metadata.tags) {
					fileTags.add(tag.tag);
				}
			}

			if (metadata?.frontmatter?.tags) {
				const fmTags = metadata.frontmatter.tags;
				if (typeof fmTags === 'string') {
					fileTags.add(fmTags.trim());
				} else if (Array.isArray(fmTags)) {
					for (const tag of fmTags) {
						if (typeof tag === 'string') {
							fileTags.add(tag.trim());
						}
					}
				}
			}

			for (const tag of fileTags) {
				let normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
				normalizedTag = normalizedTag.toLowerCase();

				const currentFiles = tagFiles.get(normalizedTag) || [];
				currentFiles.push(file);
				tagFiles.set(normalizedTag, currentFiles);
			}
		}

		// Sort the entries by tag name
		const sortedEntries = Array.from(tagFiles.entries()).sort((a, b) => {
			const tagNameA = a[0];
			const tagNameB = b[0];
			const lowerCaseTagNameA = tagNameA.toLowerCase();
			const lowerCaseTagNameB = tagNameB.toLowerCase();
			return lowerCaseTagNameA.localeCompare(lowerCaseTagNameB);
		});

		const sortedMap = new Map(sortedEntries);

		return sortedMap;
	}

	public dnGetAllTagsNames(): string[] {
		// Check if the cache exists and if it has tags
		if (!this.dataCache || !this.dataCache.tags) {
			return [];
		}
		return Array.from(this.dataCache.tags.keys());
	}
}