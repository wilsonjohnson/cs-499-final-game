enum InputMode {
	TEXT = 'text',
	BIND = 'bind'
}

function * genKeys() {

}



class Input {
	private static instance: Input;
	private mode: InputMode;

	private actions: Map< string, () => void > = new Map();
	private bining: Map< string, string > = new Map();

	private constructor() {}
	public static get() {
		if (typeof Input.instance === 'undefined') {
			Input.instance = new Input();
		}
		return Input.instance;
	}

	public addAction( name: string, action: () => void ) {
		this.actions.set( name, action );
	}

	public setBinding() {

	}
}
