import { Subscription, Observable } from "rxjs";

type InitMode = 'open' | 'closed';

export const OPEN: InitMode = 'open';
export const CLOSED: InitMode = 'closed';

export interface OnConnected {
	connectedCallback(): void;
}

export interface OnDisonnected {
	disconnectedCallback(): void;
}

export function init( value: InitMode, delegatesFocus?: boolean ): ShadowRootInit {
	let init: ShadowRootInit = { mode: value };
	if( typeof delegatesFocus === 'boolean' ) {
		return Object.assign( init, { delegatesFocus: delegatesFocus } );
	} else {
		return init;	
	}
}

export function define( name: string, constructor: Function, options?: ElementDefinitionOptions ) {
	console.log(`Checking for ${ name }`);
	if ( !customElements.get( name ) ) {
		console.log(`Initializing ${ name }`);
		customElements.define( name, constructor, options );
	}
}

export class Shadow extends HTMLElement {
	private _shadow: ShadowRoot;
	constructor( shadowRootInit: ShadowRootInit ) {
		super();

		this._shadow = this.attachShadow( shadowRootInit );
	}

	protected get shadow(): ShadowRoot {
		return this._shadow;
	}

	protected outputClick( observable: Observable< any > ): Subscription {
		const onclick = this.onclick;
		this.onclick = undefined;
		if( onclick ) {
			return observable.subscribe( event => onclick.call( this, event ) );
		}
		return undefined;
	}
}
