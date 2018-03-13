import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/ColladaLoader";
import * as dat from './js/dat.gui.min';
import * as Stats from './js/stats.min';
//import * as THREE from './js/three';

declare var THREE;

declare var Ocean;

declare var Water;

declare var TDSLoader;

declare var OBJLoader;

@Component({
    selector: 'scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit {

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

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    constructor() {
        this.render = this.render.bind(this);
        this.renderControls = this.renderControls.bind(this);
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
       this.render();
    }

    animate() {
        requestAnimationFrame( this.animate );
        this.renderer.render( this.scene, this.camera );
    }

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

    public render() {
        console.log("render");

        var time = performance.now() * 0.001;

        //this.water.material.uniforms.time.value += 1.0 / 60.0;
        //this.water.material.uniforms.size.value = this.parameters.size;
        //this.water.material.uniforms.distortionScale.value = this.parameters.distortionScale;
        //this.water.material.uniforms.alpha.value = this.parameters.alpha;

        //this.makeModifications(this);

        this.updateOcean();

        this.renderer.render(this.scene, this.camera);

        //this.renderer.renderLists.dispose();

        setTimeout(() => {
            requestAnimationFrame(this.render)
        }, 300);

    }

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
        this.ms_Ocean = new Ocean(this.renderer, this.camera, this.scene,
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

    renderControls() {
        this.renderer.render( this.scene, this.camera );
    }

    public addControls() {
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.addEventListener('change', this.renderControls);

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
        intersects.forEach((i) => {
            console.log(i.object); // do what you want to do with object
            i.object.position.y = i.object.position.y + 1;
        });
        this.renderControls();
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
        this.renderControls();
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
        alpha: 1.0
    };
    /* LIFECYCLE */
    ngAfterViewInit() {
        //this.createScene();
        //funciona
        ////this.createMesh();
        ////no es veu
        ////this.createCube();
        //this.createLight();
        //this.createCamera();
        //this.startRendering();
        //this.addControls();
        ////no es veuen be els colors, pero el mar ja es veu ueeeee!!!
        //this.createOcean();
        ////this.animate();

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2( 0xaabbbb, 0.001 );
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

        this.setWater();
        
        this.setSkybox();

        this.loadDolphin1();

        this.loadDolphin2();
        
        this.loadDolphin3();
        
        this.loadBird();
        
        this.loadPenguin();

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.controls.maxPolarAngle = Math.PI * 0.495;
        this.controls.target.set( 0, 10, 0 );
        this.controls.enablePan = false;
        this.controls.minDistance = 40.0;
        this.controls.maxDistance = 200.0;
        this.camera.lookAt( this.controls.target );
        //
        //this.stats = new Stats();
        //container.appendChild( stats.dom );
        //
        var gui = new dat.GUI();
        gui.add( this.parameters, 'distortionScale', 0, 8, 0.1 );
        gui.add( this.parameters, 'size', 0.1, 10, 0.1 );
        gui.add( this.parameters, 'alpha', 0.9, 1, .001 );
        //
        //window.addEventListener( 'resize', onWindowResize, false );

        this.render();
    }

            loadDolphin1() {
                var loaderTextures = new THREE.TextureLoader();
                var normalDolphin = loaderTextures.load( 'assets/textures/waternormals.jpg' );
                var textureDolphin = loaderTextures.load('assets/dolphin/DOLPHIN.TIF');
                var materialDolphin = new THREE.MeshLambertMaterial({map: textureDolphin, normalMap: normalDolphin, needsUpdate: true});
                var loader3ds = new TDSLoader( );
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
                });

            }
			loadDolphin2() {
				var loaderTextures = new THREE.TextureLoader();
				var normalDolphin = loaderTextures.load( 'assets/textures/waternormals.jpg' );
				var textureDolphin = loaderTextures.load('assets/dolphin/DOLPHIN.TIF');
				var materialDolphin = new THREE.MeshLambertMaterial({map: textureDolphin, normalMap: normalDolphin, needsUpdate: true});
                var loader3ds = new TDSLoader( );
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
				});
			}
			loadDolphin3() {
				var loaderTextures = new THREE.TextureLoader();
				var normalDolphin = loaderTextures.load( 'assets/textures/waternormals.jpg' );
				var textureDolphin = loaderTextures.load('assets/dolphin/DOLPHIN.TIF');
				var materialDolphin = new THREE.MeshLambertMaterial({map: textureDolphin, normalMap: normalDolphin, needsUpdate: true});
                var loader3ds = new TDSLoader( );
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
				});
			}
			loadBird() {
				var loaderTextures = new THREE.TextureLoader();
				var normalBird = loaderTextures.load( 'assets/textures/waternormals.jpg' );
				var textureBird = loaderTextures.load('assets/dolphin/DOLPHIN.TIF');
				var materialBird = new THREE.MeshLambertMaterial({map: textureBird, normalMap: normalBird, needsUpdate: true});
                var loader3ds = new TDSLoader( );
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
				});
			}
			loadPenguin() {
				var loaderTextures = new THREE.TextureLoader();
				var normalPenguin = loaderTextures.load( 'assets/penguin/TPenguin_Normal.png' );
				var texturePenguin = loaderTextures.load('assets/penguin/TPenguin_Diffuse.png');
				var loaderObj = new OBJLoader();
                var materialPenguin = new THREE.MeshLambertMaterial({map: texturePenguin, normalMap: normalPenguin, needsUpdate: true});
                let parent = this;              
				loaderObj.load( 'assets/penguin/Penguin.obj', function ( object ) {
					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material = materialPenguin;
						}
					} );
					//object.position.y = - 95;
					//var scale = 0.1;
					//object.scale.set(scale, scale, scale);

					let obj = object;

					obj.position.x = - 60;
					obj.position.y = 60;
                    obj.rotation.x = 20* Math.PI / 180;
                    obj.rotation.z = 20* Math.PI / 180;
                    obj.scale.x = 0.001;
                    obj.scale.y = 0.001;
                    obj.scale.z = 0.001;
					
					parent.scene.add( obj );
				});
			}
			setWater() {
				var waterGeometry = new THREE.PlaneBufferGeometry( this.parameters.oceanSide * 5, this.parameters.oceanSide * 5 );
				this.water = new Water(
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

}