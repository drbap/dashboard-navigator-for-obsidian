export class DNTableManager {
	private table: HTMLTableElement;

	constructor(tbl: string) {
		this.table = document.querySelector(tbl) as HTMLTableElement;
	}

	private getCells(): NodeListOf<HTMLTableCellElement> {
		return this.table.querySelectorAll('td, th');
	}

	hideColumns(columnNames: string[]): void {
		const cells = this.getCells();

		if (columnNames.length === 0) {
			// Show all columns
			for (let i = 0; i < cells.length; i++) {
				cells[i].classList.remove('dn-hidden');
			}
		} else {
			for (let i = 0; i < cells.length; i++) {
				const colIndex = i % 7; // 7 columns of navigator
				const columnName = this.getColumnNames()[colIndex];
				if (columnNames.includes(columnName)) {
					cells[i].classList.add('dn-hidden');
				} else {
					cells[i].classList.remove('dn-hidden');
				}
			}
		}
	}

	getColumnNames(): string[] {
		return ['name', 'ext', 'path', 'size', 'date', 'tags', 'frontmatter'];
	}
}