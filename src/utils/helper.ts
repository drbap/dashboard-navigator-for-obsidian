// Helper function to sanitize description input
export function DNSanitizeInput(txt: string): string {
	return txt
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/[\u2000-\u200F\u2028-\u202F\u2060-\u206F]/g, '')
		.trim();
}