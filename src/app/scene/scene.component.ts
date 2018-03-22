import { AfterViewInit, OnInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as dat from './js/dat.gui.min';
import * as Stats from './js/stats.min';
import * as THREE from 'three';
import "./js/EnableThreeExamples";
import "three/examples/js/objects/Water";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/TDSLoader";
import "three/examples/js/loaders/OBJLoader";
import "three/examples/js/loaders/MTLLoader";
//import * as ParticleEngine from './js/ParticleEngine';

//declare var ParticleEngine: any;

//declare var Type:any;

declare var SPE: any;


@Component({
    selector: 'scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit, AfterViewInit {

    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private cameraTarget: THREE.Vector3;
    public scene: THREE.Scene;

    public mesh: THREE.Mesh;
    public cube: THREE.Mesh;

    public fieldOfView: number = 60;
    public nearClippingPane: number = 1;
    public farClippingPane: number = 4000;

    public controls: THREE.OrbitControls;

    public geometry: THREE.PlaneGeometry;

    public ms_Ocean;

    public clock = new THREE.Clock();

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    constructor() {
        this.render = this.render.bind(this);
        this.animate = this.animate.bind(this);
        this.renderRain = this.renderRain.bind(this);
        //this.renderControls = this.renderControls.bind(this);
        //this.onModelLoadingCompleted = this.onModelLoadingCompleted.bind(this);
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createScene() {
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AxisHelper(200));
        //var loader = new THREE.ColladaLoader();
        //loader.load('assets/model/multimaterial.dae', this.onModelLoadingCompleted);
    }
    /*
    private onModelLoadingCompleted(collada) {
        var modelScene = collada.scene;
        this.scene.add(modelScene);
        this.render();
    }
    */
    private createLight() {
        var light = new THREE.PointLight(0xffffff, 1, 1000);
        light.position.set(0, 1000, 1000);
        this.scene.add(light);

        var light = new THREE.PointLight(0xffffff, 1, 1000);
        light.position.set(0, 1000, -1000);
        this.scene.add(light);
    }

    private createCamera() {
        this.camera = new THREE.PerspectiveCamera(55.0, window.innerWidth / window.innerHeight, 0.5, 300000);
        this.camera.position.set(450, 350, 450);
        this.camera.lookAt(new THREE.Vector3());
/*
        let aspectRatio = this.getAspectRatio();
        this.camera = new THREE.PerspectiveCamera(
            this.fieldOfView,
            aspectRatio,
            this.nearClippingPane,
            this.farClippingPane
        );

        // Set position and look at
        this.camera.position.x = 1500;
        this.camera.position.y = 1000;
        this.camera.position.z = 1500;

        this.camera.lookAt(new THREE.Vector3(0,0,0));*/
    }

    private createSquare(x,y,z) {
        let squareGeometry = new THREE.Geometry();
        squareGeometry.vertices.push(new THREE.Vector3(10*x, 0.0, 10*z)); 
        squareGeometry.vertices.push(new THREE.Vector3(10*(x+1), 0.0, 10*z)); 
        squareGeometry.vertices.push(new THREE.Vector3(10*(x+1), 0.0, 10*(z-1))); 
        squareGeometry.vertices.push(new THREE.Vector3(10*x, 0.0, 10*(z-1)));
        squareGeometry.faces.push(new THREE.Face3(0, 1, 2)); 
        squareGeometry.faces.push(new THREE.Face3(0, 3, 2));
        squareGeometry.faceVertexUvs[ 0 ].push( [
            new THREE.Vector2( 0, 0 ),
            new THREE.Vector2( 0, 1 ),
            new THREE.Vector2( 1, 1 ),
            new THREE.Vector2( 1, 0 )
        ] );

        let material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xff0000),
            side: THREE.DoubleSide, 
            wireframe: true});
        this.mesh = new THREE.Mesh( squareGeometry, material );
        this.scene.add(this.mesh);
    }

    private createMeshInSquares() {
        
        for(let x= -10; x < 10; x++) {
            for(let z= 10; z > -10; z--) {
                this.createSquare(x,0,z);
            }
        }

        /*
        var geom = new THREE.Geometry(); 
        var v1 = new THREE.Vector3(-500,0,-500);
        var v2 = new THREE.Vector3(-500,0,500);
        var v3 = new THREE.Vector3(500,0,500);
        var v4 = new THREE.Vector3(500,0,500);

        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);

        geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
        geom.faces.push( new THREE.Face3( 2, 3, 0 ) );

        this.mesh = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
        this.scene.add(this.mesh);
        */
    }

    private createCube() {
        let geometry = new THREE.BoxBufferGeometry(700, 700, 700, 10, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: 0x2121ce, vertexColors: 0x2121ce, wireframe: true/*, lights: true*/});
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.rotation.x = Math.PI / 2;
        this.scene.add(this.cube);

    }

    private createMesh() {
        //var geometry = new THREE.BoxBufferGeometry(700, 700, 700, 10, 10, 10);
        this.geometry = new THREE.PlaneGeometry(2000, 2000, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: 0x2121ce, vertexColors: 0x2121ce, wireframe: true/*, lights: true*/});
        this.cube = new THREE.Mesh(this.geometry, material);
        this.cube.rotation.x = Math.PI / 2;
        this.scene.add(this.cube);

    }

    private getAspectRatio(): number {
        let height = this.canvas.clientHeight;
        if (height === 0) {
            return 0;
        }
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    private startRendering() {
        /*
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.context.getExtension('OES_texture_float');
        this.renderer.context.getExtension('OES_texture_float_linear');
        */
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.autoClear = true;
        /*
        let component: SceneComponent = this;

        (function render() {
            component.render();
        }());
        */
        this.render( this.clock.getDelta() );;
    }

    particleGroup;
    emitter;
/*
funciona: fa una font
//
    // Create particle group and emitter
    private initParticles() {
        this.particleGroup = new SPE.Group({
            texture: {
                value: this.loaderTextures.load('assets/textures/smokeparticle.png')
            }
        });

        this.emitter = new SPE.Emitter({
            maxAge: {
                value: 2
            },
            position: {
                value: new THREE.Vector3(0, 0, -50),
                spread: new THREE.Vector3( 0, 0, 0 )
            },

            acceleration: {
                value: new THREE.Vector3(0, -10, 0),
                spread: new THREE.Vector3( 10, 0, 10 )
            },

            velocity: {
                value: new THREE.Vector3(0, 25, 0),
                spread: new THREE.Vector3(10, 7.5, 10)
            },

            color: {
                value: [ new THREE.Color('white'), new THREE.Color('red') ]
            },

            size: {
                value: 1
            },

            particleCount: 2000
        });

        this.particleGroup.addEmitter( this.emitter );
        this.scene.add( this.particleGroup.mesh );
    }
*/
    public getRandomNumber( base ) {
        return Math.random() * base - (base/2);
    }
    // Create particle group and emitter
    public initParticles() {
        this.particleGroup = new SPE.Group({
            texture: {
                value: this.loaderTextures.load('assets/textures/smokeparticle.png')
            },
            fog: true
        });
        this.emitter = new SPE.Emitter({
            type: SPE.distributions.BOX,
            maxAge: 2,
            position: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3( 300, 300, 300 )
            },
            velocity: {
                value: new THREE.Vector3( 0, ((-1.0)*this.getRandomNumber(30)), 0 )
            },
            particleCount: 30000,
            isStatic: false
        });
        this.particleGroup.addEmitter( this.emitter );
        this.scene.add( this.particleGroup.mesh );
    }

    /*
    animate() {
        requestAnimationFrame( this.animate );
        this.renderer.render( this.scene, this.camera );
    }
*/
/*
    makeModifications(component: SceneComponent) {
        let vertices = component.geometry.vertices;
        //console.log(vertices.length);
        for(let i = 0; i <vertices.length; i++) {
            vertices[i].z = Math.random()*100;
            //console.log(vertices[i]);
        }
        component.geometry.verticesNeedUpdate = true;

        component.geometry.computeVertexNormals();
    }
*/
/*
    public render() {
        console.log("render");

        var time = performance.now() * 0.001;

        this.water.material.uniforms.time.value += 1.0 / 60.0;
        this.water.material.uniforms.size.value = this.parameters.size;
        this.water.material.uniforms.distortionScale.value = this.parameters.distortionScale;
        this.water.material.uniforms.alpha.value = this.parameters.alpha;

        //this.makeModifications(this);

        //this.updateOcean();

        this.renderer.render(this.scene, this.camera);

        //this.renderer.renderLists.dispose();

        setTimeout(() => {
            requestAnimationFrame(this.render)
        }, 300);

    }
    */
/*
    lastTime = (new Date()).getTime();

    public updateOcean() {
        if(this.ms_Ocean) {
            var currentTime = new Date().getTime();
            this.ms_Ocean.deltaTime = (currentTime - this.lastTime) / 1000 || 0.0;
            this.lastTime = currentTime;
            this.ms_Ocean.render(this.ms_Ocean.deltaTime);
            this.ms_Ocean.overrideMaterial = this.ms_Ocean.materialOcean;
            console.log(this.ms_Ocean.changed)
            if (this.ms_Ocean.changed) {
                this.ms_Ocean.materialOcean.uniforms.u_size.value = this.ms_Ocean.size;
                this.ms_Ocean.materialOcean.uniforms.u_sunDirection.value.set( this.ms_Ocean.sunDirectionX, this.ms_Ocean.sunDirectionY, this.ms_Ocean.sunDirectionZ );
                console.log(this.ms_Ocean.materialOcean.uniforms.u_sunDirection)
                this.ms_Ocean.materialOcean.uniforms.u_exposure.value = this.ms_Ocean.exposure;
                this.ms_Ocean.changed = false;
            }
            this.ms_Ocean.materialOcean.uniforms.u_normalMap.value = this.ms_Ocean.normalMapFramebuffer.texture;
            this.ms_Ocean.materialOcean.uniforms.u_displacementMap.value = this.ms_Ocean.displacementMapFramebuffer.texture;
            this.ms_Ocean.materialOcean.uniforms.u_projectionMatrix.value = this.camera.projectionMatrix;
            this.ms_Ocean.materialOcean.uniforms.u_viewMatrix.value = this.camera.matrixWorldInverse;
            this.ms_Ocean.materialOcean.uniforms.u_cameraPosition.value = this.camera.position;
            this.ms_Ocean.materialOcean.depthTest = true;
            //this.ms_Scene.__lights[1].position.x = this.ms_Scene.__lights[1].position.x + 0.01;
            // rotar una llum amb una esfera a traves del mar com si fos el sol
        }
    }

    public createOcean() {

        //var types = { 'float': 'half-float', 'half-float': 'float' };
        //var hash = document.location.hash.substr( 1 );
        //if (!(hash in types)) hash = 'half-float';
        let hash = 'half-float';

        var gsize = 512;
        var res = 1024;
        var gres = res / 2;
        var origx = -gsize / 2;
        var origz = -gsize / 2;
        this.ms_Ocean = new THREE.Ocean(this.renderer, this.camera, this.scene,
            {
                USE_HALF_FLOAT : hash === 'half-float',
                INITIAL_SIZE : 256.0,
                INITIAL_WIND : [10.0, 10.0],
                INITIAL_CHOPPINESS : 1.5,
                CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
                GEOMETRY_ORIGIN : [origx, origz],
                SUN_DIRECTION : [-1.0, 1.0, 1.0],
                OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
                SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
                EXPOSURE : 0.35,
                GEOMETRY_RESOLUTION: gres,
                GEOMETRY_SIZE : gsize,
                RESOLUTION : res
            });
            this.ms_Ocean.materialOcean.uniforms.u_projectionMatrix = { value: this.camera.projectionMatrix };
            this.ms_Ocean.materialOcean.uniforms.u_viewMatrix = { value: this.camera.matrixWorldInverse };
            this.ms_Ocean.materialOcean.uniforms.u_cameraPosition = { value: this.camera.position };
            console.log(this.ms_Ocean.oceanMesh);
            
            this.scene.add(this.ms_Ocean.oceanMesh);

            var gui = new dat.GUI();
            var c1 = gui.add(this.ms_Ocean, "size",100, 5000);
            c1.onChange(function(v) {
                this.object.size = v;
                this.object.changed = true;
            });
            var c2 = gui.add(this.ms_Ocean, "choppiness", 0.1, 4);
            c2.onChange(function (v) {
                this.object.choppiness = v;
                this.object.changed = true;
            });
            var c3 = gui.add(this.ms_Ocean, "windX",-15, 15);
            c3.onChange(function (v) {
                this.object.windX = v;
                this.object.changed = true;
            });
            var c4 = gui.add(this.ms_Ocean, "windY", -15, 15);
            c4.onChange(function (v) {
                this.object.windY = v;
                this.object.changed = true;
            });
            var c5 = gui.add(this.ms_Ocean, "sunDirectionX", -1.0, 1.0);
            c5.onChange(function (v) {
                this.object.sunDirectionX = v;
                this.object.changed = true;
            });
            var c6 = gui.add(this.ms_Ocean, "sunDirectionY", -1.0, 1.0);
            c6.onChange(function (v) {
                this.object.sunDirectionY = v;
                this.object.changed = true;
            });
            var c7 = gui.add(this.ms_Ocean, "sunDirectionZ", -1.0, 1.0);
            c7.onChange(function (v) {
                this.object.sunDirectionZ = v;
                this.object.changed = true;
            });
            var c8 = gui.add(this.ms_Ocean, "exposure", 0.0, 0.5);
            c8.onChange(function (v) {
                this.object.exposure = v;
                this.object.changed = true;
            });
    }
*/
/*
    renderControls() {
        this.renderer.render( this.scene, this.camera );
    }

    public addControls() {
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.addEventListener('change', this.renderControls);

    }
*/
    /* EVENTS */

    public onMouseMove(event: MouseEvent) {
        console.log("onMouse");
    }


    public onMouseDown(event: MouseEvent) {
        console.log("onMouseDown");
        event.preventDefault();

        // Example of mesh selection/pick:
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

        var obj: THREE.Object3D[] = [];
        this.findAllObjects(obj, this.scene);
        var intersects = raycaster.intersectObjects(obj);
        console.log("Scene has " + obj.length + " objects");
        console.log(intersects.length + " intersected objects found")
        intersects.forEach((i) => {
            console.log(i.object); // do what you want to do with object
            //i.object.position.y = i.object.position.y + 1;
        });
        this.render( this.clock.getDelta() );
    }

    private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
        // NOTE: Better to keep separate array of selected objects
        if (parent.children.length > 0) {
            parent.children.forEach((i) => {
                pred.push(i);
                this.findAllObjects(pred, i);                
            });
        }
    }

    public onMouseUp(event: MouseEvent) {
        console.log("onMouseUp");
    }


    @HostListener('window:resize', ['$event'])
    public onResize(event: Event) {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        console.log("onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render( this.clock.getDelta() );
    }

    @HostListener('document:keypress', ['$event'])
    public onKeyPress(event: KeyboardEvent) {
        console.log("onKeyPress: " + event.key);
    }

    light;
    stats;
    water;
    parameters = {
        oceanSide: 2000,
        size: 1.0,
        distortionScale: 3.7,
        alpha: 1.0,
        sizeRain: 2,
        transparentRain: true,
        sizeAttenuationRain: true,
        opacityRain: 0.6,
        colorRain: 0xffffff

    };
    manager: THREE.LoadingManager;
    loaderTextures: THREE.TextureLoader;

    cloud;

    textureRain;

    //engine;

    ngAfterViewInit() {
        this.animate();
    }
    /* LIFECYCLE */
    ngOnInit() {
        //
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        //
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0xaabbbb, 0.002 );
        //
        this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
        this.camera.position.set( 30, 30, 100 );
        //
        this.light = new THREE.DirectionalLight( 0xffffff, 0.8 );
        this.light.position.set( - 30, 30, 30 );
        this.light.castShadow = true;
        this.light.shadow.camera.top = 45;
        this.light.shadow.camera.right = 40;
        this.light.shadow.camera.left = this.light.shadow.camera.bottom = -40;
        this.light.shadow.camera.near = 1;
        this.light.shadow.camera.far = 200;
        this.scene.add( this.light );
        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
        this.scene.add( ambientLight );
        //
        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        this.loaderTextures = new THREE.TextureLoader( this.manager );
        //

        // Add Sky
        /*
        let sky = new THREE.Sky();
        sky.scale.setScalar( 450000 );
        scene.add( sky );
        */      
        // Add Sun Helper
        
        // per fer el sol
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
        //
        /* 
        let sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        sunSphere.position.y = - 700000;
        sunSphere.visible = false;
        this.scene.add( sunSphere );

        var distance = 400000;
        var inclination = 0.49;
        var azimuth =  0.75;

        var theta = Math.PI * ( inclination - 0.5 );
        var phi = 2 * Math.PI * ( azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
        sunSphere.visible = true;
        */
        this.setWater();

        this.setSkybox();

        this.loadIsland();

        //this.loadPalmTree();

        this.loadTree();

        this.loadDolphin1();

        this.loadDolphin2();

        this.loadDolphin3();

        this.loadBird1();

        this.loadBird2();

        this.loadBird3();

        this.loadPenguin();

        this.initParticles();

        //this.createPointCloud(this.parameters.sizeRain, this.parameters.transparentRain, this.parameters.opacityRain, this.parameters.sizeAttenuationRain, this.parameters.colorRain);

        //
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.controls.maxPolarAngle = Math.PI * 0.495;
        this.controls.target.set( 0, 10, 0 );
        this.controls.enablePan = false;
        this.controls.minDistance = 40.0;
        this.controls.maxDistance = 200.0;
        this.camera.lookAt( this.controls.target );
        //
        //this.stats = new Stats();
        //container.appendChild( this.stats.dom );
        //



        //rain
        /*
        var settings = {
            positionStyle    : Type.CUBE,
            positionBase     : new THREE.Vector3( 0, 0, 0 ),
            positionSpread   : new THREE.Vector3( 200, 200, 500 ),

            velocityStyle    : Type.CUBE,
            velocityBase     : new THREE.Vector3( 0, 0, -400 ),
            velocitySpread   : new THREE.Vector3( 10, 50, 10 ), 
            accelerationBase : new THREE.Vector3( 0, -10, 0 ),
            
            particleTexture : this.loaderTextures.load('assets/textures/raindrop-3.png'),

            sizeBase    : 4.0,
            sizeSpread  : 2.0,
            colorBase   : new THREE.Vector3(0.66, 1.0, 0.7), // H,S,L
            colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
            opacityBase : 0.6,

            particlesPerSecond : 3000,
            particleDeathAge   : 1.0,  
            emitterDeathAge    : 60
        };
   
        this.engine = new ParticleEngine();
        this.engine.setValues( settings );
        this.engine.initialize(this.scene);
*/


/*

        this.textureRain = this.loaderTextures.load('assets/textures/raindrop-3.png');

        let parent = this;
        this.rainControls = new function () {
            this.sizeRain = 6;
            this.transparentRain = true;
            this.opacityRain = 0.6;
            this.colorRain = 0xffffff;
            this.sizeAttenuationRain = true;
            
            this.redraw = function () {
                if(parent.scene.getObjectByName("particles1")) {
                    parent.scene.remove(parent.scene.getObjectByName("particles1"));
                }
                parent.createPointCloud("particles1", parent.rainControls.sizeRain, parent.rainControls.transparentRain, parent.rainControls.opacityRain, parent.rainControls.sizeAttenuationRain, parent.rainControls.colorRain);
            };
        };

        this.rainControls.redraw();
*/
        var gui = new dat.GUI();
        gui.add( this.parameters, 'distortionScale', 0, 8, 0.1 );
        gui.add( this.parameters, 'size', 0.1, 10, 0.1 );
        gui.add( this.parameters, 'alpha', 0.9, 1, .001 );
        //gui.add( this.rainControls, 'sizeRain', 0, 20).onChange(this.rainControls.redraw);;
        //gui.add( this.rainControls, 'transparentRain').onChange(this.rainControls.redraw);;
        //gui.add( this.rainControls, 'opacityRain', 0, 1).onChange(this.rainControls.redraw);;
        //gui.addColor( this.rainControls, 'colorRain').onChange(this.rainControls.redraw);;
        //gui.add( this.rainControls, 'sizeAttenuationRain').onChange(this.rainControls.redraw);
        //
        //window.addEventListener( 'resize', onWindowResize, false );
    }

    rainControls;

    onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete) + '% downloaded' );
        }
    };
    onError = function ( xhr ) {
        console.log(xhr);
    };

    createPointCloud(name, size, transparent, opacity, sizeAttenuation, color) {
        var geom = new THREE.Geometry();
        
        var material = new THREE.PointsMaterial({
            size: size,
            transparent: transparent,
            opacity: opacity,
            map: this.textureRain,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: sizeAttenuation,
            color: color
        });
        /*
        var material = new THREE.LineDashedMaterial( {
            color: 0xffffff,
            linewidth: 1,
            scale: 1,
            dashSize: 3,
            gapSize: 1,
            lights: true
        } );
        */
        var range = 2000;
        for (var i = 0; i < 1500; i++) {
            var particle = new THREE.Vector3(
                    Math.random() * range - range / 2,
                    Math.random() * range * 1.5,
                    Math.random() * range - range / 2);
            particle.velocityY = 0.1 + Math.random() / 20;
            particle.velocityX = (Math.random() - 0.5) / 3;
            geom.vertices.push(particle);
        }
        this.cloud = new THREE.Points(geom, material);
        //this.cloud = new THREE.Line(geom, material);
        this.cloud.sortParticles = true;
        this.cloud.name = name;
        this.scene.add(this.cloud);
    }

    loadIsland() {
        var geometry = new THREE.CylinderGeometry( 50, 50, 10, 32 );
        var textureSand = this.loaderTextures.load('assets/island/sand-texture.jpg');
        var materialSand = new THREE.MeshLambertMaterial({map: textureSand, needsUpdate: true});
        var cylinder = new THREE.Mesh( geometry, materialSand );
        cylinder.position.x = - 150;
        cylinder.position.z = - 110;
        cylinder.position.y = - 3;
        this.scene.add( cylinder );
    }

    loadDolphin1() {
        var textureDolphin = this.loaderTextures.load('assets/dolphin/Dolphin-texture6.jpg');
        var materialDolphin = new THREE.MeshLambertMaterial({map: textureDolphin, needsUpdate: true});
        
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;
        //loader.setPath( 'asssets/dolphin/' );
        loader3ds.load( 'assets/dolphin/DOLPHIN.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialDolphin;
                }
            } );

            //object.position.x = - 60;
            //object.position.y = 60;
            let obj = object;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 16;
            obj.scale.y = 16;
            obj.scale.z = 16;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );

    }
    loadDolphin2() {
        var textureDolphin = this.loaderTextures.load('assets/dolphin/Dolphin-texture6.jpg');
        var materialDolphin = new THREE.MeshLambertMaterial({map: textureDolphin, needsUpdate: true});
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;
        loader3ds.load( 'assets/dolphin/DOLPHIN.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialDolphin;
                }
            } );

            let obj = object;
            obj.position.x = 10;
            obj.position.y = 10;
            obj.position.z = 15;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 16;
            obj.scale.y = 16;
            obj.scale.z = 16;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    loadDolphin3() {
        var textureDolphin = this.loaderTextures.load('assets/dolphin/Dolphin-texture6.jpg');
        var materialDolphin = new THREE.MeshLambertMaterial({map: textureDolphin, needsUpdate: true});
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;
        loader3ds.load( 'assets/dolphin/DOLPHIN.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialDolphin;
                }
            } );

            let obj = object;
            obj.position.x = -10;
            obj.position.z = 30;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 16;
            obj.scale.y = 16;
            obj.scale.z = 16;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    loadBird1() {
        var textureBird = this.loaderTextures.load('assets/bird/bird-texture.jpg');
        var materialBird = new THREE.MeshLambertMaterial({map: textureBird, needsUpdate: true});
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;  
        loader3ds.load( 'assets/bird/flying-bird.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialBird;
                }
            } );

            let obj = object;
            obj.position.x = 50;
            obj.position.y = 50;
            obj.position.z = -50;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 1;
            obj.scale.y = 1;
            obj.scale.z = 1;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    loadBird2() {
        var textureBird = this.loaderTextures.load('assets/bird/bird-texture.jpg');
        var materialBird = new THREE.MeshLambertMaterial({map: textureBird, needsUpdate: true});
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;  
        loader3ds.load( 'assets/bird/flying-bird.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialBird;
                }
            } );

            let obj = object;
            obj.position.x = 55;
            obj.position.y = 55;
            obj.position.z = -55;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 1;
            obj.scale.y = 1;
            obj.scale.z = 1;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    loadBird3() {
        var textureBird = this.loaderTextures.load('assets/bird/bird-texture.jpg');
        var materialBird = new THREE.MeshLambertMaterial({map: textureBird, needsUpdate: true});
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;  
        loader3ds.load( 'assets/bird/flying-bird.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialBird;
                }
            } );

            let obj = object;
            obj.position.x = 40;
            obj.position.y = 50;
            obj.position.z = -40;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 1;
            obj.scale.y = 1;
            obj.scale.z = 1;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    loadPalmTree() {
        var texturePalmTree = this.loaderTextures.load( 'assets/palm-tree/Bottom_T.jpg' );
        var materialPalmTree = new THREE.MeshLambertMaterial({map: texturePalmTree, needsUpdate: true});
        var loaderObj = new THREE.OBJLoader( this.manager );
        let parent = this;              
        loaderObj.load( 'assets/palm-tree/palm_tree.obj', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialPalmTree;
                }
            } );
            
            let obj = object;

            obj.position.x = - 150;
            obj.position.z = - 135;
            obj.position.y = 3;
            //obj.rotation.y = 90* Math.PI / 180;
            obj.scale.x = 4.0;
            obj.scale.y = 4.0;
            obj.scale.z = 4.0;
            
            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    loadTree() {

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'assets/tree/' );
        let parent = this;
        mtlLoader.load( 'Tree.mtl', function( materials ) {
            materials.preload();
            var loaderObj = new THREE.OBJLoader( parent.manager );
            loaderObj.setMaterials( materials );
            loaderObj.setPath( 'assets/tree/' );
            loaderObj.load( 'Tree.obj', function ( object ) {
                let obj = object;

                obj.position.x = - 160;
                obj.position.z = - 145;
                obj.position.y = 3;
                
                parent.scene.add( obj );
            }, parent.onProgress, parent.onError );
        });
    }
    loadPenguin() {
        var normalPenguin = this.loaderTextures.load( 'assets/penguin/TPenguin_Normal.png' );
        var texturePenguin = this.loaderTextures.load('assets/penguin/TPenguin_Diffuse.png');
        var loaderObj = new THREE.OBJLoader( this.manager );
        var materialPenguin = new THREE.MeshLambertMaterial({map: texturePenguin, normalMap: normalPenguin, needsUpdate: true});
        let parent = this;              
        loaderObj.load( 'assets/penguin/Penguin.obj', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialPenguin;
                }
            } );
            
            let obj = object;

            obj.position.x = - 150;
            obj.position.z = - 110;
            obj.position.y = 2;
            obj.rotation.y = 90* Math.PI / 180;
            obj.scale.x = 0.3;
            obj.scale.y = 0.3;
            obj.scale.z = 0.3;
            
            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
    setWater() {
        var waterGeometry = new THREE.PlaneBufferGeometry( this.parameters.oceanSide * 5, this.parameters.oceanSide * 5 );
        this.water = new THREE.Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'assets/textures/waternormals.jpg', function ( texture ) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                alpha: this.parameters.alpha,
                sunDirection: this.light.position.clone().normalize(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: this.parameters.distortionScale,
                fog: this.scene.fog !== undefined
            }
        );
        this.water.rotation.x = - Math.PI / 2;
        this.water.receiveShadow = true;
        this.scene.add( this.water );
    }
    setSkybox() {
        var cubeTextureLoader = new THREE.CubeTextureLoader();
        cubeTextureLoader.setPath( 'assets/textures/cube/skyboxsun25deg/' );
        let cubeMap = cubeTextureLoader.load( [
            'px.jpg', 'nx.jpg',
            'py.jpg', 'ny.jpg',
            'pz.jpg', 'nz.jpg',
        ] );
        var cubeShader = THREE.ShaderLib[ 'cube' ];
        cubeShader.uniforms[ 'tCube' ].value = cubeMap;
        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            side: THREE.BackSide
        } );
        var skyBoxGeometry = new THREE.BoxBufferGeometry(
            this.parameters.oceanSide * 5 + 100,
            this.parameters.oceanSide * 5 + 100,
            this.parameters.oceanSide * 5 + 100 );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        this.scene.add( skyBox );
    }

    animate() {
        console.log("render");
        requestAnimationFrame( this.animate );
        this.render( this.clock.getDelta() );
        //stats.update();
    }
    render( dt ) {
        //var time = performance.now() * 0.001;
        this.water.material.uniforms.time.value += 1.0 / 60.0;
        this.water.material.uniforms.size.value = this.parameters.size;
        this.water.material.uniforms.distortionScale.value = this.parameters.distortionScale;
        this.water.material.uniforms.alpha.value = this.parameters.alpha;

        this.particleGroup.tick( dt );

        console.log(this.clock.getDelta())

        //this.light.position.set( - 30, 30, 30 );

        //this.engine.update( 0.01 * 0.5 );

        //setTimeout(this.renderRain, 3000);

        this.renderer.render( this.scene, this.camera );
    }

    renderRain() {
        if(this.cloud) {
            var vertices = this.cloud.geometry.vertices;
            vertices.forEach(function (v) {
                v.y = v.y - (v.velocityY);
                v.x = v.x - (v.velocityX);
                if (v.y <= 0) v.y = 60;
                if (v.x <= -20 || v.x >= 20) v.velocityX = v.velocityX * -1;
            });
        }
        
        this.rainControls.redraw();
    }

}