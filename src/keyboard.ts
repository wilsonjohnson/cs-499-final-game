import { fromEvent, Observable, Subscription, merge } from "rxjs";
import { takeWhile, filter, tap, distinctUntilKeyChanged, groupBy, map, distinctUntilChanged, mergeAll, mergeMap } from "rxjs/operators";
import { FromEventTarget, HasEventTargetAddRemove } from "rxjs/internal/observable/fromEvent";

let instance: ModuleKeyboard;

type KeyEventHandler = ( event: KeyboardEvent ) => void;

class ModuleKeyHandler {
	private open = true;
	private _isDown = false;
	constructor(
		private key: string,
		private keyObservable: Observable< KeyboardEvent >,
	) {	}

	public close() {
		this.open = false;
	}

	private setIsDown( value: boolean ) {
		return () => {
			this._isDown = value;
		};
	}

	public get isDown() {
		return this._isDown;
	}

	public get up(): ( handler: KeyEventHandler ) => Subscription {
		return ( handler: KeyEventHandler ) => 
			this.keyObservable.pipe(
					filter( ( value ) => value.type === 'keyup' ),
					filter( ( value ) => value.code === this.key ),
					takeWhile( () => this.open ),
					tap( this.setIsDown( false ) ),
				).subscribe( handler );
	}

	public get down(): ( handler: KeyEventHandler ) => Subscription {
		return ( handler: KeyEventHandler ) => 
			this.keyObservable.pipe(
					filter( ( value ) => value.type === 'keydown' ),
					filter( ( value ) => value.code === this.key ),
					takeWhile( () => this.open ),
					tap( this.setIsDown( true ) ),
				).subscribe( handler );
	}
}

class ModuleKeyboard {
	private keyObservable: Observable< KeyboardEvent >;
	private keyCache: { [key:string]: KeyHandler } = {};

	constructor() {
		this.keyObservable = merge(
			( <Observable< KeyboardEvent >> fromEvent( window, 'keydown' ) ),
			( <Observable< KeyboardEvent >> fromEvent( window, 'keyup' ) )
		).pipe(
			filter( event => !event.repeat ),
		);
	}

	public onKey( code: string ): KeyHandler {
		if ( typeof this.keyCache[ code ] === 'undefined' ) {
			this.keyCache[ code ] = new ModuleKeyHandler( code, this.keyObservable );
		}
		return this.keyCache[ code ];
	}
}

export interface Keyboard extends ModuleKeyboard {}
export interface KeyHandler extends ModuleKeyHandler {}

export function getKeyboard(): Keyboard{
	if ( typeof instance === 'undefined' ) {
		instance = new ModuleKeyboard();
	}
	return instance;
}