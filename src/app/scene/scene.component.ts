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
    particleGroup;
    particleGroupClouds;
    
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
        this.scene.fog = new THREE.FogExp2( 0xaabbbb, 0.002 );
        //this.scene.add(new THREE.AxisHelper(200));
    }

    private createLights() {
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
    }

    private createCamera() {
        this.camera = new THREE.PerspectiveCamera( 55, (window.innerWidth - 16)/(window.innerHeight - 16), 1, 2000000 );
        this.camera.position.set( 30, 30, 100 );
    }

    private createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth - 16, window.innerHeight - 16 );
        this.renderer.shadowMap.enabled = true;
    }

    private getAspectRatio(): number {
        let height = window.innerHeight - 16;
        if (height === 0) {
            return 0;
        }
        return (window.innerWidth - 16)/(window.innerHeight - 16);
    }

    // Creacio de nuvols
    initParticlesClouds() {
        this.particleGroupClouds = new SPE.Group({
            texture: {
                value: THREE.ImageUtils.loadTexture('assets/textures/cloud.png')
            },
            blending: THREE.NormalBlending,
            fog: true
        });
        let emitter = new SPE.Emitter({
            particleCount: 750,
            maxAge: {
                value: 2,
            },
            position: {
                value: new THREE.Vector3( 0, 200, 0 ),
                spread: new THREE.Vector3( 600, 300, 600 )
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
        this.particleGroupClouds.addEmitter( emitter );
        this.scene.add( this.particleGroupClouds.mesh );
    }

    private getRandomNumber( base ) {
        return Math.abs(Math.random() * base - (base/2));
    }
    
    // Creacio de neu / pluja
    public initParticlesSnow() {
        this.particleGroup = new SPE.Group({
            texture: {
                value: this.loaderTextures.load('assets/textures/smokeparticle.png')
            },
            fog: true
        });
        let emitter = new SPE.Emitter({
            type: SPE.distributions.BOX,
            maxAge: 2,
            position: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3( 300, 300, 300 )
            },
            velocity: {
                value: new THREE.Vector3( 0, (-1.0)*this.getRandomNumber(30), 0 )
            },
            particleCount: 30000,
            isStatic: false
        });
        this.particleGroup.addEmitter( emitter );
        this.scene.add( this.particleGroup.mesh );
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
        intersects.forEach((i) => {
            console.log(i.object); // do what you want to do with object
            //i.object.position.y = i.object.position.y + 1;
            if(elementTrobat.bind(this)(i.object)) {
                trobat = true;
            }
            if(trobat) {
                //if(i.material)  i.material.color = new THREE.Color(0xf2b640);
                //let myWindow = window.open("https://davidmartinezros.com/main", "", "width=100, height=100");
                return;
            }
                 
        });

        function elementTrobat(i) {
            if((i.name == "dolphin") || (i.name == "bird") || (i.name == "penguin") || (i.name == "bear")) {
                //this.camera.lookAt( i.position );
                //this.camera.position.set(i.position.x + 100, i.position.y + 50, i.position.z + 100);
                
                //console.log(this.controls);
                //console.log(this.camera);
                
                var lookAtVector = new THREE.Vector3(0, 0, 1);
                lookAtVector.applyQuaternion(i.quaternion);
                console.log(lookAtVector);
                
                var rotateTween = new TWEEN.Tween(this.controls.target)
                    .to({
                        x: i.position.x,
                        y: i.position.y,
                        z: i.position.z
                    }, 4000)
                    .interpolation(TWEEN.Interpolation.CatmullRom)
                    .easing(TWEEN.Easing.Quintic.InOut)
                    .start();
                    /*
                new TWEEN.Tween(this.controls.target).to({
                    x: i.position.x,
                    y: i.position.y,
                    z: i.position.z}, 3000)
                    .onUpdate(function () {
                        this.controls.target.position.x = i.position.x;
                        this.controls.target.position.y = i.position.y;
                        this.controls.target.position.z = i.position.z;
                    }).start();
                    */

                var goTween = new TWEEN.Tween(this.camera.position)
                    .to({
                        x: i.position.x,
                        y: i.position.y,
                        z: i.position.z + 10
                    }, 4000)
                    .interpolation(TWEEN.Interpolation.CatmullRom)
                    .easing(TWEEN.Easing.Quintic.InOut);

                console.log(goTween)
                goTween.start(this.clock.getDelta());
                goTween.onComplete(function() {
                    console.log('done!');
                });
                
                goTween.onUpdate.bind(this, this.onCameraAnimUpdate)();
                goTween.onComplete.bind(this, this.onCameraAnimComplete)();
                goTween.start();


                this.controls.target.set( 
                    i.position.x,
                    i.position.y,
                    i.position.z + 10 );

                //if(i.material)  i.material.color = new THREE.Color(0xf2b640);

                //if(i.material)  i.material.color = null;
                return true;
            } else if(i.parent && i.parent != null) {
                return elementTrobat.bind(this)(i.parent);
            } else {
                return false;
            }
        }
        this.render();
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

        console.log("onResize: " + (window.innerWidth - 16) + ", "  + (window.innerHeight - 16));

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth - 16, window.innerHeight - 16);
        this.render();
    }

    @HostListener('document:keypress', ['$event'])
    public onKeyPress(event: KeyboardEvent) {
        console.log("onKeyPress: " + event.key);
    }

    ngAfterViewInit() {
        this.animate();
    }
    
    /* LIFECYCLE */
    ngOnInit() {
        // Create Configuration
        this.createRenderer();
        this.createScene();
        this.createCamera();
        this.createLights();

        // Create Scene
        this.createSky();
        this.createWater();
        this.createTerrain();
        //this.loadIsland();
        //this.loadPalmTree();
        //this.loadTree();

        // Load Animals
        this.loadDolphins();
        this.loadBirds();
        this.loadPenguin();
        //this.loadBear();

        // Init Snow and Clouds Particles
        this.initParticlesSnow();
        this.initParticlesClouds();

        // Init Options
        this.initOptionsEvents();
        this.initOptionsParameters();
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
        //this.controls.target.set( 0, 10, 0 );
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
        // per fer el sol
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
        //
        this.sky = new THREE.Sky();
        this.sky.scale.setScalar( 450000 );
        this.scene.add( this.sky );

        // Add Sun Helper
        this.sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
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
        //loader.setPath( 'asssets/dolphin/' );
        loader3ds.load( 'assets/snow-terrain/SnowTerrain.3ds', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialTerrain;
                }
            } );

            let obj = object;
            obj.position.x = 150;
            obj.position.y = -110;
            obj.position.z = -1000;
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = Math.PI / 2;
            //obj.rotation.y = - Math.PI / 2;
            obj.scale.x = 32;
            obj.scale.y = 32;
            obj.scale.z = 32;

            parent.scene.add( obj );
        }, this.onProgress, this.onError );
    }
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
        let obj;
        loader3ds.load( 'assets/dolphin/DOLPHIN.3DS', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialDolphin;
                }
            } );

            obj = object.clone();
            obj.name = "dolphin";
            obj.rotation.x = - Math.PI / 2;
            obj.rotation.z = - Math.PI / 2;
            obj.scale.x = 16;
            obj.scale.y = 16;
            obj.scale.z = 16;

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

            obj = obj.clone();
            obj.position.x = -10;
            obj.position.y = 0;
            obj.position.z = 30;
            parent.scene.add( obj );

        }, this.onProgress, this.onError );

        return obj;
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

        }, this.onProgress, this.onError );
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
        var materialPenguin = new THREE.MeshLambertMaterial({map: texturePenguin, normalMap: normalPenguin, needsUpdate: true});
        let parent = this;              
        loaderObj.load( 'assets/penguin/Penguin.obj', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = materialPenguin;
                }
            } );
            
            let obj = object;
            obj.name = "penguin";
            obj.position.x = - 180;
            obj.position.z = - 180;
            obj.position.y = 5;
            obj.rotation.y = 90* Math.PI / 180;
            obj.scale.x = 0.3;
            obj.scale.y = 0.3;
            obj.scale.z = 0.3;
            
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

    animate() {
        requestAnimationFrame( this.animate );
        this.render();
    }

    render() {
        //console.log(this.clock.getElapsedTime())
        
        if(this.water) {
            this.water.material.uniforms.time.value += 1.0 / 60.0;
            this.water.material.uniforms.size.value = this.parameters.size;
            this.water.material.uniforms.distortionScale.value = this.parameters.distortionScale;
            this.water.material.uniforms.alpha.value = this.parameters.alpha;
        }
        if(this.particleGroup) {
            this.particleGroup.tick( this.clock.getDelta() );
        }
        if(this.particleGroupClouds) {
            this.particleGroupClouds.tick( this.clock.getDelta() );
        }
        //console.log(Math.round(this.clock.getElapsedTime()));
        
        if(this.sunSphere) {
            var distance = 100;
            var range = 100.0;
            
            let dt = this.clock.getElapsedTime();
            if(dt != 0 && dt%range == 0) {
                this.esNegatiu = !this.esNegatiu;
                this.dtIncrement += range;
            }
            dt = dt - this.dtIncrement;
            if(this.esNegatiu) {
                dt = (-1.0)*dt;
            }
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

        TWEEN.update(this.clock.getDelta());

        this.renderer.render( this.scene, this.camera );
    }

}