import { Named } from "./registry";
import { Graphics, DisplayObject, Container } from "pixi.js";
import { ActionRegistry } from "./actions";
import { Body } from "planck-js";

export interface EntityOptions {
	image?: string;

}

class Entity implements Named {
	public supports: {
		[ key: string ]: boolean;
	} = {};
	constructor(
		public name: string,
	) {
	}
	
}

class DrawableEntity extends Entity {
	private _container: Container;

	constructor(
		public name: string,
	) {
		super( name );
		this.supports.draw = true;
	}

	public get container(): Container {
		return this._container;
	}
}

class CollidableEntity extends Entity {
	private _body: Body;

	
}
