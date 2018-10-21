import { Graphics, Point, ObservablePoint } from "pixi.js";
import { Fixture, Vec2, Mat22, World, Body, BodyType, Shape, Box, Transform, Edge, PrismaticJoint, WeldJoint, WeldJointOpt, WeldJointDef, Polygon, RevoluteJoint, RevoluteJointOpt, RevoluteJointDef, Circle } from "planck-js";

class MovableGraphics extends Graphics {

	constructor( nativeLines?: boolean ){
		super( nativeLines );
	}

	public tick( delta: number ) {
		// this.x += this.vx * delta;
		// this.y += this.vy * delta;
	}

	public moveTo( x: number, y: number ): Graphics {
		return super.moveTo( x, y );
	}
}

class Globals {
	public static G = 9.81;
}

export class PhysicsGraphics extends MovableGraphics {
	private _body?: Body;
	private _fixture?: Fixture;

	private velocity?: Vec2;

	private forces: { [key: string]: Vec2 } = {};

	constructor(
		private physicsScale: number,
		private world: World,
		type: BodyType,
		private pivotMode: 'center' | 'top-left',
		private physicsShape?: Shape,
		nativeLines?: boolean 
	) {
		super( nativeLines );
		if ( typeof world !== 'undefined' ) {
			this._body = world.createBody({
				type: type,
			});
			this.translateTo( this.x, this.y );
		}
	}

	public get center(): Point {
		const pivot = new Point();
		pivot.copy( this.pivot );
		const bounds = this.getBounds();
		pivot.set( ( bounds.width ) / 2 + bounds.x, ( bounds.height ) / 2 + bounds.y );
		return pivot;
	}

	public get centerVec2(): Vec2 {
		return pointToVec2( this.center );
	}

	public updatePivot() {
		const bounds = this.getBounds();
		this.pivot.set( ( bounds.width ) / 2 + bounds.x, ( bounds.height ) / 2 + bounds.y );
		this.translateTo( this.x + ( bounds.width ) / 2, this.y + ( bounds.height ) / 2 );
	}

	private pixiToPlanck( vec2: Vec2 ): Vec2;
	private pixiToPlanck( x: number, y:number ): Vec2;
	private pixiToPlanck( x: number | Vec2, y?:number ): Vec2 {
		if ( x instanceof Vec2 ) {
			return x.mul( 1 / this.physicsScale );
		} else {
			[ x, y ] = [ x, y ].map( e => e / this.physicsScale ); 
			return new Vec2( x , y );
		}
	}

	private planckToPIXI(): Point {
		const point = this.body.getPosition().clone().mul( this.physicsScale );
		return new Point( point.x, point.y );
	}

	public setCollision() {
		if ( this._fixture ) {
			this.body.destroyFixture( this._fixture );
		}
		
		this.updatePivot();

		const bounds = this.getBounds();

		let pivot = this.center;
		// if( this.pivotMode === 'top-left' ) {
		// 	this.pivot = new Point( 0, 0 );
		// }
		let shape: Shape;
		if( ! this.physicsShape ) {
			const physicsBounds = this.pixiToPlanck( bounds.width / 2, bounds.height / 2 );
			shape = new Box( physicsBounds.x, physicsBounds.y, new Vec2( 0, 0 ) );
		} else {
			shape = this.physicsShape;
		}

		console.log( this );

		if( !this.body.isStatic ) {
			this.body.setMassData( {
				mass : 1,
				center : Vec2.zero(),
				I : 0.1,
			});
		}

		this.body.setPosition( scaleVec2( pointToVec2( this.position ), new Vec2( 1/this.physicsScale, 1/this.physicsScale ) ) );

		this._fixture = this.body.createFixture( shape, {
			density: 1,
			userData: 'Graphics'
		} );
	}

	public moveTo( x: number, y: number ){
		return super.moveTo( x, y );
	}

	public translateTo( x: number, y: number ) {
		this.body.setPosition( this.pixiToPlanck( x, y ) );
		this.x = x;
		this.y = y;
		return this;
	}

	public get body(): Body {
		return this._body;
	}

	public get fixture(): Fixture {
		return this._fixture;
	}

	public setForce( key: string, force: Vec2 ) {
		this.forces[key] = force;
	}
	
	public clearForce( key: string ) {
		this.forces[key].setZero();
		delete this.forces[ key ];
	}

	public tick( delta: number ) {
		
		if( this._fixture ) {
			const forces = Object.values( this.forces );
			if (  forces.length > 0 ) {
				let force = forces.reduce( Vec2.add, Vec2.zero());
				force = force.mul( delta );
				this.body.applyForceToCenter( force, true );
			}
			const position = this.body.getPosition();
			this.position.copy( this.planckToPIXI() );
			const angle = this.body.getAngle();
			this.rotation = angle;
			// this.body.getLinearVelocity().add( this.velocity );
		}
	}

	public get awake(): boolean {
		return this.body.isAwake();
	}

	public join( other: PhysicsGraphics ): Joiner;
	public join( other: Body ): Joiner;
	public join( o: PhysicsGraphics | Body ): Joiner {
		if ( o instanceof PhysicsGraphics ) {
			return new Joiner( this.world, this.body, o.body );
		} else {
			return new Joiner( this.world, this.body, o );
		}
	}
}

export class PhysicsContainer {

	private children: Graphics[] = [];

	constructor() {
	}

	public addChildren( ...children: Graphics[] ) {
		this.children.push( ...children );
	}

	public tick( delta: number ) {
		this.children.filter( ( child: any ) => child.awake && child.tick )
			.forEach( ( child: PhysicsGraphics ) => child.tick( delta ) ); 
	}
}

export interface JointSetup {
	localAnchorA: Vec2;
	localAnchorB: Vec2;
	collideConnected?: boolean;
}

export interface WeldJointSetup extends JointSetup {
	dampingRatio?: number;
	frequencyHz?: number;
	referenceAngle?: number;
	userData?: any;
}

export interface RevoluteJointSetup extends JointSetup {
	referenceAngle: number;
	collideConnected?: boolean,
	enableMotor?: boolean,
	lowerAngle?: number,
	maxMotorTorque?: number,
	motorSpeed?: number,
	upperAngle?: number,
	enableLimit?: boolean
}

class Joiner {
	private joined = false;
	constructor(
		private world: World,
		private parent: Body,
		private child: Body
	) {
	}

	private assertJoinable() {
		if ( this.joined ) {
			throw new Error( 'Joiner has already defined a joint' );
		}
	}

	public weld( options: WeldJointSetup ): WeldJoint;
	public weld( options: WeldJointOpt, anchor: Vec2 ): WeldJoint;
	public weld( options: WeldJointOpt | WeldJointSetup, anchor?: Vec2 ): WeldJoint {
		this.assertJoinable();
		let joint: WeldJoint;
		if ( typeof anchor === 'undefined' ) {
			let definition: WeldJointDef = {
				...< WeldJointSetup >options,
				bodyA: this.parent,
				bodyB: this.child
			}
			joint = new WeldJoint( definition );
		} else {
			joint = new WeldJoint( options, this.parent, this.child, anchor );
		}

		joint = this.world.createJoint( joint );
		
		this.joined = true;

		return joint;
	}

	public revolute( options: RevoluteJointSetup ): RevoluteJoint;
	public revolute( options: RevoluteJointOpt, anchor: Vec2 ): RevoluteJoint;
	public revolute( options: RevoluteJointOpt | RevoluteJointSetup, anchor?: Vec2 ): RevoluteJoint {
		this.assertJoinable();
		let joint: RevoluteJoint;
		if ( typeof anchor === 'undefined' ) {
			const definition: RevoluteJointDef = {
				...< RevoluteJointSetup >options,
				bodyA: this.parent,
				bodyB: this.child
			}
			joint = new RevoluteJoint( definition );
		} else {
			joint = new RevoluteJoint( options, this.parent, this.child, anchor );
		}

		joint = this.world.createJoint( joint );

		this.joined = true;

		return joint;
	}
}

export type Coordinate = { x: number, y: number };

function isCoordinate( value: any ): value is Coordinate {
	return value.hasOwnProperty('x') && value.hasOwnProperty('y');
}

function isVec2( value: any ): value is Vec2 {
	return value instanceof Vec2;
}

function exists<T>( value: T ): value is T {
	return typeof value !== 'undefined';
}

export interface LineStyle {
	lineWidth?: number,
	color?: number,
	alpha?: number,
	alignment?: number
}

export interface FillStyle {
	color: number,
	alpha?: number
}

export class Scaling {
	private planckRatio: number;
	constructor(
		private scale: number,
	){
		this.planckRatio = 1 / scale;
	}

	public pixiToPlanck( { x, y }: Vec2 | Point | Coordinate ) {
		return this.scalingFunction( x, y, this.planckRatio );
	}

	public planckToPixi( { x, y }: Vec2 | Point | Coordinate ) {
		return this.scalingFunction( x, y, this.scale );
	}

	private scalingFunction( x: number, y: number, scale: number ){
		return new Vec2( scale * x, scale * y );
	}
}

export class PixiPlanck {

	private static instance: PixiPlanck;

	constructor(
		private scale: number,
		private world: World,
	) {

	}

	public get static(): PixiPlankCreator<'static'> {
		return new PixiPlankCreator( this.scale, this.world, 'static' );
	}

	public get dynamic(): PixiPlankCreator<'dynamic'> {
		return new PixiPlankCreator( this.scale, this.world, 'dynamic' );
	}

	public get kinematic(): PixiPlankCreator<'kinematic'> {
		return new PixiPlankCreator( this.scale, this.world, 'kinematic' );
	}
}

class PixiPlankCreator <T extends BodyType> {
	private planckScale: number;
	constructor(
		private scale: number,
		private world: World,
		private type: T
	) {
		this.planckScale = 1 / this.scale;
	}
	

	public createLine( start: Vec2, end: Vec2 ): PhysicsGraphics;
	public createLine( start: Point, end: Point ): PhysicsGraphics;
	public createLine( start: Coordinate, end: Coordinate ): PhysicsGraphics;
	public createLine( start: Vec2, end: Vec2, lineStyle: LineStyle ): PhysicsGraphics;
	public createLine( start: Point, end: Point, lineStyle: LineStyle ): PhysicsGraphics;
	public createLine( start: Coordinate, end: Coordinate, lineStyle: LineStyle ): PhysicsGraphics;
	public createLine( start: Coordinate | Vec2 | Point, end: Coordinate | Vec2 | Point, lineStyle?: LineStyle ): PhysicsGraphics {
		//#region type-checking
		let startVec2: Vec2;
		let endVec2: Vec2;
		if( !isVec2( start ) ) {
			startVec2 = new Vec2( start.x, start.y );
		} else {
			startVec2 = new Vec2( start );
		}
		if( !isVec2( end ) ) {
			endVec2 = new Vec2( end.x, end.y );
		} else {
			endVec2 = new Vec2( end );
		}
		//#endregion type-checking

		// Create a new Line with the passed in coordinates
		const line = new Line( startVec2, endVec2 );

		// Clone and scale line to the plank version
		const planckLine = line.clone().centerAtOrigin().scale( this.planckScale );

		// Create the planck Edge object using the scaled line
		let edge = new Edge( planckLine.start, planckLine.end );

		// Create the physics body
		let graphics = new PhysicsGraphics( this.scale, this.world, this.type, 'center', edge );

		// Create a centered line for rendering
		const origin = line.clone().centerAtOrigin();

		// Apply stylings for renderer
		if( lineStyle ) {
			graphics.lineStyle( 
				lineStyle.lineWidth,
				lineStyle.color,
				lineStyle.alpha,
				lineStyle.alignment
			);
		}

		// Move the graphics start point for the draw call
		graphics.moveTo( origin.start.x, origin.start.y );
		// Draw a line to the endpoint
		graphics.lineTo( origin.end.x, origin.end.y );

		// Instantiate the collision object
		graphics.setCollision();

		// Translate to the center
		graphics.translateTo( line.midpoint.x, line.midpoint.y );

		return graphics;
	}

	public createBox( width: number, height: number, position: Coordinate | Vec2 | Point, fillStyle?: FillStyle, lineStyle?: LineStyle ): PhysicsGraphics;
	public createBox( width: number, height: number, { x, y }: Coordinate | Vec2 | Point, fillStyle?: FillStyle, lineStyle?: LineStyle ): PhysicsGraphics {
		
		let padding = lineStyle && lineStyle.lineWidth ? lineStyle.lineWidth : 0;

		let halfScale = ( this.scale * 2 );

		let box = new Box( ( width + padding ) / halfScale, ( height + padding ) / halfScale, Vec2.zero() );

		let graphics = this.setupGraphics( box, fillStyle, lineStyle );

		graphics.drawRect( 0, 0, width, height );

		return this.finishGraphics( graphics, x, y, fillStyle );
	}

	public createCircle( radius: number, { x, y }: Coordinate | Vec2 | Point, fillStyle?: FillStyle, lineStyle?: LineStyle ): PhysicsGraphics {
		let padding = lineStyle && lineStyle.lineWidth ? lineStyle.lineWidth / 2 : 0;

		let circle = new Circle( ( radius + padding ) / this.scale );
		let graphics = this.setupGraphics( circle, fillStyle, lineStyle );

		graphics.drawCircle( 0, 0, radius );

		return this.finishGraphics( graphics, x, y, fillStyle );
	}

	private setupGraphics( shape: Shape, fillStyle?: FillStyle, lineStyle?: LineStyle ): PhysicsGraphics {
		let graphics = new PhysicsGraphics( this.scale, this.world, this.type, 'center', shape );
		if ( lineStyle ) {
			graphics.lineStyle( 
				lineStyle.lineWidth,
				lineStyle.color,
				lineStyle.alpha,
				lineStyle.alignment
			);
		}
		if ( fillStyle ) {
			graphics.beginFill( fillStyle.color, fillStyle.alpha );
		}
		return graphics;
	}

	private finishGraphics( graphics: PhysicsGraphics, x: number, y: number, fillStyle?: FillStyle ): PhysicsGraphics {
		if ( fillStyle ) {
			graphics.endFill();
		}
		graphics.setCollision();


		if ( typeof x !== 'undefined' && typeof y !== 'undefined' ) {
			graphics.translateTo( x, y );
		}
		return graphics;
	}
}

export class Line {
	private _start: Vec2;
	private _end: Vec2;
	private _midpoint: Vec2;
	constructor(
		start: Vec2,
		end: Vec2
	) {
		this._start = new Vec2( start.x , start.y );
		this._end = new Vec2( end.x, end.y );
	}

	public get start(): Vec2 {
		return this._start;
	}

	public get end(): Vec2 {
		return this._end;
	}

	public get midpoint(): Vec2 {
		if ( !this._midpoint ) {
			this._midpoint = this._start.clone().add( this._end ).mul( 0.5 );
		}
		return this._midpoint.clone();
	}

	public startAtOrigin( ): Line {
		const translation = Vec2.zero().sub( this.start );
		return this.translate( translation );
	}

	public translate( translation: Vec2 ): Line;
	public translate( x: number, y: number ): Line;
	public translate( translation: Vec2 | number, y?: number ): Line {
		if ( !isVec2( translation ) ){
			if ( typeof y === 'undefined' ) {
				y = NaN;
			}
			translation = new Vec2( translation, y );
		}
		this.start.add( translation );
		this.end.add( translation );
		if( this._midpoint ) {
			this._midpoint.add( translation );
		}
		return this;
	}

	/**
	 * Scale the line around a specified point, or in place
	 */
	public scale( scale: Vec2, center: Vec2 ): Line;
	public scale( scale: Vec2 ): Line;
	public scale( mult: number, center: Vec2 ): Line;
	public scale( mult: number ): Line;
	public scale( scale: Vec2, x: number, y: number ): Line;
	public scale( mult: number, x: number, y: number ): Line;
	public scale( scaleX: number, scaleY: number ): Line;
	public scale( scaleX: number, scaleY: number, x: number, y: number ): Line;
	public scale( a: Vec2 | number, b?: Vec2 | number, x?: number, y?: number): Line{
		//#region type-checking
		const existance = {
			b: exists(b),
			x: exists(x),
			y: exists(y)
		};

		const vector = {
			a: isVec2(a),
			b: isVec2(b)
		}
		
		// ( number, number, number ) => ( number, _, number, number )
		if( !vector.a && !vector.b && existance.b && existance.x && !existance.y ) {
			y = x;
			x = <number> b;
			b = undefined;
			existance.b = false;
			existance.y = true;
		}

		// ( number ) => ( number, number )
		// ( number, _, number, number ) => ( number, number, number, number )
		if( !vector.a && !existance.b ) {
			b = a;
			existance.b = true;
		} else if ( !vector.a && vector.b ) { // ( number, Vec2 ) => ( Vec2, Vec2 )
			a = new Vec2( <number> a, <number> a);
			vector.a = true;
		} 

		// ( number, number ) => ( Vec2 )
		// ( number, number, number, number ) => ( Vec2, number, number )
		if( !vector.a && !vector.b && existance.b ) {
			a = new Vec2( <number> a, <number> b );
			if( existance.x && existance.y ) {
				b = x;
				x = y;
				y = undefined;
				existance.y = false;
			} else {
				b = undefined;
				existance.b = false;
			}
			vector.a = true;
		}

		// ( Vec2, number, number ) => ( Vec2, Vec2 )
		if( vector.a && existance.b && existance.x ) {
			b = new Vec2( <number> b, x );
			x = undefined;
			existance.x = false;
			vector.b = true;
		}

		// ( Vec2 ) => ( Vec2, Vec2 )
		if ( !isVec2( b ) ) {
			b = this.midpoint;
		} else {
			delete this._midpoint;
		}

		//#endregion type-checking

		// ( Vec2, Vec2 ) => Line
		if( isVec2( a ) ) {
			// check to see if midpoint exists
			const wasMidpoint = typeof this._midpoint !== 'undefined';
			// check to see if midpoint is the same as the world-origin
			if ( Vec2.areEqual( this.midpoint, Vec2.zero() ) ) {
				
				this.start.set( scaleVec2( this.start, a ) );
				this.end.set( scaleVec2( this.end, a ) );
				
				return this; // keep midpoint, as it is still [ 0, 0 ]
			} else if ( wasMidpoint ) { // Remove midpoint as it might become invalid
				delete this._midpoint;
			} 
			// translate line centered on origin, save the translation
			const translation = Vec2.zero().sub( b );
			this.translate( translation );
			// scale line
			this.start.set( scaleVec2( this.start, a ) );
			this.end.set( scaleVec2( this.end, a ) );
			// move back to original position
			this.translate( translation.neg() );
		}

		return this;
	}

	public centerAtOrigin( ): Line {
		const translation = Vec2.zero().sub( this.midpoint );
		return this.translate( translation );
	}

	/**
	 * return a deep copy of this Line
	 */
	public clone(): Line {
		const clone = new Line(
			this.start.clone(),
			this.end.clone()
		)
		if ( this._midpoint ) {
			clone._midpoint = this._midpoint.clone();
		}
		return clone;
	}
}

function vec2ToPoint( vector: Vec2 ) {
	return new Point( vector.x, vector.y );
}

function pointToVec2( { x, y }: Point | ObservablePoint ) {
	return new Vec2( x, y );
}

/**
 * Scale the x and y parts of the vector by the x and y parts of the scale vector respectively<br/>
 * This is the same as scaling a vector by a transformation matrix:
 * <pre>
 * [ scale.x,       0 ] [ x ]   [ scale.x * x ]
 * [       0, scale.y ] [ y ] = [ scale.y * y ]
 * </pre>
 * @param vector 
 * @param scale 
 */
export function scaleVec2( vector: Vec2, scale: Vec2 ) {
	let transform = new Mat22( scale.x, 0, 0 , scale.y );
	return Mat22.mul( transform, vector );
	// return vector.clone().c
}
