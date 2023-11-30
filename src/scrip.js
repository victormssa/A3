// Pegando o elemento canvas
var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
    return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
};

const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    //Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/src/textures/skybox/skybox3", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;


    /**** Set camera and light *****/
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    //personagem
    BABYLON.SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "village.glb");

    const walk = function (turn, dist){
        this.turn = turn;
        this.dist = dist;
    }

    const track = [];
    track.push(new walk(86, 7));
    track.push(new walk(-85, 14.8));
    track.push(new walk(-93, 16.5));
    track.push(new walk(48, 25.5));
    track.push(new walk(-112, 30.5));
    track.push(new walk(-72, 33.2));
    track.push(new walk(42, 37.5));
    track.push(new walk(-98, 45.2));
    track.push(new walk(0, 47))

    BABYLON.SceneLoader.ImportMeshAsync("him", "/scenes/Dude/", "dude.babylon", scene).then((result) => {
        const dude = result.meshes[0];
        dude.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008);
        dude.position = new BABYLON.Vector3(-6, 0, 0);
        dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-95), BABYLON.Space.LOCAL);
        const startRotation = dude.rotationQuaternion.clone();
    
        scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);
    
        let distance = 0;
        let step = 0.015;
        let p = 0;
    
        scene.onBeforeRenderObservable.add(() => {
            dude.movePOV(0, 0, step);
            distance += step;
    
            if (distance > track[p].dist) {
                dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(track[p].turn), BABYLON.Space.LOCAL);
                p += 1;
                p %= track.length;
                if (p === 0) {
                    distance = 0;
                    dude.position = new BABYLON.Vector3(-6, 0, 0);
                    dude.rotationQuaternion = startRotation.clone();
                }
            }
        });
    });
    

    

    // Adicionar a criação do chão da vila
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/villagegreen.png");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 24, height: 24 });
    ground.material = groundMat;

    // Adicionar a criação do terreno grande
    const largeGroundMat = new BABYLON.StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/valleygrass.png");

    const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", { width: 150, height: 150, subdivisions: 20, minHeight: 0, maxHeight: 10 });
    largeGround.material = largeGroundMat;
    largeGround.position.y = -0.01;

    const detached_house = buildHouse(1);
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;

    const semi_house = buildHouse(2);
    semi_house.rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;

    const places = []; // Cada entrada é um array [tipo de casa, rotação, x, z]
    places.push([1, -Math.PI / 16, -6.8, 2.5]);
    places.push([2, -Math.PI / 16, -4.5, 3]);
    // Adicione mais lugares conforme necessário

    // Criar instâncias das duas primeiras casas construídas
    const houses = [];
    for (let i = 0; i < places.length; i++) {
        houses[i] = buildHouse(places[i][0]);
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }

    const sound = new BABYLON.Sound('som_de_fundo', '/sound/som.mp3', scene, null, { loop: true, autoplay: true });

    // Carregando o carro
    BABYLON.SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "car.glb").then(() => {
        const car = scene.getMeshByName("car");
        car.rotation = new BABYLON.Vector3(Math.PI / 2, 0, -Math.PI / 2);
        car.position.y = 0.16;
        car.position.x = -3;
        car.position.z = 8;

        const animCar = new BABYLON.Animation("carAnimation", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const carKeys = [];

        carKeys.push({
            frame: 0,
            value: 8
        });

        carKeys.push({
            frame: 150,
            value: -7
        });

        carKeys.push({
            frame: 200,
            value: -7
        });

        animCar.setKeys(carKeys);

        car.animations = [];
        car.animations.push(animCar);

        scene.beginAnimation(car, 0, 200, true);

        // Roda animação
        const wheelRB = scene.getMeshByName("wheelRB");
        const wheelRF = scene.getMeshByName("wheelRF");
        const wheelLB = scene.getMeshByName("wheelLB");
        const wheelLF = scene.getMeshByName("wheelLF");

        scene.beginAnimation(wheelRB, 0, 30, true);
        scene.beginAnimation(wheelRF, 0, 30, true);
        scene.beginAnimation(wheelLB, 0, 30, true);
        scene.beginAnimation(wheelLF, 0, 30, true);
    });

    
    

    return scene;
}

/****** Funções de Construção ***********/
const buildGround = () => {
    // Cor
    
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3(0.07, 0.63, 0.07);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 15, height: 16 });
    ground.material = groundMat;
}



const buildHouse = (width) => {
    const box = buildBox(width);
    const roof = buildRoof(width);

    const house = new BABYLON.Mesh("house");

    box.parent = house;
    roof.parent = house;

    return house;
}

const buildBox = (width) => {
    // Textura
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    if (width == 2) {
        boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/semihouse.png");
    } else {
        boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/cubehouse.png");
    }

    // Opções para definir imagens diferentes em cada lado
    const faceUV = [];
    if (width == 2) {
        faceUV[0] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0); // Traseira
        faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0); // Frente
        faceUV[2] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); // Lado direito
        faceUV[3] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); // Lado esquerdo
    } else {
        faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); // Traseira
        faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); // Frente
        faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0); // Lado direito
        faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); // Lado esquerdo
    }
    // Topo 4 e baixo 5 não são visíveis, então não são definidos

    /**** Objetos do Mundo *****/
    const box = BABYLON.MeshBuilder.CreateBox("box", { width: width, faceUV: faceUV, wrap: true });
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
}

const buildRoof = (width) => {
    // Textura
    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");

    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", { diameter: 1.3, height: 1.2, tessellation: 3 });
    roof.material = roofMat;
    roof.scaling.x = 0.75;
    roof.scaling.y = width;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    return roof;
}

window.initFunction = async function () {
    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("A função createEngine disponível falhou. Criando o mecanismo padrão em vez disso.");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'O mecanismo não deve ser nulo.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};

initFunction().then(() => {
    sceneToRender = scene
});

// Redimensionar
window.addEventListener("resize", function () {
    engine.resize();
});
