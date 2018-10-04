import { Subject } from "rxjs";

type Coordinate = {
	x: number;
	y: number;
}

class Cursor {
	public start: Coordinate;
	public end: Coordinate;
	public previous: { x: number };
	
	constructor( 
		private validRowCallback: ( i: number ) => boolean,
		private rowLengthCallback: ( i: number ) => number,
		private numberRowsCallback: () => number ) {
		let x = 0;
		let y = 0;
		this.start = { x, y };
		this.end = { x, y };
		this.previous = { x };
	}

	moveStartUp( amount: number ) {
		this.moveStartY( -amount );
	}

	moveStartDown( amount: number ) {
		this.moveStartY( amount );
	}

	moveStartY( amount: number ) {
		this.start = this.moveY( this.start, amount );
	}

	moveEndUp( amount: number ) {
		this.moveEndY( -amount );
	}

	moveEndDown( amount: number ) {
		this.moveEndY( amount );
	}

	moveEndY( amount: number ) {
		this.end = this.moveY( this.end, amount );
	}

	moveBothUp( amount: number ) {
		this.moveBothY( -amount );
	}

	moveBothDown( amount: number ) {
		this.moveBothY( amount );
	}

	moveBothY( amount: any ) {
		if( this.start.x === this.end.x && this.start.y === this.end.y ) {
			this.moveStartY( amount );
			this.end = {...this.start};
		} else {
			this.moveStartY( amount );
			this.moveEndY( amount );
		}
	}

	moveStartLeft( amount: number ) {
		this.moveStartX( -amount );
	}

	moveEndLeft( amount: number ) {
		this.moveEndX( -amount );
	}

	moveBothLeft( amount: number ) {
		this.moveBothX( -amount );
	}

	moveStartRight( amount: number ) {
		this.moveStartX( amount );
	}

	moveEndRight( amount: number ) {
		this.moveEndX( amount );
	}

	moveBothRight( amount: number ) {
		this.moveBothX( amount );
	}

	moveStartX( amount: any ) {
		this.start = this.moveX( this.start, amount );
	}

	moveEndX( amount: any ) {
		this.end = this.moveX( this.end, amount );
		this.syncPrevious();
	}

	moveBothX( amount: any ) {
		if( this.start.x === this.end.x && this.start.y === this.end.y ) {
			this.moveEndX( amount );
			this.start = {...this.end};
		} else {
			this.moveEndX( amount );
			this.moveStartX( amount );
		}
	}

	moveEndToStart() {
		this.end = { ...this.start };
		this.syncPrevious();
	}

	moveStartToEnd() {
		this.start = { ...this.end };
	}

	unwindowRight() {
		const direction = this.direction;
		if ( direction < 0 ) {
			this.moveStartToEnd();
		} else if ( direction > 0 ) {
			this.moveEndToStart();
		}
	}

	unwindowLeft() {
		const direction = this.direction;
		if ( direction < 0 ) {
			this.moveStartToEnd();
		} else if ( direction > 0 ) {
			this.moveEndToStart();
		}
	}

	unwindowUp() {
		if ( this.direction > 0 ) {
			this.moveStartToEnd();
		} else {
			this.moveEndToStart();
		}
		this.moveBothUp( 1 );
	}

	unwindowDown() {
		if ( this.direction > 0 ) {
			this.moveEndToStart();
		} else {
			this.moveStartToEnd();
		}
		this.moveBothDown( 1 );
	}

	moveX( { x, y }: Coordinate, amount: any ) {
		x += amount;
		while (  x < 0 && this.validRowCallback( y - 1 ) ) {
			x = this.rowLengthCallback( --y ) + x + 1;
		}

		while ( x > this.rowLengthCallback( y ) && this.validRowCallback( y + 1 ) ) {
			amount -= this.rowLengthCallback( y ) + 1 - ( x - amount );
			x = amount;
			y++;
		}

		if ( x < 0 ) {
			x = 0;
		}

		if ( x >= this.rowLengthCallback( y ) ) {
			x = this.rowLengthCallback( y );
		}
		return { x, y };
	}

	moveY( { x, y }: Coordinate, amount: any ) {
		if ( this.validRowCallback( y + amount ) ) {
			y += amount;
		} else if ( y + amount < 0 ) {
			y = 0;
		} else {
			y = this.numberRowsCallback() - 1;
		}
		let rowlength = this.rowLengthCallback( y );
		if ( x > rowlength ) {
			x = rowlength;
		}
		if ( this.previous.x <= rowlength ) {
			x = this.previous.x;
		} else {
			x = rowlength;
		}
		return { x, y };
	}

	syncPrevious() {
		this.previous.x = this.start.x;
	}

	normalize() {
		const { start, end } = this;
		if ( ( start.y > end.y )
		|| ( start.y === end.y && start.x > end.x ) ) {
			[ this.end, this.start ] = [ start, end ];
		}
	}

	get normalized() {
		let { start, end } = this;
		if ( ( start.y > end.y )
		|| ( start.y === end.y && start.x > end.x ) ) {
			[ end, start ] = [ start, end ];
		}
		return { start, end };
	}

	get windowed() {
		const { start, end } = this;
		return !( start.y === end.y && start.x === end.x );
	}

	get direction() {
		const { start, end } = this;
		return this.windowed 
			? ( ( start.y > end.y )
			|| ( start.y === end.y && start.x > end.x ) )
				? 1
				: -1
			: 0;
	}
};

export type TextEvent = {
	data: string[],
	cursor: {
		start:Coordinate,end:Coordinate
	}
};

export class TextHandler implements EventListenerObject{
	private data: string[];
	private currentLine = 0;
	private cursor: Cursor;
	private output = new Subject<TextEvent>();

	constructor() {
		this.data = [''];
		this.cursor = new Cursor(
			i => typeof this.data[i] !== 'undefined',
			i => this.data[i].length,
			() => this.data.length );
	}

	public handleEvent( event: KeyboardEvent ) {
		let text = '';
		let update = true;
		switch (event.key) {
			case 'Shift':
			case 'Control':
			case 'Meta':
			case 'Alt':
			case 'Dead':
			case 'Unidentified':
			case 'Escape':
				update = false;
				break;
			case 'ArrowRight':
				this.cursorMove( this.cursor,
					this.cursor.moveBothRight,
					this.cursor.moveEndRight,
					!event.shiftKey,
					this.cursor.unwindowRight );
				break;
			case 'ArrowLeft':
				this.cursorMove( this.cursor,
					this.cursor.moveBothLeft,
					this.cursor.moveEndLeft,
					!event.shiftKey,
					this.cursor.unwindowLeft );
				break;
			case 'Backspace':
				this.cursor.normalize();
				this.cursor.moveStartLeft( +!this.cursor.windowed );
				this.data = this.deleteText( this.data, this.cursor );
				this.cursor.syncPrevious();
				break;
			case 'Delete':
				this.cursor.normalize();
				this.cursor.moveEndRight( +!this.cursor.windowed );
				this.data = this.deleteText( this.data, this.cursor );
				this.cursor.syncPrevious();
				break;
			case 'ArrowDown':
				this.cursorMove( this.cursor,
					this.cursor.moveBothDown,
					this.cursor.moveEndDown,
					!event.shiftKey,
					this.cursor.unwindowDown );
				break;
			case 'ArrowUp':
				this.cursorMove( this.cursor,
					this.cursor.moveBothUp,
					this.cursor.moveEndUp,
					!event.shiftKey,
					this.cursor.unwindowUp );
				break;
			case 'Enter':
				if ( this.cursor.windowed ) {
					this.cursor.normalize();
					this.data = this.insertLine( this.deleteText( this.data, this.cursor ), this.cursor );
				} else {
					this.data = this.insertLine( this.data, this.cursor );
				}
				this.cursor.syncPrevious();
				break;
			case 'Tab':
				text = '\t';
			default:
				if (!text) {
					text = event.key;
				}
				if ( this.cursor.windowed ) {
					this.cursor.normalize();
					this.data = this.replaceText( this.data, this.cursor, text );
				} else {
					this.data = this.insertText( this.data, this.cursor, text );
				}
				this.cursor.syncPrevious();
		}
		
		if ( update ) {
			if ( this.output.observers.length > 0 ) {
				this.output.next( {
					data: [...this.data],
					cursor: this.cursor.normalized
				} );
			} else {
				// this.printText( this.data, this.cursor );
			}
		}
	}


	private deleteText( data: any, { start, end }: Cursor | { start: any; end: any; } ) {
		data = [...data];
		if ( start.y === end.y ) {
			let string = data[start.y];
			data[start.y] = string.substring( 0, start.x ) + string.substring( end.x );
		} else {
			let begin = data.slice( 0, start.y );
			let merge = data.slice( start.y, end.y + 1 )
				.filter( ( x: any, i: number, array: string[] ) => !i || i === array.length - 1 );
			let tail = data.slice( end.y + 1 );
			data = [
				...begin,
				merge[0].substring( 0, start.x ) + ( merge[1] ? merge[1].substring( end.x ): '' ),
				...tail,
			]
		}
		end.x = start.x;
		end.y = start.y;
		return data;
	}

	private insertText( data: any, { start, end }: Cursor | { start: any; end: any; }, text: any ) {
		data = [ ...data ];
		const row = data[ start.y ];
		data[ start.y ] = row.substring( 0, start.x ) + text + row.substring( start.x );
		start.x += text.length;
		end.x = start.x;
		return data;
	}

	private replaceText( data: string[], { start, end }: Cursor, text: string ) {
		return this.insertText(
			this.deleteText( data, { start, end } ),
			{ start, end },
			text 
		);
	}

	private insertLine( data: any, { start, end }: Cursor ) {
		let row = data[start.y];
		data = [
			...data.slice(0, start.y),
			...[row.substring( 0, start.x ), row.substring( start.x )],
			...data.slice( start.y + 1 )
		];
		end.y = ++start.y;
		end.x = start.x = 0;
		return data;
	}

	private printText( data: string[], cursor: Cursor ) {
		let { start, end } = cursor.normalized;
			let windowed = cursor.windowed;
			let text = data.reduce( ( print, row, i ) => {
				row += ' ';
				let join = data.length - 1 === i ? '' : '\n';
				if ( i === start.y ) {
					let head = row.substring( 0, start.x );
					let selected, tail, sameline;
					if ( start.y === end.y ) {
						selected = row.substring( start.x, end.x + <any>!windowed );
						tail = row.substring( end.x + <any>!windowed );
						sameline = '%c';
					} else {
						selected = row.substring( start.x );
						tail = sameline = '';
					}
					return print + head + '%c' + selected + sameline + tail + join;
				}
				if ( i === end.y ) {
					let selected = row.substring( 0, end.x );
					let tail = row.substring( end.x );
					return print + selected + '%c' + tail + join;
				}
				return print + row + join;
			}, '');
			console.log( text,
				( windowed ? 'color:white;background-color:steelblue;' : 'text-decoration:underline;' ),
				'color:initial;background-color:none;tab-size:4;');
	}

	private cursorMove( cursor: Cursor, both: (amount: any) => void, start: (amount: any) => void, test: boolean, unwindow: () => void ) {
		if ( test ) {
			if ( cursor.windowed ) {
				unwindow.apply( cursor );
			} else {
				both.apply( cursor, [ 1 ] );
			}
		} else {
			start.apply( cursor, [ 1 ] );
		}
	}
}
// Uncomment and copy .js to test in browser
// let texteventhandler = new TextHandler();
// window.addEventListener('keydown', texteventhandler);
