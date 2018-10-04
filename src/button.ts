import { define, Shadow, init, OPEN, OnConnected, OnDisonnected } from "./shadow";
import { Observable, fromEvent, Subscription } from "rxjs";

export class Button extends Shadow implements OnConnected, OnDisonnected {
	private button: HTMLInputElement;
	private _click: Observable<MouseEvent>;
	private subscription: Subscription;
	private clickEvent: CustomEvent;
	constructor() {
		super( init( OPEN ) );

		this.button = document.createElement('input');
		this.button.type = 'button';

		this.shadow.appendChild( this.button );

		this._click = < Observable <MouseEvent> > fromEvent( this.button, 'click' );

		this.clickEvent = new CustomEvent('(click)');
	}

	public get whenClick( ): Observable< MouseEvent > {
		return this._click;
	}

	public connectedCallback() {
		const label = this.getAttribute( 'label' );
		console.log( label );
		this.button.value = label;
		const onclick = this.onclick;
		this.subscription = this.outputClick( this.whenClick );
	}

	static get observedAttributes() { return ['(click)']; }

	attributeChangedCallback( a: any, b: any, c: any ){
		console.log( a, b, c );
	}

	public disconnectedCallback() {
		if( this.subscription ) {
			this.subscription.unsubscribe();
			this.subscription = undefined;
		}
	}

	public set label( value: string ) {
		this.button.value = value;
	}

	public get label(): string {
		return this.button.value;
	}
}

define( 'my-button', Button );
