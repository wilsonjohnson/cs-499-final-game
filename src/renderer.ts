import { ActionRegistry, Action } from './actions';
import { KeyHandler } from './keyboard';
import './button';
import './search-bar';
import * as PIXI from 'pixi.js';
import { ipcRenderer, remote, ipcMain } from "electron";
import { getKeyboard } from "./keyboard";
import { Body, World, Vec2, Box, BodyType, Fixture, Shape, Edge, ShapeType } from 'planck-js';
import { Point, Graphics, Text, TextStyle } from 'pixi.js';
import { PhysicsGraphics, scaleVec2, Line, PixiPlanck, LineStyle, Scaling, PhysicsContainer } from './physics';


const PIXELS_TO_METERS = 10;
const scaling: Scaling = new Scaling( PIXELS_TO_METERS );



(<any>window).mymagicevent = (data)=>{
	ipcMain.emit('event-from-web', data);
};




class Round {
	static to( number: number, places: number ) {
		return +(Math.round( <any>( number + "e+" + places ) )  + "e-" + places);
	}

	static ceil( number: number, places: number ) {
		return +(Math.ceil( <any>( number + "e+" + places ) )  + "e-" + places);
	}

	static floor( number: number, places: number ) {
		return +(Math.floor( <any>( number + "e+" + places ) )  + "e-" + places);
	}
}

let pingTime;
ipcRenderer.send( 'ping', pingTime = performance.now() );

ipcRenderer.on( 'message', function(){
	console.log( ...arguments );
});

ipcRenderer.on( 'ping', ( sender, data ) => {
	let now = performance.now() - pingTime;
	console.log( `Sent time: ${ data }`);
	console.log( `Curr time: ${ now }`);
	console.log( `Ping time: ${ now - data }`);
});

let world = new World( { 
	gravity: new Vec2( 0, 9.81),
	continuousPhysics: true,
	warmStarting: true,
	blockSolve: true
} );

// world.setAutoClearForces( false );

const width = window.innerWidth;
const height = window.innerHeight;

let app = new PIXI.Application();

let { stage, screen, view, renderer } = app;

document.body.appendChild( view );

const scale = new Vec2( 0.5, 0.5 );

const edge = new Edge( 
	new Vec2( -width / 4,  5 ).mul( 1 / PIXELS_TO_METERS ),
	new Vec2(  width / 4, -5 ).mul( 1 / PIXELS_TO_METERS ) );

let line = new PhysicsGraphics( PIXELS_TO_METERS, world, 'static', 'center', edge, true );

const pixiPlanck = new PixiPlanck( PIXELS_TO_METERS, world );

let lineStyle: LineStyle = {
	lineWidth: 1, 
	color: 0xAABBCC 
};

let line2 = pixiPlanck.static.createLine( { x:0, y:window.innerHeight - 100 }, { x:window.innerWidth/2, y:window.innerHeight }, lineStyle );
let wallLeft = pixiPlanck.static.createLine( { x: 0, y: 0 }, { x: 0, y: window.innerHeight }, lineStyle );
let wallRight = pixiPlanck.static.createLine( { x: window.innerWidth, y: 0 }, { x: window.innerWidth, y: window.innerHeight }, lineStyle );
let ceiling = pixiPlanck.static.createLine( { x: 0, y: 0 }, { x: window.innerWidth, y: 0 }, lineStyle );

let platform = pixiPlanck.kinematic.createLine( { x: 200, y: 200 }, { x: 260, y: 200 }, {...lineStyle, color: 0x9999CC } );

let extra = pixiPlanck.dynamic.createBox( 10, 10, { x: 10, y: 10 }, { color: 0xEECCDD } );

world.on( 'begin-contact', contact => {
	let fixtureA = contact.getFixtureA();
	let fixtureB = contact.getFixtureB();
	if ( fixtureA.getType() == 'polygon' && fixtureB.getType() === 'polygon'){
		console.log( fixtureA.getBody(), fixtureB.getBody() );
	}

	// contact.storeConstraintImpulses();
	// contact.initVelocityConstraint({ blockSolve: true });
	// contact.solveVelocityConstraint({ blockSolve: true });
});
// world.on( 'end-contact', contact => console.log( contact ) );
// world.on( 'post-solve', contact => console.log( contact ) );
// world.on( 'pre-solve', contact => console.log( contact ) );

let i = 0;
let original = { width, height };
window.addEventListener( 'resize', ( event ) => {
	
	const width = window.innerWidth;
	const height = window.innerHeight;
	renderer.resize( width, height );
	stage.scale.set( width / original.width , height / original.height );
} );

// set a fill and line style
// graphics.beginFill(0xFF3300);
// graphics.lineStyle(10, 0xffd900, 1);


// // draw a shape
// graphics.drawRect(0,0, 20, 20);
// graphics.endFill();

// graphics.setCollision();

let graphics = pixiPlanck.dynamic.createBox( 20, 10, { x: 10, y: 10 }, { color: 0xFF3300 }, { color: 0xffd900, lineWidth: 5, alpha: 1 } );
let anchor = scaling.pixiToPlanck( { x: 0, y: -10 } );
let joint = graphics.join( extra ).revolute( {
	localAnchorA: anchor,
	localAnchorB: Vec2.zero(),
	referenceAngle: 0,
} );

console.log( joint );

let floor = pixiPlanck.static.createBox( window.innerWidth, 10, { x: window.innerWidth / 2, y: window.innerHeight - 5 }, { color: 0xAABBCC });

floor.fixture.setFriction( 0.01 );

line.beginFill( 0, 0 );
line.lineStyle( 10, 0xAABBCC );
line.moveTo( 0, 0 );
line.lineTo( width / 2, -10 );
line.setCollision();
line.translateTo( width / 2, height - 20 );


// floor.translateTo( window.innerWidth / 2, window.innerHeight - floor.height / 2 );

(() => {
	const { x, y, width, height } = graphics
	console.log( { x, y, width, height } );
})();

const pivot = graphics.pivot;
graphics.translateTo( pivot.x, pivot.y );

graphics.lineStyle(2, 0xb9d9f0, 1);
graphics.drawCircle( pivot.x, pivot.y, 10 );

const debugStyle = new TextStyle({
	fill: 'white',
	stroke: 'white',
	fontSize: 12
});
const debug1 = new Text('', debugStyle);
const debug2 = new Text('', debugStyle);
const debug3 = new Text('', debugStyle);
debug2.x += 12 * 15;
debug3.x += 12 * 30;

let wheel1 = pixiPlanck.dynamic.createCircle( 5, { x: 5, y: 5 }, { color: 0x234567 } );
let wheel2 = pixiPlanck.dynamic.createCircle( 5, { x: 5, y: 5 }, { color: 0x234567 } );

let wheelJoint1 = wheel1.join( graphics ).revolute( {
	localAnchorA: Vec2.zero(),
	localAnchorB: scaling.pixiToPlanck( { x: 10, y:13 } ),
	referenceAngle: 0
} );

let wheelJoint2 = wheel2.join( graphics ).revolute( {
	localAnchorA: Vec2.zero(),
	localAnchorB: scaling.pixiToPlanck( { x: -10, y:13 } ),
	referenceAngle: 0
} );


let children = [
	graphics,
	floor,
	debug1,
	debug2,
	debug3,
	line,
	line2,
	wallLeft,
	wallRight,
	ceiling,
	extra,
	wheel1,
	wheel2,
	platform
];

stage.addChild( ...children );

let physicsContainer = new PhysicsContainer();

physicsContainer.addChildren( graphics, extra, wheel1, wheel2, platform );

let up = scaling.pixiToPlanck( {x: 0,y: -20} );
let down = scaling.pixiToPlanck( {x: 0,y: 20} );
platform.body.setUserData({
	moveDown() { 
		platform.body.setLinearVelocity( down );
	},
	moveUp(){
		platform.body.setLinearVelocity( up );
	}
});

(<any>platform.body.getUserData()).moveDown();

let DEGREE = Math.PI / 180;

let keyboard = getKeyboard();

let keyW = keyboard.onKey('KeyW');
let keyA = keyboard.onKey('KeyA');
let keyS = keyboard.onKey('KeyS');
let keyD = keyboard.onKey('KeyD');
let keyE = keyboard.onKey('KeyE');
let keyQ = keyboard.onKey('KeyQ');

// window.addEventListener( 'keydown', event => {
// 	if ( !event.repeat ) {
// 		console.log( event.code );
// 	}
// });

ActionRegistry.instance().register( new Action( 'dothing', ( a, b ) => {} ) );

keyA.down( event => {
	// graphics.vxNeg = 1;
	// graphics.applyVelocity( new Vec2( -20000, 0 ) );
	const velocityComponent = -20;
	const force = new Vec2( graphics.body.getMass() * velocityComponent, 0 );
	graphics.setForce( 'KeyA', force );
});

keyA.up( event => {
	// graphics.vxNeg = 0;
	// graphics.applyVelocity( new Vec2( 20000, 0 ) );
	
	graphics.clearForce( 'KeyA' );
});

keyD.down( event => {
	// graphics.vxPos = 1;
	const velocityComponent = 20;
	const force = new Vec2( graphics.body.getMass() * velocityComponent, 0 );
	graphics.setForce( 'KeyD', force );
});

keyD.up( event => {
	// graphics.vxPos = 0;
	graphics.clearForce( 'KeyD' );
});

keyW.down( event => {
	const impulse = new Vec2( 0, -10 * graphics.body.getMass());
	graphics.body.applyLinearImpulse( impulse, graphics.body.getWorldCenter(), true );
	// graphics.body.getLinearVelocity().add( new Vec2( 0, -60000 ) );
});

keyW.up( event => {
	// graphics.vyNeg = 0;
});

keyS.down( event => {
	const impulse = new Vec2(0, 80 * graphics.body.getMass());
	graphics.body.applyLinearImpulse( impulse, graphics.body.getWorldCenter(), true );
});

keyS.up( event => {

});

keyQ.down( event => {
	const impulse = -10 * graphics.body.getMass();
	graphics.body.applyAngularImpulse( impulse, true );
});

keyE.down( event => {
	const impulse = 10 * graphics.body.getMass();
	graphics.body.applyAngularImpulse( impulse, true );
});

function attempt( fun: Function, msg?: string ) {
	try {
		fun();
	} catch ( e ) {
		console.log( msg );
		console.error( e );
	}
}

let b = new Vec2( 1, 2 );
let s = new Vec2( 2, 2 );

scaleVec2( b, s );

function getBodyData( item: PhysicsGraphics ) {
	const position = item.body.getPosition().clone();
	position.set( Round.to( position.x, 4 ), Round.to( position.y, 4 ) );
	const velocity = item.body.getLinearVelocity().clone();
	velocity.set( Round.to( velocity.x, 4 ), Round.to( velocity.y, 4 ) );
	const inertia = item.body.getInertia();
	const angular = Round.to( item.body.getAngularVelocity(), 4 );
	const type = item.body.getType();
	const awake = item.body.isAwake();
	return { position, velocity, inertia, angular, type, awake };
}

app.ticker.add( delta => {
	// graphics.rotation += DEGREE * delta;
	let position = platform.body.getPosition();
	if( position.y * PIXELS_TO_METERS > 500 ) {
		(<any>platform.body.getUserData()).moveUp();
	} else if ( position.y * PIXELS_TO_METERS < 200 ) {
		(<any>platform.body.getUserData()).moveDown();
	}
	const box = getBodyData( graphics );
	const other = getBodyData( extra );
	const lineData = { position: line.body.getPosition() };
	const line2Data = { position: line2.body.getPosition() };
	debug1.text = `
box: ${ JSON.stringify( box, null, '\t' )}
`.trimLeft();
	debug2.text = `
line: ${ JSON.stringify( lineData, null, '\t' ) }
`.trimLeft();
	debug2.text = `
other: ${ JSON.stringify( other, null, '\t' )}
`.trimLeft();
	debug3.text = `
line2: ${ JSON.stringify( line2Data, null, '\t' )}
`.trimLeft();
});

app.ticker.add( delta => world.step( 1/60, delta) );
app.ticker.add( delta => physicsContainer.tick( delta ) );

(<any>window).Vec2 = Vec2;
(<any>window).scaleVec2 = scaleVec2;
(<any>window).Line = Line;

