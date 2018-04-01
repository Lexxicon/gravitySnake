Input = function(){
    var contextmenu = (e) => e.preventDefault();
    var onKeyDown = (e) => {
        if(!pressed[e]){
            this.keyHandler(e.keyCode);
        }
        pressed[e.keyCode] = true;
    }
    var onKeyUp = (e) => {
        pressed[e.keyCode] = false;
    };
    
    var pressed = {};

    this.keyHandler = (key) => console.log(key);

    document.addEventListener( 'contextmenu', contextmenu, false );
    
	window.addEventListener( 'keydown', onKeyDown, false );
	window.addEventListener( 'keyup', onKeyUp, false );
}