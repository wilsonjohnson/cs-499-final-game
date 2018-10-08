// Type definitions for planck-js 0.1.45
// Project: http://piqnt.com/planck.js/
// Definitions by: Oliver Zell <https://github.com/zOadT>
// TypeScript Version: 3.0
import 'planck-js';

// Types
declare module 'planck-js';

//TODO
export type BroadPhase = any;
export type Sweep = any;
export type Manifold = any;
export type WorldManifold = any;
declare namespace Manifold {
	export type Type = any;
}
export type Solver = any;
export type ContactImpulse = any;

export interface Vec2 {
	x: number;
	y: number;

	toString(): string;
	clone(): Vec2;
	setZero(): Vec2;
	set(x: number, y: number): Vec2;
	set(value: Vec2): Vec2;
	setCombine(a: number, v: Vec2, b: number, w: Vec2): Vec2;
	setMul(a: number, v: Vec2): Vec2;
	add(w: Vec2): Vec2;
	addCombine(a: number, v: Vec2, b: number, w: Vec2): Vec2;
	addMul(a: number, v: Vec2): Vec2;
	sub(w: Vec2): Vec2;
	subCombine(a: number, v: Vec2, b: number, w: Vec2): Vec2;
	subMul(a: number, v: Vec2): Vec2;
	mul(m: number): Vec2;
	length(): number;
	lengthSquared(): number;
	normalize(): number;
	neg(): Vec2;
	clamp(max: number): Vec2;
}
export interface Vec3 {
	x: number;
	y: number;
	z: number;

	toString(): string;
	setZero(): Vec3;
	set(x: number, y: number, z: number): Vec3;
	add(w: Vec3): Vec3;
	sub(w: Vec3): Vec3;
	mul(m: number): Vec3;
	neg(): Vec3;
}
export interface Transform {
	p: Vec2;
	q: Rot;

	setIdentity(): void;
	set(position: Vec2, rotation: number): void;
	set(xf: Transform): void;
}
export interface Rot {
	s: number;
	c: number;

	setIdentity(): void;
	set(angle: number | Rot): void;
	setAngle(angle: number): void;
	getAngle(): number;
	getXAxis(): Vec2;
	getYAxis(): Vec2;
}
export type RayCastInput = {
	//TODO export interface?
	p1: Vec2;
	p2: Vec2;
	maxFraction: number;
};
export type RayCastOutput = {
	normal: Vec2;
	fraction: number;
};
export interface AABB {
	lowerBound: Vec2;
	upperBound: Vec2;

	isValid(): boolean;
	getCenter(): Vec2;
	getExtents(): Vec2;
	getPerimeter(): number;
	combine(a: AABB, b?: AABB): void;
	combinePoints(a: Vec2, b: Vec2): void;
	set(aabb: AABB): void;
	contains(aabb: AABB): boolean;
	extend(value: number): void;
	rayCast(output: RayCastOutput, input: RayCastInput): boolean;
	toString(): string;
}
export interface MassData {
	mass: number;
	center: Vec2;
	I: number;
}
export type FixtureOpt = Partial<{
	userData: any;
	friction: number;
	restitution: number;
	density: number;
	isSensor: boolean;
	filterGroupIndex: number;
	filterCategoryBits: number;
	filterMaskBits: number;
}>;
export type FixtureDef = FixtureOpt & {
	shape: Shape;
};
export interface FixtureProxy {
	aabb: AABB;
	fixture: Fixture;
	childIndex: number;
	proxyId: number;
}
export type ShapeType = 'circle' | 'edge' | 'polygon' | 'chain';
export interface Fixture {
	m_body: Body;
	m_friction: number;
	m_restitution: number;
	m_density: number;
	m_isSensor: boolean;
	m_filterGroupIndex: number;
	m_filterCategoryBits: number;
	m_filterMaskBits: number;
	m_shape: Shape;
	m_next: Fixture | null;
	m_proxies: FixtureProxy[];
	m_proxyCount: number;
	m_userData: unknown;

	getType(): ShapeType;
	getShape(): Shape;
	isSensor(): boolean;
	setSensor(sensor: boolean): void;
	getUserData(): unknown;
	setUserData(data: any): void;
	getBody(): Body;
	getNext(): Fixture | null;
	getDensity(): number;
	setDensity(density: number): void;
	getFriction(): number;
	setFriction(friction: number): void;
	getRestitution(): number;
	setRestitution(restitution: number): void;
	testPoint(p: Vec2): boolean;
	rayCast(output: RayCastOutput, input: RayCastInput, childIndex: number): boolean; // is childIndex optional?
	getMassData(massData: MassData): void;
	getAABB(childIndex: number): AABB;
	createProxies(broadPhase: BroadPhase, xf: Transform): void; //TODO
	destroyProxies(broadPhase: BroadPhase): void;
	synchronize(broadPhase: BroadPhase, xf1: Transform, xf2: Transform): void;
	setFilterData(filter: { groupIndex: number; categoryBits: number; maskBits: number }): void;
	getFilterGroupIndex(): number;
	getFilterCategoryBits(): number;
	getFilterMaskBits(): number;
	refilter(): void;
	shouldCollide(that: Fixture): boolean;
}
export type BodyType = 'static' | 'kinematic' | 'dynamic';
export type BodyDef = Partial<{
	type: BodyType;
	position: Vec2;
	angle: number;
	linearVelocity: Vec2;
	angularVelocity: number;
	linearDamping: number;
	angularDamping: number;
	fixedRotation: boolean;
	bullet: boolean;
	gravityScale: number;
	allowSleep: boolean;
	awake: boolean;
	active: boolean;
	userData: any;
}>;
export interface Velocity {
	v: Vec2;
	w: number;
}
export interface Position {
	c: Vec2;
	a: number;
	getTransform(xf: Transform, p: Vec2): Transform;
}
export interface Body {
	m_world: World;
	m_awakeFlag: boolean;
	m_autoSleepFlag: boolean;
	m_bulletFlag: boolean;
	m_fixedRotationFlag: boolean;
	m_activeFlag: boolean;
	m_islandFlag: boolean;
	m_toiFlag: boolean;
	m_userData: unknown;
	m_type: BodyType;
	m_mass: number;
	m_invMass: number;
	// Rotational inertia about the center of mass.
	m_I: number;
	m_invI: number;
	// the body origin transform
	m_xf: Transform;
	// the swept motion for CCD
	m_sweep: Sweep;
	// position and velocity correction
	c_velocity: Velocity;
	c_position: Position;
	m_force: Vec2;
	m_torque: number;
	m_linearVelocity: Vec2;
	m_angularVelocity: number;
	m_linearDamping: number;
	m_angularDamping: number;
	m_gravityScale: number;
	m_sleepTime: number;
	m_jointList: Joint | null;
	m_contactList: Contact | null;
	m_fixtureList: Fixture | null;
	m_prev: Body | null;
	m_next: Body | null;

	isWorldLocked(): boolean;
	getWorld(): World;
	getNext(): Body | null;
	setUserData(data: any): void;
	getUserData(): unknown;
	getFixtureList(): Fixture | null;
	getJointList(): Joint | null;
	/**
         * Warning: this list changes during the time step and you may miss some
         * collisions if you don't use ContactListener.
         */
	getContactList(): Contact | null;
	isStatic(): boolean;
	isDynamic(): boolean;
	isKinematic(): boolean;
	/**
         * This will alter the mass and velocity.
         */
	setStatic(): Body;
	setDynamic(): Body;
	setKinematic(): Body;
	/**
         * @private
         */
	getType(): BodyType;
	/**
         * @private
         */
	setType(type: BodyType): void;
	isBullet(): boolean;
	setBullet(flag: boolean): void;
	isSleepingAllowed(): boolean;
	setSleepingAllowed(flag: boolean): void;
	isAwake(): boolean;
	setAwake(flag: boolean): void;
	isActive(): boolean;
	setActive(flag: boolean): void;
	isFixedRotation(): boolean;
	setFixedRotation(flag: boolean): void;
	getTransform(): Transform;
	setTransform(position: Vec2, angle: number): void;
	synchronizeTransform(): void;
	synchronizeFixtures(): void;
	advance(alpha: number): void;
	getPosition(): Vec2;
	setPosition(p: Vec2): void;
	getAngle(): number;
	setAngle(angle: number): void;
	getWorldCenter(): Vec2;
	getLocalCenter(): Vec2;
	getLinearVelocity(): Vec2;
	getLinearVelocityFromWorldPoint(worldPoint: Vec2): Vec2;
	getLinearVelocityFromLocalPoint(localPoint: Vec2): Vec2;
	setLinearVelocity(v: Vec2): void;
	getAngularVelocity(): number;
	setAngularVelocity(w: number): void;
	getLinearDamping(): number;
	setLinearDamping(linearDamping: number): void;
	getAngularDamping(): number;
	setAngularDamping(angularDamping: number): void;
	getGravityScale(): number;
	setGravityScale(scale: number): void;
	getMass(): number;
	getInertia(): number;
	getMassData(data: MassData): void;
	resetMassData(): void;
	setMassData(massData: MassData): void;
	applyForce(force: Vec2, point: Vec2, wake?: boolean): void;
	applyForceToCenter(force: Vec2, wake?: boolean): void;
	applyTorque(torque: number, wake?: boolean): void;
	applyLinearImpulse(impulse: Vec2, point: Vec2, wake?: boolean): void;
	applyAngularImpulse(impulse: number, wake?: boolean): void;
	shouldCollide(that: Body): boolean;
	createFixture(def: FixtureDef): Fixture;
	createFixture(shape: Shape, opt?: FixtureOpt): Fixture;
	createFixture(shape: Shape, density?: number): Fixture;
	destroyFixture(fixture: Fixture): void;
	getWorldPoint(localPoint: Vec2): Vec2;
	getWorldVector(localVector: Vec2): Vec2;
	getLocalPoint(worldPoint: Vec2): Vec2;
	getLocalVector(worldVector: Vec2): Vec2;
}
export interface ContactEdge {
	contact: Contact;
	prev: Contact | undefined;
	next: Contact | undefined;
	other: Body | undefined;
}
export interface VelocityConstraintPoint {
	rA: Vec2;
	rB: Vec2;
	normalImpulse: number;
	tangentImpulse: number;
	normalMass: number;
	tangentMass: number;
	velocityBias: number;
}
export interface Mat22 {
	ex: Vec2;
	ey: Vec2;
	toString(): string;
	set(a: Mat22): void;
	set(a: Vec2, b: Vec2): void;
	set(a: number, b: number, c: number, d: number): void;
	setIdentity(): void;
	setZero: void;
	getInverse(): Mat22;
	solve(v: Vec2): Vec2;
}
export interface Contact {
	m_nodeA: ContactEdge;
	m_nodeB: ContactEdge;
	m_fixtureA: Fixture;
	m_fixtureB: Fixture;
	m_indexA: number;
	m_indexB: number;
	m_evaluateFcn: (
		manifold: Manifold,
		xfA: Transform,
		fixtureA: Fixture,
		indexA: number,
		xfB: Transform,
		fixtureB: Fixture,
		indexB: number
	) => void;
	m_manifold: Manifold;
	m_prev: Contact | null;
	m_next: Contact | null;
	m_toi: number;
	m_toiCount: number;
	m_toiFlag: boolean;
	m_friction: number;
	m_restitution: number;
	m_tangentSpeed: number;
	m_enabledFlag: boolean;
	m_islandFlag: boolean;
	m_touchingFlag: boolean;
	m_filterFlag: boolean;
	m_bulletHitFlag: boolean;
	v_points: VelocityConstraintPoint[];
	v_normal: Vec2;
	v_normalMass: Mat22;
	v_K: Mat22;
	v_pointCount: number;
	v_tangentSpeed: number | undefined;
	v_friction: number | undefined;
	v_restitution: number | undefined;
	v_invMassA: number | undefined;
	v_invMassB: number | undefined;
	v_invIA: number | undefined;
	v_invIB: number | undefined;
	p_localPoints: Vec2[];
	p_localNormal: Vec2;
	p_localPoint: Vec2;
	p_localCenterA: Vec2;
	p_localCenterB: Vec2;
	p_type: Manifold.Type;
	p_radiusA: number | undefined;
	p_radiusB: number | undefined;
	p_pointCount: number | undefined;
	p_invMassA: number | undefined;
	p_invMassB: number | undefined;
	p_invIA: number | undefined;
	p_invIB: number | undefined;

	initConstraint(step: { warmStarting: boolean; dtRatio: number }): void;
	getManifold(): Manifold;
	getWorldManifold(worldManifold: WorldManifold | null | undefined): WorldManifold;
	setEnabled(flag: boolean): void;
	isEnabled(): boolean;
	isTouching(): boolean;
	getNext(): Contact | null;
	getFixtureA(): Fixture;
	getFixtureB(): Fixture;
	getChildIndexA(): number;
	getChildIndexB(): number;
	flagForFiltering(): void;
	setFriction(friction: number): void;
	getFriction(): number;
	resetFriction(): void;
	setRestitution(restitution: number): void;
	getRestitution(): number;
	resetRestitution(): void;
	setTangentSpeed(speed: number): void;
	getTangentSpeed(): number;
	evaluate(manifold: Manifold, xfA: Transform, xfB: Transform): void;
	update(listener?: {
		beginContact(contact: Contact): void;
		endContact(contact: Contact): void;
		oreSolve(contact: Contact, oldManifold: Manifold): void;
	}): void;
	solvePositionConstraint(step: any): number;
	solvePositionConstraintTOI(step: any, toiA?: Body | null, toiB?: Body | null): number;
	_solvePositionConstraint(step: any, toi: boolean, toiA?: Body | null, toiB?: Body | null): number;
	initVelocityConstraint(step: { blockSolve: boolean }): void;
	warmStartConstraint(step?: any): void;
	storeConstraintImpulses(step?: any): void;
	solveVelocityConstraint(step: { blockSolve: boolean }): void;
}
export interface JointEdge {
	//TODO
}

export type WorldDef = Partial<{
	gravity: Vec2;
	allowSleep: boolean;
	warmStarting: boolean;
	continuousPhysics: boolean;
	subStepping: boolean;
	blockSolve: boolean;
	velocityIterations: number;
	positionIterations: number;
}>;
export interface World {
	m_solver: Solver;
	m_broadPhase: BroadPhase;
	m_contactList: Contact | null;
	m_contactCount: number;
	m_bodyList: Body | null;
	m_bodyCount: number;
	m_jointList: Joint | null;
	m_jointCount: number;
	m_stepComplete: boolean;
	m_allowSleep: boolean;
	m_gravity: Vec2;
	m_clearForces: boolean;
	m_newFixture: boolean;
	m_locked: boolean;
	m_warmStarting: boolean;
	m_continuousPhysics: boolean;
	m_subStepping: boolean;
	m_blockSolve: boolean;
	m_velocityIterations: number;
	m_positionIterations: number;
	m_t: number;
	m_stepCount: number;
	addPair: (proxyA: FixtureProxy, proxyB: FixtureProxy) => void;

	getBodyList(): Body | null;
	getJointList(): Joint | null;
	getContactList(): Contact | null;
	getBodyCount(): number;
	getJointCount(): number;
	getContactCount(): number;
	setGravity(gravity: Vec2): void;
	getGravity(): Vec2;
	isLocked(): boolean;
	setAllowSleeping(flag: boolean): void;
	getAllowSleeping(): boolean;
	setWarmStarting(flag: boolean): void;
	getWarmStarting(): boolean;
	setContinuousPhysics(flag: boolean): void;
	getContinuousPhysics(): boolean;
	setSubStepping(flag: boolean): void;
	getSubStepping(): boolean;
	setAutoClearForces(flag: boolean): void;
	getAutoClearForces(): boolean;
	clearForces(): void;
	queryAABB(aabb: AABB, queryCallback: (fixture: Fixture) => boolean): void;
	rayCast(
		point1: Vec2,
		point2: Vec2,
		reportFixtureCallback: (fixture: Fixture, point: Vec2, normal: Vec2, fraction: number) => number
	): void;
	getProxyCount(): number;
	getTreeHeight(): number;
	getTreeBalance(): number;
	getTreeQuality(): number;
	shiftOrigin(newOrigin: Vec2): void;
	createBody(def: BodyDef): Body;
	createBody(position: Vec2, angle?: number): Body;
	createBody(): Body;
	createDynamicBody(def: BodyDef): Body;
	createDynamicBody(position: Vec2, angle?: number): Body;
	createDynamicBody(): Body;
	createKinematicBody(def: BodyDef): Body;
	createKinematicBody(position: Vec2, angle?: number): Body;
	createKinematicBody(): Body;
	destroyBody(b: Body): boolean; //m_destroyed not in Body but used!?
	createJoint<T extends Joint>(joint: T): T | null;
	destroyJoint(joint: Joint): void;
	step(timeStep: number, velocityIterations?: number, positionIterations?: number): void;
	findNewContacts(): void;
	/**
         * @private
         */
	createContact(proxyA: FixtureProxy, proxyB: FixtureProxy): void;
	updateContacts(): void;
	destroyContact(contact: Contact): void;

	_listeners: any; //TODO

	on(name: 'begin-contact', listener: (contact: Contact) => void): World;
	on(name: 'end-contact', listener: (contact: Contact) => void): World;
	on(name: 'pre-solve', listener: (contact: Contact, oldManifold: Manifold) => void): World;
	on(name: 'post-solve', listener: (contact: Contact, impulse: ContactImpulse) => void): World;
	on(name: 'remove-body', listener: (body: Body) => void): World; // never gets called?
	on(name: 'remove-joint', listener: (joint: Joint) => void): World;
	on(name: 'remove-fixture', listener: (fixture: Fixture) => void): World;
	off(name: 'begin-contact', listener: (contact: Contact) => void): World;
	off(name: 'end-contact', listener: (contact: Contact) => void): World;
	off(name: 'pre-solve', listener: (contact: Contact, oldManifold: Manifold) => void): World;
	off(name: 'post-solve', listener: (contact: Contact, impulse: ContactImpulse) => void): World;
	off(name: 'remove-body', listener: (body: Body) => void): World; // never gets called?
	off(name: 'remove-joint', listener: (joint: Joint) => void): World;
	off(name: 'remove-fixture', listener: (fixture: Fixture) => void): World;

	publish(name: string, arg1: any, arg2: any, arg3: any): number;

	beginContact(contact: Contact): void;
	endContact(contact: Contact): void;
	preSolve(contact: Contact, oldManifold: Manifold): void;
	postSolve(contact: Contact, impulse: ContactImpulse): void;
}

export interface DistanceProxy {
	m_buffer: Vec2[];
	m_vertices: Vec2[];
	m_count: number;
	m_radius: number;

	getVertexCount(): number;
	getVertex(index: number): Vec2;
	getSupport(d: Vec2): number;
	getSupportVertex(d: Vec2): Vec2;
	set(shape: Shape, index: number): void; //TODO index is only used by Chain
}
export interface Shape {
	m_type: ShapeType;
	m_radius: number;

	isValid(shape: any): boolean;
	getRadius(): number;
	getType(): ShapeType;
	getChildCount(): number;
	testPoint(xf: Transform, p: Vec2): false;
	rayCast(output: RayCastOutput, input: RayCastInput, xf: Transform, childIndex?: number): boolean;
	computeAABB(aabb: AABB, xf: Transform, childIndex?: number): void;
	computeMass(massData: MassData, density?: number): void;
	computeDistanceProxy(proxy: DistanceProxy): void;
}
export interface CircleShape extends Shape {
	m_type: 'circle';

	m_p: Vec2;

	getCenter(): Vec2;
	getVertex(index?: number): Vec2;
	getVertexCount(index?: number): 1;
}
export interface EdgeShape extends Shape {
	m_type: 'edge';

	m_vertex1: Vec2;
	m_vertex2: Vec2;
	m_vertex0: Vec2;
	m_vertex3: Vec2;
	m_hasVertex0: boolean;
	m_hasVertex3: boolean;

	setNext(v3?: Vec2): EdgeShape;
	setPrev(v0?: Vec2): EdgeShape;
	// @private @internal
	// _set(v1: Vec2, v2: Vec2): EdgeShape;
}
export interface PolygonShape extends Shape {
	m_type: 'polygon';

	m_centroid: Vec2;
	m_vertices: Vec2[];
	m_normals: Vec2[];
	m_count: number;

	getVertex(index: number): Vec2;
	validate(): void;

	// @private @internal
	// _set(vertices: Vec2[]): void;
	// _setAsBox(hx: number, hy: number, center: Vec2, angle?: number): void;
	// _setAsBox(hx: number, hy: number): void;
}
export interface ChainShape extends Shape {
	m_type: 'chain';

	m_vertices: Vec2[];
	m_count: number;
	m_prevVertex: Vec2 | null;
	m_nextVertex: Vec2 | null;
	m_hasPrevVertex: boolean;
	m_hasNextVertex: boolean;

	// @private @internal
	// _createLoop(vertices: Vec2[]): ChainShape;
	// _createChain(vertices: Vec2[]): ChainShape;
	// _setPrevVertex(prevVertex: Vec2): void;
	// _setNextVertex(nextVertex: Vec2): void;
	getChildEdge(edge: EdgeShape, childIndex: number): void;
	getVertex(index: number): Vec2;
}

export enum LIMIT_STATE {
	INACTIVE_LIMIT,
	AT_LOWER_LIMIT,
	AT_UPPER_LIMIT,
	EQUAL_LIMITS
}

export interface Joint {
	m_type: string;
	m_bodyA: Body;
	m_bodyB: Body;
	m_index: number;
	m_collideConnected: boolean;
	m_prev: Joint | null;
	m_next: Joint | null;
	m_edgeA: JointEdge;
	m_edgeB: JointEdge;
	m_islandFlag: boolean;
	m_userData: unknown;

	isActive(): boolean;
	getType(): string;
	getBodyA(): Body;
	getBodyB(): Body;
	getNext(): Joint | null;
	getUserData(): unknown;
	setUserData(data: any): void;
	getCollideConnected(): boolean;
	getAnchorA(): Vec2;
	getAnchorB(): Vec2;
	getReactionForce(inv_dt: number): Vec2;
	getReactionTorque(inv_dt: number): number;
	shiftOrigin(newOrigin: Vec2): void;
	initVelocityConstraints(step): void;
	solveVelocityConstraints(step): void;
	solvePositionConstraints(step): boolean;
}
export type JointOpt = Partial<{
	userData: any;
	collideConnected: boolean;
}>;
export type JointDef = JointOpt & {
	bodyA: Body;
	bodyB: Body;
};

export interface DistanceJoint extends Joint {
	m_type: 'distance-joint';

	// Solver shared
	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_length: Vec2;
	m_frequencyHz: number;
	m_dampingRatio: number;
	m_impulse: number;
	m_gamma: number;
	m_bias: number;
	// Solver temp//internally?
	//this.m_u; // Vec2
	//this.m_rA; // Vec2
	//this.m_rB; // Vec2
	//this.m_localCenterA; // Vec2
	//this.m_localCenterB; // Vec2
	//this.m_invMassA;
	//this.m_invMassB;
	//this.m_invIA;
	//this.m_invIB;
	//this.m_mass;

	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	setLength(length: number): void;
	getLength(): number;
	setFrequency(hz: number): void;
	getFrequency(): number;
	setDampingRatio(ratio: number): void;
	getDampingRatio(): number;
}
export type DistanceJointOpt = JointOpt &
	Partial<{
		frequencyHz: number;
		dampingRatio: number;
		length: number;
	}>;
export type DistanceJointDef = JointDef &
	DistanceJointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
	};

export interface FrictionJoint extends Joint {
	m_type: 'friction-joint';

	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	// Solver shared
	m_linearImpulse: Vec2;
	m_angularImpulse: number;
	m_maxForce: number;
	m_maxTorque: number;
	// Solver temp
	//m_rA; // Vec2
	//m_rB; // Vec2
	//m_localCenterA; // Vec2
	//m_localCenterB; // Vec2
	//m_invMassA; // float
	//m_invMassB; // float
	//m_invIA; // float
	//m_invIB; // float
	//m_linearMass; // Mat22
	//m_angularMass; // float

	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	setMaxForce(force: number): void;
	getMaxForce(): number;
	setMaxTorque(torque: number): void;
	getMaxTorque(): number;
}
export type FrictionJointOpt = JointOpt &
	Partial<{
		maxForce: number;
		maxTorque: number;
	}>;
export type FrictionJointDef = JointDef &
	FrictionJointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
	};

export interface GearJoint extends Joint {
	m_type: 'gear-joint';

	m_joint1: RevoluteJoint | PrismaticJoint;
	m_joint2: RevoluteJoint | PrismaticJoint;
	m_type1: 'revolute-joint' | 'prismatic-joint';
	m_type2: 'revolute-joint' | 'prismatic-joint';
	m_bodyC: Body;
	m_localAnchorC: Vec2;
	m_localAnchorA: Vec2;
	m_referenceAngleA: number;
	m_localAxisC: Vec2;
	m_bodyD: Body;
	m_localAnchorD: Vec2;
	m_localAnchorB: Vec2;
	m_referenceAngleB: number;
	m_localAxisD: Vec2;
	m_ratio: number;
	m_constant: number;
	m_impulse: number;
	// Solver temp
	//this.m_lcA, this.m_lcB, this.m_lcC, this.m_lcD; // Vec2
	//this.m_mA, this.m_mB, this.m_mC, this.m_mD; // float
	//this.m_iA, this.m_iB, this.m_iC, this.m_iD; // float
	//this.m_JvAC, this.m_JvBD; // Vec2
	//this.m_JwA, this.m_JwB, this.m_JwC, this.m_JwD; // float
	//this.m_mass; // float

	getJoint1(): RevoluteJoint | PrismaticJoint;
	getJoint2(): RevoluteJoint | PrismaticJoint;
	setRatio(ratio: number): void;
	getRatio(): number;
}
export type GearJointOpt = JointOpt &
	Partial<{
		ratio: number;
	}>;
export type GearJointDef = JointDef &
	GearJointOpt & {
		joint1: RevoluteJoint | PrismaticJoint;
		joint2: RevoluteJoint | PrismaticJoint;
	};

export interface MotorJoint extends Joint {
	m_type: 'motor-joint';

	m_linearOffset: Vec2;
	m_angularOffset: number;
	m_linearImpulse: Vec2;
	m_angularImpulse: number;
	m_maxForce: number;
	m_maxTorque: number;
	m_correctionFactor: number;
	// Solver temp
	//m_rA; // Vec2
	//m_rB; // Vec2
	//m_localCenterA; // Vec2
	//m_localCenterB; // Vec2
	//m_linearError; // Vec2
	//m_angularError; // float
	//m_invMassA; // float
	//m_invMassB; // float
	//m_invIA; // float
	//m_invIB; // float
	//m_linearMass; // Mat22
	//m_angularMass; // float

	setMaxForce(force: number): void;
	getMaxForce(): number;
	setMaxTorque(torque: number): void;
	getMaxTorque(): number;
	setCorrectionFactor(factor: number): void;
	getCorrectionFactor(): number;
	setLinearOffset(linearOffset: Vec2): void;
	getLinearOffset(): Vec2;
	setAngularOffset(angularOffset: number): void;
	getAngularOffset(): number;
}
export type MotorJointOpt = JointOpt &
	Partial<{
		maxForce: number;
		maxTorque: number;
		correctionFactor: number;
		linearOffset: Vec2;
	}>;
export type MotorJointDef = JointDef & MotorJointOpt & {};

export interface MouseJoint extends Joint {
	m_type: 'mouse-joint';

	m_targetA: Vec2;
	m_localAnchorB: Vec2;
	m_maxForce: number;
	m_impulse: Vec2;
	m_frequencyHz: number;
	m_dampingRatio: number;
	m_beta: number;
	m_gamma: number;
	// Solver temp
	//m_rB: Vec2;
	//m_localCenterB: Vec2;
	//m_invMassB: number;
	//m_invIB: number;
	//mass: Mat22;
	//m_C: Vec2;

	setTarget(target: Vec2): void;
	getTarget(): Vec2;
	setMaxForce(force: number): void;
	getMaxForce(): number;
	setFrequency(hz: number): void;
	getFrequency(): number;
	setDampingRatio(ratio: number): void;
	getDampingRatio(): number;
}
export type MouseJointOpt = JointOpt &
	Partial<{
		maxForce: number;
		frequencyHz: number;
		dampingRatio: number;
	}>;
export type MouseJointDef = JointDef &
	MouseJointOpt & {
		target: Vec2;
	};

export interface PrismaticJoint extends Joint {
	m_type: 'prismatic-joint';

	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_localXAxisA: Vec2;
	m_localYAxisA: Vec2;
	m_referenceAngle: number;
	m_impulse: Vec3;
	m_motorMass: number;
	m_motorImpulse: number;
	m_lowerTranslation: number;
	m_upperTranslation: number;
	m_maxMotorForce: number;
	m_motorSpeed: number;
	m_enableLimit: boolean;
	m_enableMotor: boolean;
	m_limitState: LIMIT_STATE;
	m_axis: Vec2;
	m_perp: Vec2;
	// Solver temp
	//this.m_localCenterA; // Vec2
	//this.m_localCenterB; // Vec2
	//this.m_invMassA; // float
	//this.m_invMassB; // float
	//this.m_invIA; // float
	//this.m_invIB; // float
	//this.m_axis, this.m_perp; // Vec2
	//this.m_s1, this.m_s2; // float
	//this.m_a1, this.m_a2; // float
	//this.m_K = new Mat33();
	//this.m_motorMass; // float

	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	getLocalAxisA(): Vec2;
	getReferenceAngle(): number;
	getJointTranslation(): number;
	getJointSpeed(): number;
	isLimitEnabled(): boolean;
	enableLimit(flag: boolean): void;
	getLowerLimit(): number;
	getUpperLimit(): number;
	setLimits(lower: number, upper: number): void;
	isMotorEnabled(): boolean;
	enableMotor(flag: boolean): void;
	setMotorSpeed(speed: number): void;
	setMaxMotorForce(force: number): void;
	getMotorSpeed(): number;
	getMotorForce(inv_dt: number): number;
}
export type PrismaticJointOpt = JointOpt &
	Partial<{
		enableLimit: boolean;
		lowerTranslation: number;
		upperTranslation: number;
		enableMotor: boolean;
		maxMotorForce: number;
		motorSpeed: number;
	}>;
export type PrismaticJointDef = JointDef &
	PrismaticJointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
		localAxisA: Vec2;
		referenceAngle: number;
	};

export interface PulleyJoint extends Joint {
	m_type: 'pulley-joint';

	m_groundAnchorA: Vec2;
	m_groundAnchorB: Vec2;
	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_lengthA: Vec2;
	m_lengthB: Vec2;
	m_ratio: number;
	m_constant: number;
	m_impulse: number;
	// Solver temp
	//this.m_uA; // Vec2
	//this.m_uB; // Vec2
	//this.m_rA; // Vec2
	//this.m_rB; // Vec2
	//this.m_localCenterA; // Vec2
	//this.m_localCenterB; // Vec2
	//this.m_invMassA; // float
	//this.m_invMassB; // float
	//this.m_invIA; // float
	//this.m_invIB; // float
	//this.m_mass; // float

	getGroundAnchorA(): Vec2;
	getGroundAnchorB(): Vec2;
	getLengthA(): number;
	getLengthB(): number;
	getRatio(): number;
	getCurrentLengthA(): number;
	getCurrentLengthB(): number;
}
export type PulleyJointOpt = JointOpt & Partial<{}>;
export type PulleyJointDef = JointDef &
	PulleyJointOpt & {
		groundAnchorA: Vec2;
		groundAnchorB: Vec2;
		localAnchorA: Vec2;
		localAnchorB: Vec2;
		lengthA: number;
		lengthB: number;
		ratio: number;
	};

export interface RevoluteJoint extends Joint {
	m_type: 'revolute-joint';

	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_referenceAngle: number;
	m_impulse: Vec3;
	m_motorImpulse: number;
	m_lowerAngle: number;
	m_upperAngle: number;
	m_maxMotorTorque: number;
	m_motorSpeed: number;
	m_enableLimit: boolean;
	m_enableMotor: boolean;
	// Solver temp
	//this.m_rA; // Vec2
	//this.m_rB; // Vec2
	//this.m_localCenterA; // Vec2
	//this.m_localCenterB; // Vec2
	//this.m_invMassA; // float
	//this.m_invMassB; // float
	//this.m_invIA; // float
	//this.m_invIB; // float
	//// effective mass for point-to-point constraint.
	//this.m_mass = new Mat33();
	//// effective mass for motor/limit angular constraint.
	//this.m_motorMass; // float
	//this.m_limitState = inactiveLimit;//enum

	// From Joint:
	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	getReferenceAngle(): number;
	getJointAngle(): number;
	getJointSpeed(): number;
	isMotorEnabled(): boolean;
	enableMotor(flag: boolean): void;
	getMotorTorque(inv_dt: number): number;
	setMotorSpeed(speed: number): void;
	getMotorSpeed(): number;
	setMaxMotorTorque(torque: number): void;
	isLimitEnabled(): boolean;
	enableLimit(flag: boolean): void;
	getLowerLimit(): number;
	getUpperLimit(): number;
	setLimits(lower: number, upper: number): void;
}
export type RevoluteJointOpt = JointOpt &
	Partial<{
		lowerAngle: number;
		upperAngle: number;
		maxMotorTorque: number;
		motorSpeed: number;
		enableLimit: boolean;
		enableMotor: boolean;
	}>;
export type RevoluteJointDef = JointDef &
	RevoluteJointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
		referenceAngle: number;
	};

export interface RopeJoint extends Joint {
	m_type: 'rope-joint';

	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_maxLength: number;
	m_mass: number;
	m_impulse: number;
	m_length: number;
	m_state: LIMIT_STATE;

	// Solver temp
	//m_u; // Vec2
	//m_rA; // Vec2
	//m_rB; // Vec2
	//m_localCenterA; // Vec2
	//m_localCenterB; // Vec2
	//m_invMassA; // float
	//m_invMassB; // float
	//m_invIA; // float
	//m_invIB; // float
	//m_mass; // float

	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	setMaxLength(length: number): void;
	getMaxLength(): number;
	getLimitState(): LIMIT_STATE;
}
export type RopeJointOpt = JointOpt &
	Partial<{
		maxLength: number;
	}>;
export type RopeJointDef = JointDef &
	RopeJointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
	};

export interface WeldJoint extends Joint {
	m_type: 'weld-joint';

	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_referenceAngle: number;
	m_frequencyHz: number;
	m_dampingRatio: number;
	m_impulse: Vec3;
	m_bias: number;
	m_gamma: number;
	// Solver temp
	//this.m_rA; // Vec2
	//this.m_rB; // Vec2
	//this.m_localCenterA; // Vec2
	//this.m_localCenterB; // Vec2
	//this.m_invMassA; // float
	//this.m_invMassB; // float
	//this.m_invIA; // float
	//this.m_invIB; // float
	//this.m_mass = new Mat33();

	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	getReferenceAngle(): number;
	setFrequency(hz: number): void;
	getFrequency(): number;
	setDampingRatio(ratio: number): void;
	getDampingRatio(): number;
}
export type WeldJointOpt = JointOpt &
	Partial<{
		frequencyHz: number;
		dampingRatio: number;
		referenceAngle: number;
	}>;
export type WeldJointDef = JointDef &
	WeldJointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
	};

export interface WheelJoint extends Joint {
	m_type: 'wheel-joint';

	m_localAnchorA: Vec2;
	m_localAnchorB: Vec2;
	m_localXAxisA: Vec2;
	m_localYAxisA: Vec2;
	m_mass: number;
	m_impulse: number;
	m_motorMass: number;
	m_motorImpulse: number;
	m_springMass: number;
	m_springImpulse: number;
	m_maxMotorTorque: number;
	m_motorSpeed: number;
	m_enableMotor: boolean;
	m_frequencyHz: number;
	m_dampingRatio: number;
	m_bias: number;
	m_gamma: number;
	// Solver temp
	//this.m_localCenterA; // Vec2
	//this.m_localCenterB; // Vec2
	//this.m_invMassA; // float
	//this.m_invMassB; // float
	//this.m_invIA; // float
	//this.m_invIB; // float
	//this.m_ax = Vec2.zero();
	//this.m_ay = Vec2.zero(); // Vec2
	//this.m_sAx;
	//this.m_sBx; // float
	//this.m_sAy;
	//this.m_sBy; // float

	getLocalAnchorA(): Vec2;
	getLocalAnchorB(): Vec2;
	getLocalAxisA(): Vec2;
	getJointTranslation(): number;
	getJointSpeed(): number;
	isMotorEnabled(): boolean;
	enableMotor(flag: boolean): void;
	setMotorSpeed(speed: number): void;
	getMotorSpeed(): number;
	setMaxMotorTorque(torque: number): void;
	getMaxMotorTorque(): number;
	getMotorTorque(inv_dt: number): number;
	setSpringFrequencyHz(hz: number): void;
	getSpringFrequencyHz(): number;
	setSpringDampingRatio(ratio: number): void;
	getSpringDampingRatio(): number;
}
export type WheelJointOpt = JointOpt &
	Partial<{
		enableMotor: boolean;
		maxMotorTorque: number;
		motorSpeed: number;
		frequencyHz: number;
		dampingRatio: number;
	}>;
export type WheelJointDef = JointDef &
	JointOpt & {
		localAnchorA: Vec2;
		localAnchorB: Vec2;
		localAxisA: Vec2;
	};

// API

declare let Math: Math & {
	EPSILON: number; //readonly?
	/**
         * This function is used to ensure that a floating point number is not a NaN or
         * infinity.
         */
	isFinite(x: any): boolean;
	assert(x: any): void;
	invSqrt(x: number): number;
	nextPowerOfTwo(x: number): number;
	isPowerOfTwo(x: number): boolean;
	mod(num: number, min: number, max: number): number;
	mod(num: number, max?: number): number;
	clamp(num: number, min: number, max: number): number;
	random(min: number, max: number): number;
	random(max?: number): number;
};

declare let Vec2: {
	new (x: number, y: number): Vec2;
	(x: number, y: number): Vec2;

	new (obj: { x: number; y: number }): Vec2;
	(obj: { x: number; y: number }): Vec2;

	new (): Vec2;
	(): Vec2;

	zero(): Vec2;
	// neo(x: number, y: number): Vec2; internal
	clone(v: Vec2): Vec2;
	isValid(v: any): boolean;
	assert(o: any): void;
	lengthOf(v: Vec2): number;
	lengthSquared(v: Vec2): number;
	distance(v: Vec2, w: Vec2): number;
	distanceSquared(v: Vec2, w: Vec2): number;
	areEqual(v: Vec2, w: Vec2): boolean;
	skew(v: Vec2): Vec2;
	dot(v: Vec2, w: Vec2): number;
	cross(v: Vec2, w: Vec2): number;
	cross(v: Vec2, w: number): Vec2;
	cross(v: number, w: Vec2): Vec2;
	addCross(a: Vec2, v: Vec2, w: number): Vec2;
	addCross(a: Vec2, v: number, w: Vec2): Vec2;
	add(v: Vec2, w: Vec2): Vec2;
	combine(a: number, v: Vec2, b: number, w: Vec2): Vec2;
	// combine(a: number, v: Vec2): Vec2;
	sub(v: Vec2, w: Vec2): Vec2;
	mul(a: Vec2, b: number): Vec2;
	mul(a: number, b: Vec2): Vec2;
	neg(v: Vec2): Vec2;
	abs(v: Vec2): Vec2;
	mid(v: Vec2, w: Vec2): Vec2;
	upper(v: Vec2, w: Vec2): Vec2;
	lower(v: Vec2, w: Vec2): Vec2;
	clamp(v: Vec2, max: number): Vec2;
};
declare let Vec3: {
	new (x: number, y: number, z: number): Vec3;
	(x: number, y: number, z: number): Vec3;

	new (obj: { x: number; y: number; z: number }): Vec3;
	(obj: { x: number; y: number; z: number }): Vec3;

	new (): Vec3;
	(): Vec3;

	areEqual(v: Vec3, w: Vec3): boolean;
	dot(v: Vec3, w: Vec3): number;
	cross(v: Vec3, w: Vec3): Vec3;
	add(v: Vec3, w: Vec3): Vec3;
	sub(v: Vec3, w: Vec3): Vec3;
	mul(v: Vec3, m: number): Vec3;
	neg(v: Vec3): Vec3;

	isValid(v: any): void;
	assert(o: any): void;
};

declare let Mat22: {
	new ( a: number, b: number, c: number, d: number ): Mat22;
	( a: number, b: number, c: number, d: number ): Mat22;

	new (a: { x: number; y: number }, b: { x: number; y: number }): Mat22;
	(a: { x: number; y: number }, b: { x: number; y: number }): Mat22;

	new (): Mat22;
	(): Mat22;

	mul(mx: Mat22, my: Mat22): Mat22;
	mul(mx: Mat22, v: Vec2): Vec2;
	mulT(mx: Mat22, my: Mat22): Mat22;
	mulT(mx: Mat22, v: Vec2): Vec2;
	abs(mx): Mat22;
	add(mx1, mx2): Mat22;
}

declare let Transform: {
	new (position: Vec2, rotation: number): Transform;
	(position: Vec2, rotation: number): Transform;

	new (): Transform;
	(): Transform;

	clone(xf: Transform): Transform;
	// neo(position: Vec2, rotation: number): Transform; internal
	identity(): Transform;
	isValid(o: any): boolean;
	assert(o: any): void;
	mul(a: Transform, b: Vec2): Vec2;
	mul(a: Transform, b: Transform): Transform;
	mul(a: Transform, b: Vec2[]): Vec2[];
	mul(a: Transform, b: Transform[]): Transform[];
	mulT(a: Transform, b: Vec2): Vec2;
	mulT(a: Transform, b: Transform): Transform;
};
declare let Rot: {
	new (angle: number): Rot;
	(angle: number): Rot;

	new (rot: Rot): Rot;
	(rot: Rot): Rot;

	new (): Rot;
	(): Rot;

	// neo(angle: number): Rot; internal
	clone(rot: Rot): Rot;
	identity(): Rot;
	isValid(o: any): boolean;
	assert(o: any): void;
	mul(rot: Rot, m: Rot): Rot;
	mul(rot: Rot, m: Vec2): Vec2;
	mulSub(rot: Rot, v: Vec2, w: Vec2): Vec2;
	mulT(rot: Rot, m: Rot): Rot;
	mulT(rot: Rot, m: Vec2): Vec2;
};
declare let AABB: {
	new (lower: Vec2, upper: Vec2): AABB;
	(lower: Vec2, upper: Vec2): AABB;

	isValid(o: any): boolean;
	assert(o: any): void;
	extend(aabb: AABB, value: number): void;
	testOverlap(a: AABB, b: AABB): boolean;
	areEqual(a: AABB, b: AABB): boolean;
	diff(a: AABB, b: AABB): number;
};
declare let Fixture: {
	new (body: Body, def: FixtureDef): Fixture;
	new (body: Body, shape: Shape, def?: FixtureOpt): Fixture;
	new (body: Body, shape: Shape, density?: number): Fixture;
};
declare let Body: {
	new (world: World, def?: BodyDef): Body;

	STATIC: 'static';
	KINEMATIC: 'kinematic';
	DYNAMIC: 'dynamic';
};
declare let Contact: {
	new (
		fA: Fixture,
		indexA: number,
		fB: Fixture,
		indexB: number,
		evaluateFcn: (
			manifold: Manifold,
			xfA: Transform,
			fixtureA: Fixture,
			indexA: number,
			xfB: Transform,
			fixtureB: Fixture,
			indexB: number
		) => void
	): Contact;

	addType(
		type1: ShapeType,
		type2: ShapeType,
		callback: (
			manifold: Manifold,
			xfA: Transform,
			fixtureA: Fixture,
			indexA: number,
			xfB: Transform,
			fixtureB: Fixture,
			indexB: number
		) => void & { destroyFcn?: (contact: Contact) => void }
	): void;
	create(fixtureA: Fixture, indexA: number, fixtureB: Fixture, indexB: number): Contact | null;
	destroy(contact: Contact, listener: { endContact: (contact: Contact) => void }): void;
};

declare let World: {
	new (def: WorldDef): World;
	(def: WorldDef): World;

	new (gravity: Vec2): World;
	(gravity: Vec2): World;

	new (): World;
	(): World;
};

declare let Circle: {
	new (position: Vec2, radius?: number): CircleShape;
	(position: Vec2, radius?: number): CircleShape;

	new (radius?: number): CircleShape;
	(radius?: number): CircleShape;

	type: 'circle';
};
declare let Edge: {
	new (v1: Vec2, v2: Vec2): EdgeShape;
	(v1: Vec2, v2: Vec2): EdgeShape;

	type: 'edge';
};
declare let Polygon: {
	new (vertices: Vec2[]): PolygonShape;
	(vertices: Vec2[]): PolygonShape;

	type: 'polygon';
};
declare let Chain: {
	new (vertices: Vec2[], loop?: boolean): ChainShape;
	(vertices: Vec2[], loop?: boolean): ChainShape;

	type: 'chain';
};
declare let Box: {
	new (hx: number, hy: number, center?: Vec2, angle?: number): PolygonShape;
	(hx: number, hy: number, center?: Vec2, angle?: number): PolygonShape;

	type: 'polygon';
};

declare let DistanceJoint: {
	new (def: DistanceJointDef): DistanceJoint;
	(def: DistanceJointDef): DistanceJoint;

	new (def: DistanceJointOpt, bodyA: Body, bodyB: Body, anchorA: Vec2, anchorB: Vec2): DistanceJoint;
	(def: DistanceJointOpt, bodyA: Body, bodyB: Body, anchorA: Vec2, anchorB: Vec2): DistanceJoint;

	type: 'distance-joint';
};
declare let FrictionJoint: {
	new (def: FrictionJointDef): FrictionJoint;
	(def: FrictionJointDef): FrictionJoint;

	new (def: FrictionJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): FrictionJoint;
	(def: FrictionJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): FrictionJoint;

	type: 'friction-joint';
};
declare let GearJoint: {
	new (def: GearJointDef): GearJoint;
	(def: GearJointDef): GearJoint;

	new (
		def: GearJointOpt,
		bodyA: Body,
		bodyB: Body,
		joint1: RevoluteJoint | PrismaticJoint,
		joint2: RevoluteJoint | PrismaticJoint,
		ratio?: number
	): GearJoint;
	(
		def: GearJointOpt,
		bodyA: Body,
		bodyB: Body,
		joint1: RevoluteJoint | PrismaticJoint,
		joint2: RevoluteJoint | PrismaticJoint,
		ratio?: number
	): GearJoint;

	type: 'gear-joint';
};
declare let MotorJoint: {
	new (def: MotorJointDef): MotorJoint;
	(def: MotorJointDef): MotorJoint;

	new (def: MotorJointOpt, bodyA: Body, bodyB: Body): MotorJoint;
	(def: MotorJointOpt, bodyA: Body, bodyB: Body): MotorJoint;

	type: 'motor-joint';
};
declare let MouseJoint: {
	new (def: MouseJointDef): MouseJoint;
	(def: MouseJointDef): MouseJoint;

	new (def: MouseJointOpt, bodyA: Body, bodyB: Body, target: Vec2): MouseJoint;
	(def: MouseJointOpt, bodyA: Body, bodyB: Body, target: Vec2): MouseJoint;

	type: 'mouse-joint';
};
declare let PrismaticJoint: {
	new (def: PrismaticJointDef): PrismaticJoint;
	(def: PrismaticJointDef): PrismaticJoint;

	new (def: PrismaticJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2, axis: Vec2): PrismaticJoint;
	(def: PrismaticJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2, axis: Vec2): PrismaticJoint;

	type: 'prismatic-joint';
};
declare let PulleyJoint: {
	new (def: PulleyJointDef): PulleyJoint;
	(def: PulleyJointDef): PulleyJoint;

	new (
		def: PulleyJointOpt,
		bodyA: Body,
		bodyB: Body,
		groundA: Vec2,
		groundB: Vec2,
		anchorA: Vec2,
		anchorB: Vec2,
		ratio: number
	): PulleyJoint;
	(
		def: PulleyJointOpt,
		bodyA: Body,
		bodyB: Body,
		groundA: Vec2,
		groundB: Vec2,
		anchorA: Vec2,
		anchorB: Vec2,
		ratio: number
	): PulleyJoint;

	type: 'pulley-joint';
	MIN_PULLEY_LENGTH: number;
};
declare let RevoluteJoint: {
	new (def: RevoluteJointDef): RevoluteJoint;
	(def: RevoluteJointDef): RevoluteJoint;

	new (def: RevoluteJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): RevoluteJoint;
	(def: RevoluteJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): RevoluteJoint;

	type: 'revolute-joint';
};
declare let RopeJoint: {
	new (def: RopeJointDef): RopeJoint;
	(def: RopeJointDef): RopeJoint;

	new (def: RopeJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): RopeJoint;
	(def: RopeJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): RopeJoint;

	type: 'rope-joint';
};
declare let WeldJoint: {
	new (def: WeldJointDef): WeldJoint;
	(def: WeldJointDef): WeldJoint;

	new (def: WeldJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): WeldJoint;
	(def: WeldJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2): WeldJoint;

	type: 'weld-joint';
};
declare let WheelJoint: {
	new (def: WheelJointDef): WheelJoint;
	(def: WheelJointDef): WheelJoint;

	new (def: WheelJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2, axis: Vec2): WheelJoint;
	(def: WheelJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2, axis: Vec2): WheelJoint;

	type: 'wheel-joint';
};

declare let internal: any; //TODO (should this be private?)

// Testbed

export interface Testbed {
	isPaused(): boolean;
	togglePause(): void;
	pause(): void;
	resume(): void;
	focus(): void;
	debug: boolean;
	width: number;
	height: number;
	x: number;
	y: number;
	ratio: number;
	hz: number;
	speed: number;
	activeKeys: {
		0?: boolean;
		1?: boolean;
		2?: boolean;
		3?: boolean;
		4?: boolean;
		5?: boolean;
		6?: boolean;
		7?: boolean;
		8?: boolean;
		9?: boolean;
		A?: boolean;
		B?: boolean;
		C?: boolean;
		D?: boolean;
		E?: boolean;
		F?: boolean;
		G?: boolean;
		H?: boolean;
		I?: boolean;
		J?: boolean;
		K?: boolean;
		L?: boolean;
		M?: boolean;
		N?: boolean;
		O?: boolean;
		P?: boolean;
		Q?: boolean;
		R?: boolean;
		S?: boolean;
		T?: boolean;
		U?: boolean;
		V?: boolean;
		W?: boolean;
		X?: boolean;
		Y?: boolean;
		Z?: boolean;
		right?: boolean;
		left?: boolean;
		up?: boolean;
		down?: boolean;
		fire?: boolean;
	};
	background: string;

	mouseForce?: number;

	status(name: string, value: any): void;
	status(a: object): void;
	status(a: string): void;
	info(text: string): void;

	drawPoint(p: { x: number; y: number }, r: any, color: string): void;
	drawCircle(p: { x: number; y: number }, r: number, color: string): void;
	drawSegment(a: { x: number; y: number }, b: { x: number; y: number }, color: string): void;
	drawPolygon(points: { x: number; y: number }[], color: string): void;
	drawAABB(aabb: AABB, color: string): void;
	color(r: number, g: number, b: number): string;
	//callbacks
	_resume?: () => void;
	_pause?: () => void;
	_info?: (text: string) => void;
	step?: (dt: number, t: number) => void;
	keydown?: (keyCode: number, label: string) => void;
	keyup?: (keyCode: number, label: string) => void;
}

declare function testbed(opts: any, callback: (testbed: Testbed) => World): Testbed; //opts is never used, bug?
declare function testbed(callback: (testbed: Testbed) => World): Testbed;
