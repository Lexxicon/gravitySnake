window.onload = function(){
var container;
var camera, scene, renderer, input;

var game;

var frustumSize = 15;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

init();
animate();

function init(){
    container = document.getElementById('container');

    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
    camera.position.set(3, 2.5, 15);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    
    container.appendChild(renderer.domElement);

    input = new Input();

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    game = new GravitySnake(scene, input);

}

function onWindowResize(event) {
    var aspect = window.innerWidth / window.innerHeight;
    
    camera.left   = - frustumSize * aspect / 2;
    camera.right  =   frustumSize * aspect / 2;
    camera.top    =   frustumSize / 2;
    camera.bottom = - frustumSize / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(timestamp) {
    requestAnimationFrame(animate);
    if(!isNaN(timestamp)){
        game.update(timestamp);
    }
    renderer.render(scene, camera);
}

};