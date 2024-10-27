export class DNPieChart {
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _data: { value: number; color: string; label: string }[];
	private _margin: number;
	private _fontSize: number;
	private _legendWidth: number;
	private _labelColor: string;
	private _cX: number;
	private _cY: number;

	constructor(canvas: HTMLCanvasElement, margin = 10, fontSize = 12, legendWidth = 50, labelColor = "#828282") {
		this._canvas = canvas;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			this._ctx = ctx;
		}
		this._data = [];
		this._margin = margin;
		this._fontSize = fontSize;
		this._legendWidth = legendWidth;
		this._labelColor = labelColor;
	}

	addData(value: number, color: string, label: string): void {
		this._data.push({ value, color, label });
	}

	draw(): void {
		const { width, height } = this._canvas;
		const availWidth = width - 2 * this._margin;
		const availHeight = height - 2 * this._margin;

		const scale = Math.min(availWidth / width, availHeight / height);
		const radius = Math.min(availWidth, availHeight) / 2 * scale;

		// Center coordinates
		this._cX = width / 2;
		this._cY = height / 2;

		this._ctx.clearRect(0, 0, width, height);

		const totalValue = this._data.reduce((acc, curr) => acc + curr.value, 0);
		let currentAngle = -Math.PI / 2;
		this._data.forEach((slice) => {
			const sliceAngle = (slice.value / totalValue) * 2 * Math.PI;
			this.drawSlice(radius, sliceAngle, slice.color, currentAngle);
			currentAngle += sliceAngle;
		});

		this.drawLegend(2, 20);
	}

	private drawSlice(radius: number, sliceAngle: number, color: string, startAngle: number): void {
		this._ctx.beginPath();
		this._ctx.arc(this._cX, this._cY, radius, startAngle, startAngle + sliceAngle);
		this._ctx.lineTo(this._cX, this._cY);
		this._ctx.fillStyle = color;
		this._ctx.closePath();
		this._ctx.fill();
	}

	private drawLegend(x: number, y: number): void {
		const lineHeight = this._fontSize + 5;

		this._data.forEach((slice, index) => {
			const textX = x + this._legendWidth / 5;
			const textY = y + index * lineHeight - 10;

			// Draw legend square
			this._ctx.fillStyle = slice.color;
			this._ctx.fillRect(textX - 10, textY, 5, 5);

			// Draw label
			this._ctx.fillStyle = this._labelColor;
			this._ctx.font = `${this._fontSize}px sans-serif`;
			this._ctx.fillText(`${slice.label} (${slice.value})`, textX, textY + 8);
		});
	}
}
