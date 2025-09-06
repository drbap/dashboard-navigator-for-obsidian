export class DNTableManager {
	private table: HTMLTableElement | null = null;

	constructor(tbl: string) {
		const navTable = document.querySelector(tbl);
		if (navTable) {
			this.table = navTable as HTMLTableElement;
		}
	}

	private getCells(): NodeListOf<HTMLTableCellElement> {
		if (!this.table) {
			return document.createElement('div').querySelectorAll('td, th');
		}
		return this.table.querySelectorAll('td, th');
	}

	hideColumns(columnNames: string[]): void {
		if (!this.table) {
			return;
		}

		const cells = this.getCells();
		const availableColumnNames = this.getColumnNames();
		const numColumns = availableColumnNames.length;

		if (columnNames.length === 0) {
			// Show all columns
			for (let i = 0, len = cells.length; i < len; i++) {
				cells[i].classList.remove('dn-hidden');
			}
		} else {
			for (let i = 0, len = cells.length; i < len; i++) {
				const colIndex = i % numColumns;
				const columnName = availableColumnNames[colIndex];
				if (columnNames.includes(columnName)) {
					cells[i].classList.add('dn-hidden');
				} else {
					cells[i].classList.remove('dn-hidden');
				}
			}
		}
	}

	getColumnNames(): string[] {
		return ['thumbnail', 'name', 'ext', 'path', 'size', 'date', 'tags', 'frontmatter', 'backlinks', 'outgoing'];
	}
}