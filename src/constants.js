
    let inputDelay = 150;

    let TEXTURE_LOADER = "TEXTURE";
    let FOREGROUND = 1;
    let BACKGROUND = 0;
    
    let EMPTY = " ";
    let SNAKE_HEAD = "s";
    let SNAKE_BODY = "b";
    let EXIT = "e";
    let FRUIT = "f";
    let WALL = "x";

    let GRAV_UP = "^";
    let GRAV_DOWN = "v";
    let GRAV_LEFT = "<";
    let GRAV_RIGHT = ">";

    let GRAV = {
        [GRAV_UP]: {x: 0, y: 1},
        [GRAV_DOWN]: {x: 0, y: -1},
        [GRAV_LEFT]: {x: -1, y: 0},
        [GRAV_RIGHT]: {x: 1, y: 0}
    };

    let LAYER = {
        [SNAKE_HEAD]:FOREGROUND,
        [SNAKE_BODY]:FOREGROUND,
        [FRUIT]:FOREGROUND,
        
        [EMPTY]:BACKGROUND,
        [EXIT]:BACKGROUND,
        [WALL]:BACKGROUND,

        [GRAV_UP]:BACKGROUND,
        [GRAV_DOWN]:BACKGROUND,
        [GRAV_LEFT]:BACKGROUND,
        [GRAV_RIGHT]:BACKGROUND,
    }

    let LOADERS = {
        [TEXTURE_LOADER]: new THREE.TextureLoader(),
    };

    let CUBE = new THREE.BoxGeometry( 1, 1, 1 );