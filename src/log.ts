self.addEventListener('message', ( message ) => {
	console.log( message );
	self.postMessage( 'I recieved: ' + message, '' );
});