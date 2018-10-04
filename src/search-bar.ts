import { Shadow, init, OPEN, define, OnConnected, OnDisonnected } from "./shadow";
import { Observable, Subscription, fromEvent, merge } from "rxjs";
import { map, filter, distinctUntilKeyChanged, distinctUntilChanged } from "rxjs/operators"
import { Button } from "./button";

export class SearchBar extends Shadow implements OnConnected, OnDisonnected {
	private button: Button;
	private textbox: HTMLInputElement;
	
	private _search: Observable<string>;
	private subscription: Subscription;

	constructor() {
		super( init( OPEN ) );

		this.button = new Button();

		this.textbox = document.createElement('input');
		this.textbox.type = 'text';

		const keypress = fromEvent( this.textbox, 'keyup' )
			.pipe( distinctUntilChanged( ( event: KeyboardEvent, old: KeyboardEvent ) => old.key === event.key ), 
				filter( ( event: KeyboardEvent ) => event.key === 'Enter' ) );
		const merged = merge( keypress, this.button.whenClick );
		this._search = merged.pipe( map( _ => this.textbox.value ) );

		this.shadow.appendChild( this.textbox );
		this.shadow.appendChild( this.button );
	}

	public get search(): Observable<string> {
		return this._search
	}

	connectedCallback(): void {
		this.subscription = this.outputClick( this.search );

		const label = this.getAttribute( 'label' );
		console.log( label );
		this.button.label = label;
	}
	
	disconnectedCallback(): void {
		if( this.subscription ){
			this.subscription.unsubscribe();
			this.subscription = undefined;
		}
	}
}

define( 'search-bar', SearchBar );
