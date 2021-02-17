Array.prototype.random = function() {
	return this[Math.random() * this.length | 0];
}

class game {
	//(e) the Target ELement (s) the Grid Size (p) the Percentage of Bombs

	/**
	 * @type {field[][]}
	 */
	fields;

	/**
	 * @type {function}
	 */
	afterNextDraw;

	constructor(e = {}, s = 20, p = 18) {
		this.Canvas = e.get && e.get(0).localName == "canvas" ? e.get(0) : e.localName == "canvas" ? e : document.getElementById(e) ? document.getElementById(e) : null;
		if(!this.Canvas) throw TypeError("You must supply a Element of type Canvas");

		this.ctx = this.Canvas.getContext("2d");

		this.S = Math.max(2, s);

		this.fields = Array.from(Array(s)).fill(Array.from(Array(s)).fill(null)).map(v => v.map(v => new field(this)));

		this.afterNextDraw = null;

		this.ended = false;
		this.p = p;
		this.size = 0;

		this.init();
	}

	init() {
		window.xo = 0;
		window.yo = 0;
		window.o = 0;
		onresize = this.resize.bind(this);
		onmousedown = this.mouse.bind(this);
		oncontextmenu = this.stop.bind(this);

		this.fields.map((v, xi) => v.map((v, yi) => {
			v.x = xi;
			v.y = yi;
			return v;
		}));

		let total = this.S ** 2 * (this.p / 100) | 0;
		while(total > 0) {
			let rx = Math.random() * this.S | 0;
			let ry = Math.random() * this.S | 0;
			if(!this.fields[rx][ry].bomb) {
				total--;
				this.fields[rx][ry].bomb = true;
			}
		}
		this.fields.forEach(v => v.forEach(v => v.setValue()));
		let a = [];
		this.fields.forEach(f => {
			f.forEach(v => {
				if(v.value === 0 && !v.bomb) {
					a.push(v);
				}
			})
		})
		let r = a.random();
		console.log(r);
		this.fields[r.x][r.y].triggerEmpty();
		this.resize();
	}

	stop() { event.preventDefault(); if(event.sourceCapabilities.firesTouchEvents) this.mouse(event, true); }

	mouse(e, t) {
		e = e || event;

		let key = e.which;

		if(t) key = 3;

		e.preventDefault();

		let o = { x: e.clientX - xo, y: e.clientY - yo };


		this.fields.forEach(v => v.forEach(v => {

			if(v.checkClick(o)) {

				if(key == 1) {
					if(v.flag) return;

					if(v.value == 0) {
						v.triggerEmpty();
					} else {
						v.visible = true;
						// if()
					}

					if(v.bomb) {
						this.ended = true;
						this.fields.map(v => v.map(v => { v.visible = true; return v }))
						this.draw();

						this.afterNextDraw = () => alert("You Lost");
					}
				} else if(key == 3) {
					if(!v.visible)
						v.flag = !v.flag;
				}

				if(this.hasWon())
					this.afterNextDraw = () => alert("Yay you won");
			}
		}))
		this.draw();
		// console.log(o)
		// console.log(e.which);
	}

	resize() {
		//size of the Canvas. Always the smaller size of the Viewport to stay Square
		this.size = Math.min(innerHeight, innerWidth);
		o = this.size / 160 / (100 - this.S / 100);
		this.Canvas.width = this.Canvas.height = this.size;
		let m = [0, 0, 0, 0];
		xo = yo = 0;
		if(this.size == innerHeight) {
			let d = innerWidth - this.size;
			xo = d / 2;
			m[1] = m[3] = (d / 2);
		} else {
			let d = innerHeight - this.size;
			yo = d / 2;
			m[0] = m[2] = (d / 2);
		}
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.Canvas.style.margin = m.map(v => v + "px").join(" ");
		this.draw();
	}

	hasWon() {
		for(let x = 0; x < this.fields.length; ++x) {
			for(let y = 0; y < this.fields[x].length; ++y) {
				const f = this.fields[x][y];
				if(!f.bomb && !f.visible)
					return false;
				else
					continue;
			}
		}
		return true;
	}

	draw() {
		this.ctx.clearRect(0, 0, this.size, this.size);
		let s = (this.size - (this.S - 1) * o) / this.S;
		this.fields.forEach((x, xi) => {
			x.forEach((y, yi) => {
				y.draw(s);
			});
		});

		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				if(this.afterNextDraw != null) {

					this.afterNextDraw();
					this.afterNextDraw = null;
				}
			})
		})
	}
}

class field {

	visible = true;

	constructor(p) {
		this.visible = false;
		this.s = 0;
		this.p = p;
		this.x = 0;
		this.y = 0;
		this.flag = false;
		this.bomb = false;
		this.value = 0;
	}
	setValue() {
		if(this.bomb) return this.value = null;

		let a = 0;

		directions.forEach(v => {
			if(!(v[0] + this.x < 0 || v[1] + this.y < 0 || v[0] + this.x >= this.p.S || v[1] + this.y >= this.p.S)) {
				if(this.p.fields[v[0] + this.x][v[1] + this.y].bomb) {
					a++;
				}
			}
		});
		this.value = a;
	}
	draw(s) {
		this.s = s;
		this.p.ctx.fillStyle = this.p.ended ? (this.bomb ? this.flag ? "#7cff6d" : "#ff6d83" : "#0000") : this.flag ? "#e4aa54" : this.visible ? "#0000" : "#a986da6b";
		this.p.ctx.fillRect(this.x * s + this.x * o, this.y * s + this.y * o, s, s);
		this.p.ctx.fillStyle = "#000";
		if(this.value != null && this.visible && this.value != 0) {
			this.p.ctx.font = s + "px Arial";
			this.p.ctx.fillText(this.value.toString(), this.x * s + this.x * o + s / 2, this.y * s + this.y * o + s / 2);
		}
	}
	checkClick(e) {
		if(e.x > this.x * this.s + this.x * o && e.x < this.x * this.s + this.x * o + this.s && e.y > this.y * this.s + this.y * o && e.y < this.y * this.s + this.y * o + this.s) {
			return true;
		}
	}
	triggerEmpty() {
		this.visible = true;
		directions.forEach(v => {
			if(!(v[0] + this.x < 0 || v[1] + this.y < 0 || v[0] + this.x >= this.p.S || v[1] + this.y >= this.p.S)) {
				if(this.p.fields[v[0] + this.x][v[1] + this.y].value == 0 && !this.p.fields[v[0] + this.x][v[1] + this.y].visible) {
					this.p.fields[v[0] + this.x][v[1] + this.y].triggerEmpty();
				}
				this.p.fields[v[0] + this.x][v[1] + this.y].visible = true;
				this.p.fields[v[0] + this.x][v[1] + this.y].flag = false;
			}
		});
	}
}