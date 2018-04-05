import { AfterViewInit, OnInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as dat from './js/dat.gui.min';
import * as Stats from './js/stats.min';
import * as THREE from 'three';
import "./js/EnableThree";
import * as TWEEN from '@tweenjs/tween.js';
import "./js/EnableTween";
import "three/examples/js/objects/Water";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/TDSLoader";
import "three/examples/js/loaders/OBJLoader";
import "three/examples/js/loaders/MTLLoader";
import "three/examples/js/loaders/STLLoader";
import "three/examples/js/objects/Sky";

//import * as ParticleEngine from './js/ParticleEngine';

//declare var ParticleEngine: any;

//declare var Type:any;

// http://squarefeet.github.io/ShaderParticleEngine/
declare var SPE: any;


@Component({
    selector: 'scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit, AfterViewInit {

    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;

    private loaderTextures: THREE.TextureLoader;

    private controls: THREE.OrbitControls;

    private manager: THREE.LoadingManager;

    private clock = new THREE.Clock();

    private light: THREE.DirectionalLight;

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    // parameters ocean
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
    // scene objects
    water;
    cloud;
    sunSphere;
    sky;
    particleGroupSnow;
    emitterSnow;
    particleGroupClouds;
    emitterClouds;
    
    // parameters configuration
    dtIncrement: number = 0;
    esNegatiu: boolean = false;

    constructor() {
        this.createManagements();
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createManagements() {
        this.render = this.render.bind(this);
        this.animate = this.animate.bind(this);

        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        this.loaderTextures = new THREE.TextureLoader( this.manager );
    }

    private createScene() {
        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.FogExp2( 0xaabbbb, 0.002 );
        //this.scene.add(new THREE.AxisHelper(200));
    }

    private createLights() {
        this.light = new THREE.DirectionalLight( 0xffffff, 0.8 );
        this.light.position.set( - 1000, 1000, 1000 );
        
        this.light.castShadow = true;
        this.light.shadow.camera.visible = true;

        this.light.shadow.camera.top = 200;
        this.light.shadow.camera.right = 200;
        this.light.shadow.camera.left = -200
        this.light.shadow.camera.bottom = -200;

        this.light.shadow.camera.near = 1;
        this.light.shadow.camera.far = 20000;

        this.scene.add( this.light );

        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );

        this.scene.add( ambientLight );
    }

    private createCamera() {
        this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth/window.innerHeight, 1, 2000000 );
        this.camera.position.set( 30, 30, 100 );
    }

    private createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth - 2, window.innerHeight - 6 );
        this.renderer.shadowMap.enabled = true;
    }

    private getAspectRatio(): number {
        let height = window.innerHeight;
        if (height === 0) {
            return 0;
        }
        return window.innerWidth/window.innerHeight;
    }

    // Creacio de nuvols
    initParticlesClouds() {
        this.particleGroupClouds = new SPE.Group({
            texture: {
                value: this.loaderTextures.load('assets/textures/cloud.png')
            },
            blending: THREE.NormalBlending,
            fog: true,
            maxParticleCount: 3000
        });
        this.emitterClouds = new SPE.Emitter({
            particleCount: 1500,
            maxAge: {
                value: 2,
            },
            position: {
                value: new THREE.Vector3( 0, 400, 0 ),
                spread: new THREE.Vector3( 4000, 300, 4000 )
            },
            velocity: {
                value: new THREE.Vector3( 0, 0, 30 )
            },
            wiggle: {
                spread: 10
            },
            size: {
                value: 75,
                spread: 50
            },
            opacity: {
                value: [ 0, 1, 0 ]
            },
            color: {
                value: new THREE.Color( 1, 1, 1 ),
                spread: new THREE.Color( 0.1, 0.1, 0.1 )
            },
            angle: {
                value: [ 0, Math.PI * 0.125 ]
            }
        });
        this.particleGroupClouds.addEmitter( this.emitterClouds );
        this.scene.add( this.particleGroupClouds.mesh );
    }

    private getRandomNumber( base ) {
        return Math.abs(Math.random() * base - (base/2));
    }
    
    // Creacio de neu / pluja
    public initParticlesSnow() {
        this.particleGroupSnow = new SPE.Group({
            texture: {
                value: this.loaderTextures.load('assets/textures/smokeparticle.png')
            },
            fog: true,
            maxParticleCount: 320000
        });
        this.emitterSnow = new SPE.Emitter({
            type: SPE.distributions.BOX,
            maxAge: 2,
            position: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3( 4000, 300, 4000 )
            },
            velocity: {
                value: new THREE.Vector3( 0, (-1.0)*this.getRandomNumber(30), 0 )
            },
            particleCount: 160000,
            isStatic: false
        });
        this.particleGroupSnow.addEmitter( this.emitterSnow );
        this.scene.add( this.particleGroupSnow.mesh );
    }

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
        let trobat = false;
        let parent = this;
        intersects.forEach((i) => {
            console.log(i.object); // do what you want to do with object
            //i.object.position.y = i.object.position.y + 1;
            if(parent.elementTrobat(i.object)) {
                trobat = true;
            }
            if(trobat) {
                //if(i.material)  i.material.color = new THREE.Color(0xf2b640);
                //let myWindow = window.open("https://davidmartinezros.com/main", "", "width=100, height=100");
                return;
            }
                 
        });
    }

    private elementTrobat(i) {
        if(((i.name == "dolphin") || (i.name == "bird") || (i.name == "penguin") || (i.name == "bear") || (i.name == "leopardo") || (i.name == "tiger"))
        && i.position.x != this.controls.target.x && i.position.y != this.controls.target.y && i.position.z != this.controls.target.z) {
            
            this.ferTweenElement(i);

            this.createBoundingBox(i);

            this.createText(i.name, this.box.geometry.boundingSphere);

            this.render();

            //if(i.material)  i.material.color = new THREE.Color(0xf2b640);

            //if(i.material)  i.material.color = null;
            return true;
        } else if(i.parent && i.parent != null) {
            return this.elementTrobat(i.parent);
        } else {
            return false;
        }
    }

    box;

    private createBoundingBox(object) {
        this.scene.remove( this.box );
        this.box = new THREE.BoxHelper( object, 0xffff00 );
        this.scene.add( this.box );
    }

    private ferTweenElement(object) {

        console.log(object.name);

        let parent = this;
        
        var coords1 = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        
        var tween1 = new TWEEN.Tween(coords1) // Create a new tween that modifies 'coords1'.
            .to({
                x: object.position.x + 30,
                y: object.position.y + 30,
                z: object.position.z + 100
            }, 4000)
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onUpdate(function() { // Called after tween.js updates 'coords'.
                parent.camera.position.x = coords1.x;
                parent.camera.position.y = coords1.y;
                parent.camera.position.z = coords1.z;
                parent.camera.lookAt(object.position);
            })
            .start(); // Start the tween immediately.

        tween1.onComplete(function() {
            console.log("complete1");
        });

        var coords2 = {
            x: this.controls.target.x,
            y: this.controls.target.y,
            z: this.controls.target.z
        };

        var tween2 = new TWEEN.Tween(coords2) // Create a new tween that modifies 'coords2'.
            .to({
                x: object.position.x,
                y: object.position.y,
                z: object.position.z
            }, 4000)
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onUpdate(function() { // Called after tween.js updates 'coords'.
                parent.controls.target.x = coords2.x;
                parent.controls.target.y = coords2.y;
                parent.controls.target.z = coords2.z;
            })
            .start(); // Start the tween immediately.

        tween2.onComplete(function() {
            console.log("complete2");
        });
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

        console.log("onResize: " + (window.innerWidth - 2) + ", "  + (window.innerHeight - 6));

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth - 2, window.innerHeight - 6);
        this.render();
    }

    @HostListener('document:keypress', ['$event'])
    public onKeyPress(event: KeyboardEvent) {
        console.log("onKeyPress: " + event.key);
    }

    ngAfterViewInit() {
        requestAnimationFrame( this.animate );
    }
    
    /* LIFECYCLE */
    ngOnInit() {
        // Create Configuration
        this.createRenderer();
        this.createScene();
        this.createCamera();
        this.createLights();

        // Init Options
        this.initOptionsEvents();
        //this.initOptionsParameters();

        // Create Scene
        this.createSky();
        this.createWater();
        this.createTerrain();
        //this.loadIsland();
        //this.createIsland2();
        //this.loadPalmTree();
        //this.loadTree();

        // Load Animals
        this.loadDolphins();
        this.loadBirds();
        this.loadPenguin();
        //this.loadBear();
        this.loadPolarBear();
        //this.loadLeopardo();
        //this.loadTiger();

        // Init Snow and Clouds Particles
        this.initParticlesSnow();
        this.initParticlesClouds();
    }

    onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete) + '% downloaded' );
        }
    };
    onError = function ( xhr ) {
        console.log(xhr);
    };

    private initOptionsEvents() {
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.controls.maxPolarAngle = Math.PI * 0.495;
        //this.controls.target.set( 0, 0, 0 );
        this.controls.enablePan = true;
        this.controls.minDistance = 40.0;
        this.controls.maxDistance = 200.0;
    }

    private initOptionsParameters() {
        var gui = new dat.GUI();
        gui.add( this.parameters, 'distortionScale', 0, 8, 0.1 );
        gui.add( this.parameters, 'size', 0.1, 10, 0.1 );
        gui.add( this.parameters, 'alpha', 0.9, 1, .001 );
        //gui.add( this.rainControls, 'sizeRain', 0, 20).onChange(this.rainControls.redraw);;
        //gui.add( this.rainControls, 'transparentRain').onChange(this.rainControls.redraw);;
        //gui.add( this.rainControls, 'opacityRain', 0, 1).onChange(this.rainControls.redraw);;
        //gui.addColor( this.rainControls, 'colorRain').onChange(this.rainControls.redraw);;
        //gui.add( this.rainControls, 'sizeAttenuationRain').onChange(this.rainControls.redraw);
    }

    private createSky() {
/*
        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        light.position.x = -1000;
        light.position.y = 10000;
        light.position.z = -1000;
        light.castShadow = true;
        this.scene.add( light );
*/
        // per fer el sol
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
        //
        this.sky = new THREE.Sky();
        this.sky.scale.setScalar( 450000 );
        this.scene.add( this.sky );

        var textureSun = this.loaderTextures.load('assets/textures/luna.jpg');
        var materialSun = new THREE.MeshBasicMaterial({map: textureSun, needsUpdate: true});
        // Add Sun Helper
        /*
        this.sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        */
        this.sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            materialSun
        );
        this.sunSphere.castShadow = true;
		this.sunSphere.receiveShadow = true;
        this.sunSphere.position.y = - 700000;
        this.sunSphere.visible = false;
        this.scene.add( this.sunSphere );

        var effectController  = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, // Facing front,
            sun: ! true
        };

        function guiChanged() {

            var distance = 100;
            
            //var uniforms = this.sky.material.uniforms;
            var uniforms = this.sky.material.uniforms;
            uniforms.turbidity.value = effectController.turbidity;
            uniforms.rayleigh.value = effectController.rayleigh;
            uniforms.luminance.value = effectController.luminance;
            uniforms.mieCoefficient.value = effectController.mieCoefficient;
            uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
            var theta = Math.PI * ( effectController.inclination - 0.5 );
            var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
            this.sunSphere.position.x = distance * Math.cos( phi );
            this.sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
            this.sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
            this.sunSphere.visible = effectController.sun;
            uniforms.sunPosition.value.copy( this.sunSphere.position );
            this.renderer.render( this.scene, this.camera );
        }
    }

    createTerrain() {
        var textureTerrain = this.loaderTextures.load( 'assets/snow-terrain/686.jpg' );
        var materialTerrain = new THREE.MeshLambertMaterial({map: textureTerrain, needsUpdate: true});
        var loader3ds = new THREE.TDSLoader( this.manager );
        let parent = this;
        loader3ds.load( 'assets/snow-terrain/SnowTerrain.3ds', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialTerrain;
                    child.receiveShadow = true;
                }
            } );
            let obj = object;
            obj.position.x = 150;
            obj.position.y = -110;
            //obj.position.y = -70;
            obj.position.z = -1000;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = Math.PI / 2;            
            //obj.rotation.x = - Math.PI / 2;
            //obj.rotation.z = Math.PI / 2;
            //obj.rotation.y = - Math.PI / 2;
            obj.scale.x = 32;
            obj.scale.y = 32;
            obj.scale.z = 32;

            obj.receiveShadow = true;
 
            parent.scene.add( obj );
            //parent.scene.add(object);
        }, parent.onProgress, parent.onError );
    }
/*
    createIsland2() {
        let parent = this;
        var loaderObj = new THREE.TDSLoader( parent.manager );
        loaderObj.setPath( 'assets/island2/' );
        loaderObj.load( 'assets/island2/island.3ds', function ( object ) {
            let obj = object;
            obj.position.x = 150;
            obj.position.y = -70;
            obj.position.z = -1000;
            //obj.rotation.x = - Math.PI / 2;
            //obj.rotation.z = Math.PI / 2;
            //obj.rotation.y = - Math.PI / 2;
            obj.scale.x = 32;
            obj.scale.y = 32;
            obj.scale.z = 32;

            parent.scene.add( obj );
        }, parent.onProgress, parent.onError );
    }
    */
    /*
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
    */
    loadDolphins() {
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

            let obj = object.clone();
            obj.name = "dolphin";
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 16;
            obj.scale.y = 16;
            obj.scale.z = 16;

            obj.castShadow = true;

            obj = obj.clone();
            obj.position.x = 0;
            obj.position.y = 0;
            obj.position.z = 0;
            parent.scene.add( obj );

            obj = obj.clone();
            obj.position.x = 10;
            obj.position.y = 10;
            obj.position.z = 15;
            parent.scene.add( obj );
/*
            parent.createBoundingBox(obj);
            parent.createText(obj.name, parent.box.geometry.boundingSphere);
*/
            obj = obj.clone();
            obj.position.x = -10;
            obj.position.y = 0;
            obj.position.z = 30;
            parent.scene.add( obj );

        }, parent.onProgress, parent.onError );
    }

    loadBirds() {
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
            obj.name = "bird";
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 1;
            obj.scale.y = 1;
            obj.scale.z = 1;

            obj.castShadow = true;

            obj = obj.clone();
            obj.position.x = 50;
            obj.position.y = 50;
            obj.position.z = -50;
            parent.scene.add( obj );

            obj = obj.clone();
            obj.position.x = 55;
            obj.position.y = 55;
            obj.position.z = -55;
            parent.scene.add( obj );

            obj = obj.clone();
            obj.position.x = 40;
            obj.position.y = 50;
            obj.position.z = -40;
            parent.scene.add( obj );

        }, parent.onProgress, parent.onError );
    }
    /*
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
    */
    /*
    loadBear() {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'assets/bear/' );
        let parent = this;
        mtlLoader.load( 'BearNew.mtl', function( materials ) {
            materials.preload();
            var loaderObj = new THREE.OBJLoader( parent.manager );
            loaderObj.setMaterials( materials );
            loaderObj.setPath( 'assets/bear/' );
            loaderObj.load( 'BearNew.obj', function ( object ) {
                let obj = object;
                obj.name = "bear";
                obj.position.x = - 170;
                obj.position.z = - 205;
                obj.position.y = 5;
                obj.rotation.y = - Math.PI/2;
                obj.scale.x = 0.3;
                obj.scale.y = 0.3;
                obj.scale.z = 0.3;
                
                parent.scene.add( obj );
            }, parent.onProgress, parent.onError );
        });
    }
    */
    loadPolarBear() {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'assets/Polar-Bear2/' );
        let parent = this;
        mtlLoader.load( 'polar_bear.mtl', function( materials ) {
            materials.preload();
            var loaderObj = new THREE.OBJLoader( parent.manager );
            loaderObj.setMaterials( materials );
            loaderObj.setPath( 'assets/Polar-Bear2/' );
            loaderObj.load( 'polar_bear.obj', function ( object ) {
                object.traverse( function( node ) {
                    if ( node instanceof THREE.Mesh ) { 
                        node.castShadow = true;
                    } 
                });
                let obj = object;
                obj.name = "bear";
                obj.position.x = - 250;
                obj.position.z = - 230;
                obj.position.y = 11;
                //obj.rotation.y = - Math.PI;
                obj.rotation.z = - Math.PI/20;
                obj.scale.x = 0.5;
                obj.scale.y = 0.5;
                obj.scale.z = 0.5;
                
                obj.castShadow = true;

                parent.scene.add( obj );
            }, parent.onProgress, parent.onError );
        });
    }

    loadLeopardo() {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'assets/leopardo/' );
        let parent = this;
        mtlLoader.load( 'leopardo.mtl', function( materials ) {
            materials.preload();
            var loaderObj = new THREE.OBJLoader( parent.manager );
            loaderObj.setMaterials( materials );
            loaderObj.setPath( 'assets/leopardo/' );
            loaderObj.load( 'leopardo.obj', function ( object ) {
                let obj = object;
                obj.name = "leopardo";
                obj.position.x = 30;
                obj.position.z = - 205;
                obj.position.y = 30;
                obj.rotation.y = - Math.PI;
                obj.scale.x = 0.3;
                obj.scale.y = 0.3;
                obj.scale.z = 0.3;

                obj.castShadow = true;
                
                parent.scene.add( obj );
            }, parent.onProgress, parent.onError );
        });
    }

    loadTiger() {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'assets/tiger/' );
        let parent = this;
        mtlLoader.load( 'tiger.mtl', function( materials ) {
            materials.preload();
            var loaderObj = new THREE.OBJLoader( parent.manager );
            loaderObj.setMaterials( materials );
            loaderObj.setPath( 'assets/tiger/' );
            loaderObj.load( 'tiger.obj', function ( objectTiger ) {
                let objTiger = objectTiger;
                objTiger.name = "tiger";
                objTiger.position.x = - 350;
                objTiger.position.y = 45;
                objTiger.position.z = - 1170;
                objTiger.rotation.y = 45* Math.PI / 180;
                objTiger.scale.x = 0.5;
                objTiger.scale.y = 0.5;
                objTiger.scale.z = 0.5;

                objTiger.castShadow = true;
                
                parent.scene.add( objTiger );
            }, parent.onProgress, parent.onError );
        });

        // per animar un objecte, aqui tinc un exemple de threejs.org
        // https://threejs.org/examples/#webgl_animation_skinning_morph
        // mirar si ho puc fer
    }

    text = "three.js";
    height = 5;
    size = 5;
    hover = 0;
    curveSegments = 4;
    bevelThickness = 0.1;
    bevelSize = 0.5;
    bevelSegments = 1;
    bevelEnabled = true;
    font = undefined;
    fontName = "optimer"; // helvetiker, optimer, gentilis, droid sans, droid serif
    fontWeight = "regular"; // normal bold

    materials = [
        new THREE.MeshPhongMaterial( { color: 0x264d24, flatShading: true } ), // front
        new THREE.MeshPhongMaterial( { color: 0x569c53 } ) // side
    ];

    textMesh1;

    createText(text, boundingSphere) {
        if ( !text ) return;
        if(this.box) {
            let parent = this;
            var loader = new THREE.FontLoader();
            loader.load( 'assets/fonts/' + parent.fontName + '_' + parent.fontWeight + '.typeface.json', function ( response ) {
                debugger;
                parent.font = response;

                let textGeo = new THREE.TextGeometry( text, 
                {
                    font: parent.font,
                    size: parent.size,
                    height: parent.height,
                    curveSegments: parent.curveSegments,
                    bevelThickness: parent.bevelThickness,
                    bevelSize: parent.bevelSize,
                    bevelEnabled: parent.bevelEnabled
                });
                textGeo.computeBoundingBox();
                textGeo.computeVertexNormals();
                // "fix" side normals by removing z-component of normals for side faces
                // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
                if ( ! parent.bevelEnabled ) {
                    var triangleAreaHeuristics = 0.1 * ( parent.height * parent.size );
                    for ( var i = 0; i < textGeo.faces.length; i ++ ) {
                        var face = textGeo.faces[ i ];
                        if ( face.materialIndex == 1 ) {
                            for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
                                face.vertexNormals[ j ].z = 0;
                                face.vertexNormals[ j ].normalize();
                            }
                            var va = textGeo.vertices[ face.a ];
                            var vb = textGeo.vertices[ face.b ];
                            var vc = textGeo.vertices[ face.c ];
                            var s = THREE.GeometryUtils.triangleArea( va, vb, vc );
                            if ( s > triangleAreaHeuristics ) {
                                for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
                                    face.vertexNormals[ j ].copy( face.normal );
                                }
                            }
                        }
                    }
                }
                var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
                parent.scene.remove( parent.textMesh1 );
                parent.textMesh1 = new THREE.Mesh( textGeo, parent.materials );
                parent.textMesh1.position.x = boundingSphere.center.x + centerOffset;
                parent.textMesh1.position.y = boundingSphere.center.y + boundingSphere.radius + parent.hover;
                parent.textMesh1.position.z = boundingSphere.center.z;
                parent.textMesh1.rotation.x = 0;
                parent.textMesh1.rotation.y = Math.PI * 2;
                parent.scene.add( parent.textMesh1 );
            } );
        }
    }

    /*
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
    */
    loadPenguin() {
        var normalPenguin = this.loaderTextures.load( 'assets/penguin/TPenguin_Normal.png' );
        var texturePenguin = this.loaderTextures.load('assets/penguin/TPenguin_Diffuse.png');
        var loaderObj = new THREE.OBJLoader( this.manager );
        var materialPenguin = new THREE.MeshLambertMaterial({map: texturePenguin, needsUpdate: true});
        let parent = this;              
        loaderObj.load( 'assets/penguin/Penguin.obj', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialPenguin;
                }
            } );
            
            let obj = object;
            obj.name = "penguin";
            obj.position.x = - 600;
            obj.position.y = 13;
            obj.position.z = - 1170;
            obj.rotation.y = 45* Math.PI / 180;
            obj.scale.x = 0.3;
            obj.scale.y = 0.3;
            obj.scale.z = 0.3;
            
            parent.scene.add( obj );

            obj = obj.clone();
            obj.position.x = 800;
            obj.position.y = 16;
            obj.position.z = - 720;
            obj.rotation.y = 65* Math.PI / 180;
            parent.scene.add( obj );

            obj = obj.clone();
            obj.position.x = 820;
            obj.position.y = 14;
            obj.position.z = - 690;
            obj.scale.x = 0.2;
            obj.scale.y = 0.2;
            obj.scale.z = 0.2;
            obj.rotation.y = 15* Math.PI / 180;
            parent.scene.add( obj );

        }, this.onProgress, this.onError );
    }

    createWater() {
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

    animate(time) {
        requestAnimationFrame( this.animate );
        TWEEN.update(time);
        this.render();
    }

    quantitatDeDies: number = 1;

    render() {
        //console.log(this.clock.getElapsedTime())
        
        if(this.water) {
            this.water.material.uniforms.time.value += 1.0 / 60.0;
            this.water.material.uniforms.size.value = this.parameters.size;
            this.water.material.uniforms.distortionScale.value = this.parameters.distortionScale;
            this.water.material.uniforms.alpha.value = this.parameters.alpha;
        }
        /*
        if(this.controls.target) {
            console.log(this.controls.target)
            if(this.emitterClouds) {
                this.emitterClouds.position.value.x = this.controls.target.x;
                this.emitterClouds.position.value.z = this.controls.target.z;
                if(!this.emitterSnow.position.value.y) {
                    this.emitterSnow.position.value.y = 0;
                }
                console.log(this.emitterClouds.position);
            }

            if(this.emitterSnow) {
                this.emitterSnow.position.value.x = this.controls.target.x;
                this.emitterSnow.position.value.z = this.controls.target.z;
                if(!this.emitterSnow.position.value.y) {
                    this.emitterSnow.position.value.y = 0;
                }
                console.log(this.emitterSnow.position);
            }
        }
        */
        if(this.particleGroupSnow) {
            this.particleGroupSnow.tick( this.clock.getDelta() );
        }
        if(this.particleGroupClouds) {
            this.particleGroupClouds.tick( this.clock.getDelta() );
        }
        //console.log(Math.round(this.clock.getElapsedTime()));
        
        if(this.sunSphere) {
            var distance = 100;
            var range = 100.0;

            let dt = this.clock.getElapsedTime();
            //console.log("dt abans:" + dt);
            if(dt - range*this.quantitatDeDies > 0) {
                this.esNegatiu = !this.esNegatiu;
                this.dtIncrement += range;
                this.quantitatDeDies += 1;
            }
            dt -= this.dtIncrement;
            if(this.esNegatiu) {
                dt = (-1.0)*dt;
            }
            //console.log("dt:" + dt);
            //
            let percent = (dt - 0.0) / (range - 0.0);
            let inclination = percent * (0.5 - 0.25) + 0.25;
            let azimuth  = percent * (0.5 - 0.0) + 0.0;
            //
            var uniforms = this.sky.material.uniforms;
            var theta = Math.PI * ( inclination - 0.5 );
            var phi = 2 * Math.PI * ( azimuth - 0.5 );
            this.sunSphere.position.x = distance * Math.cos( phi );
            this.sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
            this.sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
            this.sunSphere.visible = true;
            uniforms.sunPosition.value.copy( this.sunSphere.position );
        }

        this.renderer.render( this.scene, this.camera );
    }

}