export interface Named {
	name: string;
}

class ModuleRegistration < TYPE extends Named > {
	private _path: string;
	constructor(
		private registry: Registry< TYPE >,
		private name: string
	) {
		this._path = `${registry.name}:${name}`;
	}

	public get path() {
		return this._path;
	}
}

export interface Registration< TYPE extends Named > extends ModuleRegistration< TYPE > {}

export class Registry< TYPE extends Named > implements Named {
	protected data: Map< string, TYPE > = new Map< string, TYPE >();
	protected constructor(
		public name: string
	) {}

	public register( item: TYPE ): Registration< TYPE > {
		this.data.set( item.name, item );
		return new ModuleRegistration( this, item.name );
	}

	public remove( name: string ): Registry< TYPE > {
		this.data.delete( name );
		return this;
	}

	public get( name: string ): TYPE {
		return this.data.get( name );
	}
}
