GravitySnake = function(scene, input) {
    let moveDelay = 150;


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

    let LEVELS = {
        world_one: {
            level: [
                "        ",
                "        ",
                "        ",
                "        ",
                "        ",
                " 10 f e ",
                "xxxxxxxx",
            ],
            info: "[W, S, A, D] to move",
            nextLevel: "world_two"
        },
        world_two: {
            level: [
                "        ",
                "        ",
                "        ",
                "        ",
                "        ",
                " 10 f e ",
                "xxx x   ",
            ],
            info: "[W, S, A, D] to move",
            nextLevel: "world_three"
        },
        world_three: {
            level: [
                "        ",
                "        ",
                " e      ",
                "        ",
                " x      ",
                " 10 f   ",
                "xxx x   ",
            ],
            info: "[W, S, A, D] to move",
            nextLevel: "world_four"
        },
        world_four: {
            level: [
                "xxxxxxxx",
                "    f  e",
                "        ",
                "        ",
                "   ^    ",
                " 10     ",
                "xxx     ",
            ],
            info: "[W, S, A, D] to move",
            nextLevel: ""
        }
    };

    let LOADERS = {
        [TEXTURE_LOADER]: new THREE.TextureLoader(),
    };

    let ASSETS = [
        {
            loader: TEXTURE_LOADER,
            path: "textures/grav_up.png",
            set: (t)=>{ 
                GRAV_TEXTURE = t;
                GRAV_TEXTURE.minFilter = THREE.NearestFilter;
                GRAV_TEXTURE.magFilter = THREE.NearestFilter;
            },
            loaded: false,
        }
    ];

    let CUBE = new THREE.BoxGeometry( 1, 1, 1 );

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

    let GRAV_TEXTURE;
    let MATERIAL;

    let customCreate = {
        [GRAV_DOWN]: (obj)=> obj.rotation.z = Math.PI,
        [GRAV_LEFT]: (obj)=> obj.rotation.z = Math.PI * (1/2),
        [GRAV_RIGHT]: (obj)=> obj.rotation.z = Math.PI * (-1/2),
    }

    let level = LEVELS.world_one;
    let sceneGroup;

    let gravity = GRAV[GRAV_DOWN];
    let snake = [];
    let fruit = [];
    let exits = [];
    let world = [[]];

    let gameTime = 0;
    let nextMoveTime = 0;

    input.keyHandler = inputHandler;

    load(ASSETS, setup);

    function isOutOfWorld(part){
        if(Array.isArray(part)){
            return part.map(isOutOfWorld).reduce((a, b)=> a || b, false);
        }
        let ij = toIJ(part, world);
        return (ij.i < 0 || ij.j < 0 || ij.i >= world.length || ij.j >= world[ij.i].length);
    }

    function isSupported(part){
        if(Array.isArray(part)){
            return part.map(isSupported).reduce((a, b)=> a || b, false);
        }
        let adjPart = {x:part.x + gravity.x, y:part.y + gravity.y};
        let ij = toIJ(adjPart, world);
        if(isOutOfWorld(adjPart)){
            return false;
        }
        
        return (world[ij.i][ij.j] === WALL);
    }

    function isOnlyLastSupported(parts){
        for(let i = 0; i < parts.length - 1; i++){
            if(isSupported(parts[i])){
                return false;
            }
        }
        return true;
    }

    function canMove(x, y){
        let adjPart = {x: x + snake[0].x, y: y + snake[0].y};
        let ij = toIJ(adjPart, world);
        if(isOutOfWorld(adjPart)){
            return false;
        }

        if(world[ij.i][ij.j] === WALL){
            return false;
        }

        let eatSelf = snake.map(p=>p.x === adjPart.x && p.y === adjPart.y).reduce((a, b)=> a || b, false);
        if(eatSelf){
            return false;
        }

        if(-x === gravity.x && -y === gravity.y && isOnlyLastSupported(snake) && isStraight(snake, x === 0 ? "x" : "y")){
            return false;
        }

        return true;
    }

    function isStraight(snake, field){
        return snake.every(p=> p[field] === snake[0][field]);
    }

    function canEat(x, y){
        let adjPart = {x: x + snake[0].x, y: y + snake[0].y};
        return fruit.map(p=>p.x === adjPart.x && p.y === adjPart.y).reduce((a, b)=> a || b, false);
    }

    function eat(x, y){
        let adjPart = {x: x + snake[0].x, y: y + snake[0].y};
        for(let i = 0; i < fruit.length; i++){
            if(fruit[i].x === adjPart.x && fruit[i].y === adjPart.y){
                let o = sceneGroup.getObjectById(fruit[i].id);
                sceneGroup.remove(o);
                fruit.splice(i, 1);
            }
        }
        if(fruit.length === 0){
            MATERIAL[EXIT].color = new THREE.Color(0xF7DC6F);
            MATERIAL[EXIT].needsUpdate = true;
        }
    }

    function grow(){
        let last = snake[snake.length - 1];
        snake.push(create(last.x, last.y, SNAKE_BODY).position);
    }

    function move(x, y){
        if(!canMove(x, y) || !isSupported(snake) || nextMoveTime > gameTime){
            return;
        }
        if(canEat(x, y)){
            eat(x, y);
            grow();
        }
        for(let i = snake.length - 1; i > 0; i--){
            snake[i].x = snake[i - 1].x;
            snake[i].y = snake[i - 1].y;
            snake[i].z = snake[i - 1].z;
        }
        snake[0].x += x;
        snake[0].y += y;
        nextMoveTime = gameTime + moveDelay;
    }

    function updateGravity(){
        if(snake && snake[0] && !isOutOfWorld(snake[0])){
            let ij = toIJ(snake[0], world);
            gravity = GRAV[world[ij.i][ij.j]] || gravity;
        }
    }

    function tryExit(){
        if(fruit.length === 0 && world && snake[0]){
            let ij = toIJ(snake[0], world);
            if(world[ij.i][ij.j] === EXIT){
                if(level.nextLevel && LEVELS[level.nextLevel]){
                    level = LEVELS[level.nextLevel];
                    restartLevel();
                }else{
                    document.getElementById("info").innerHTML = "You win!";
                }
            }
        }
    }

    this.update = function(time) {
        gameTime = time;
        tryExit();
        updateGravity();
        if( nextMoveTime < gameTime && !isSupported(snake)){
            if(isOutOfWorld(snake)){
                return;
            }
            snake.forEach(p=>{ p.x += gravity.x; p.y+= gravity.y });
            if(!isSupported(snake)){
                nextMoveTime = gameTime + moveDelay;
            }
        }
        if(snake[0] && canEat(0, 0)){
            eat(0, 0);
            grow();
        }

        if(isOutOfWorld(snake)){
            showGameOver();
        }

        if(snake[0] && !canMove(1, 0) && !canMove(-1, 0) && !canMove(0, 1) && !canMove(0, -1)){
            showGameOver();
        }
    }

    function showGameOver(){
        document.getElementById("info").innerHTML = "Game Over. 'R' to restart."
    }

    function toXY(ij, template){
        return {x: ij.j, y: template.length - ij.i - 1,};
    }

    function toIJ(xy, template){
        return {i: template.length - xy.y - 1, j: xy.x};
    }

    function load(assets, onDone){
        for(let i = 0; i < assets.length; i++){
            let asset = assets[i]
            LOADERS[asset.loader].load(asset.path, 
                (t)=> {
                    asset.set(t);
                    asset.loaded = true;
                    if(isLoaded(assets)){
                        onDone();
                    }
                },
                undefined,
                (err)=> console.error("error while loading " + err)
            )
        }
    }

    function isLoaded(assets){
        return assets.map(x=>x.loaded).reduce((a, b) => a && b, true);
    }

    function setup(){
        createMaterials();
        createWorld(level);
    }

    function createMaterials(){
        MATERIAL = {
            [EMPTY]: new THREE.MeshBasicMaterial({
                color: 0x5DADE2
            }),
            [SNAKE_HEAD]: new THREE.MeshBasicMaterial({
                color: 0x76D7C4
            }),
            [SNAKE_BODY]: new THREE.MeshBasicMaterial({
                color: 0x17A589
            }),
            [EXIT]: new THREE.MeshBasicMaterial({
                color: 0x404040
            }),
            [FRUIT]: new THREE.MeshBasicMaterial({
                color: 0xCD6155
            }),
            [WALL]: new THREE.MeshBasicMaterial({
                color: 0x6E2C00
            }),
            [GRAV_UP]: new THREE.MeshBasicMaterial({
                map: GRAV_TEXTURE
            }),
            [GRAV_DOWN]: new THREE.MeshBasicMaterial({
                map: GRAV_TEXTURE
            }),
            [GRAV_LEFT]: new THREE.MeshBasicMaterial({
                map: GRAV_TEXTURE
            }),
            [GRAV_RIGHT]: new THREE.MeshBasicMaterial({
                map: GRAV_TEXTURE
            }),
        };
    }

    function restartLevel(){
        createWorld(level);
    }

    function inputHandler(key){
        switch(key){
            case KeyCode.KEY_D:
                move(1, 0);
                break;
            case KeyCode.KEY_A:
                move(-1, 0);
                break;
            case KeyCode.KEY_W:
                move(0, 1);
                break;
            case KeyCode.KEY_S:
                move(0, -1);
                break;
            case KeyCode.KEY_R:
                restartLevel();
                break;
        }
    }

    function createWorld(template){
        if(sceneGroup){
            scene.remove(sceneGroup);
        }
        sceneGroup = new THREE.Group();
        MATERIAL[EXIT].color = new THREE.Color(0x404040);
        MATERIAL[EXIT].needsUpdate = true;

        world = [];
        snake = [];
        fruit = [];
        exits = [];
        gravity = GRAV[template.gravity] || GRAV[GRAV_DOWN];

        document.getElementById("info").innerHTML = template.info || "[W, S, A, D] to move";

        let level = template.level;
        for(let i = 0; i < level.length; i++){
            world[i] = [];
            for(let j = 0; j < level[i].length; j++){
                let type = level[i][j];
                let xy = toXY({i,j}, level);
                //is snake part
                if(type != EMPTY && !isNaN(type)){
                    let snakePart = type == 0 ? SNAKE_HEAD : SNAKE_BODY;
                    snake[type] = create(xy.x, xy.y, snakePart, customCreate[snakePart]).position;
                    type = EMPTY;
                }else if(type === FRUIT){
                    fruit.push(create(xy.x, xy.y, FRUIT, customCreate[FRUIT]).position);
                    type = EMPTY;
                }
                let obj = create(xy.x, xy.y, type, customCreate[type]);
                world[i][j] = type;
                if(level[i][j] === EXIT){
                    exits.push(obj);
                }
            }
        }

        scene.add(sceneGroup);
    }

    function create(x, y, type, post){
        let thing = new THREE.Mesh(CUBE, MATERIAL[type]);
        thing.position.x = x;
        thing.position.y = y;
        thing.position.z = LAYER[type] || BACKGROUND;
        if(post){
            post(thing);
        }
        sceneGroup.add(thing);
        thing.position.id = thing.id;
        return thing;
    }
}