import { Registry, Named } from "./registry";

export type Interaction = ( source: any, target: any, ...parameters: any[] ) => void;
export type BoundAction = ( ...parameters: any[] ) => void;

export class Action implements Named {
	constructor(
		public name: string,
		private action: Interaction,
	){ }

	public perform( source: any, target: any, ...parameters: any[] ) {
		this.action( source, target, ...parameters );
	}
}

export class ActionRegistry extends Registry< Action > {
	private actions: Map< string, Action > = new Map< string, Action >();
	private constructor() {
		super( 'action' );
	}
	private static _instance: ActionRegistry = new ActionRegistry();
	public static instance() {
		return ActionRegistry._instance;
	}

	public static find( action: string ): Action {
		return ActionRegistry.instance().get( name );
	}
}