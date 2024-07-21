export function formatFileSize(fileSize: number): string {
	if (fileSize === 0) {
		return "0";
	}
	const formattedSize = fileSize.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	return formattedSize;
}


export function getFolderStructure(folder: string): string {
	const folders = folder.split("/").slice(0, -1);
	if (folders.length === 0) {
		return "/";
	}

	return "/" + folders.join("/") + "/";
}