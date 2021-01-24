class WGeo {
  Grids = {};
  name (obj, pref="") {
      return pref+"!"+md5(JSON.stringify(obj));
  }
  posSetEqual(obj1, obj2) {
      obj1.position.set(obj2.position.x, obj2.position.y, obj2.position.z);
  }
  /**
   * change everything once, the version of entourage here is good
   * https://albertopiras.github.io/threeJS-object-controls/
   */
  constructor () {
      if (GeoInitialized)
          return GeoInitialized;

      let basic = () => {
          this.scene = new THREE.Scene();
          window.scene = this.scene

          //on group camera rotation - https://stackoverflow.com/questions/50060423/three-js-rotate-camera-separately-from-its-parent?rq=1
          this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000000 );

          this.renderer = new THREE.WebGLRenderer({alpha:true});
          this.renderer.setPixelRatio( window.devicePixelRatio );
          this.renderer.setSize( window.innerWidth, window.innerHeight );
          this.renderer.setClearColor(new THREE.Color('black'), 0)
          this.renderer.shadowMap.enabled = true;
          this.renderer.shadowMap.type = THREE.PCFShadowMap;

          this.labelRenderer = new THREE.CSS2DRenderer();
          this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
          // labelRenderer.setPixelRatio( window.devicePixelRatio );
          // labelRenderer.setClearColor(new THREE.Color('black'), 0)
          // labelRenderer.shadowMap.type = THREE.PCFShadowMap;
          // labelRenderer.shadowMap.enabled = true;
          this.labelRenderer.domElement.style.position = 'absolute';
          this.labelRenderer.domElement.style.top = '0';
          this.labelRenderer.domElement.style.pointerEvents = 'none';

          document.getElementById( 'wglc' ).appendChild( this.renderer.domElement );
          document.getElementById( 'wglc' ).appendChild( this.labelRenderer.domElement );
          // document.body.appendChild( this.renderer.domElement );
          // document.body.appendChild( this.labelRenderer.domElement );

          this.camera.position.set(0, 5500, 0); //125000

          
        //   this.axesHelper = new THREE.AxesHelper(2000); this.scene.add( this.axesHelper );


          this.resizer = new THREEx.WindowResize( this.renderer, this.camera );

          this.OrbitControls = new THREE.OrbitControls(this.camera);

          this.raycaster = new THREE.Raycaster();
          this.mouse = new THREE.Vector2();

          window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        //   this.animate();

      }; basic ()

      let entourage = () => {
          this.skybox()
          this.lightSetup()
      }; entourage ()

      GeoInitialized = this
  }

  lightSetup(){
      // general light
      this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
      this.scene.add(this.ambientLight);
      // light to see some volume
      this.light = new THREE.PointLight(0xffffff,2);
      this.light.position.set(100, 100, 0);
      this.scene.add(this.light);
      /** //lightbulb
          var lightbulbGeometry = new THREE.SphereGeometry( 3, 8, 8 );
          var lightbulbMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true,  opacity: 0.9, blending: THREE.AdditiveBlending } );
          var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );
          var materialArray = [lightbulbMaterial, wireMaterial];
          lightbulb = THREE.SceneUtils.createMultiMaterialObject( lightbulbGeometry, materialArray );
          MAIN.posSetEqual(lightbulb, light);
          scene.add(lightbulb);
          //#####################################################################################
          var slight = new THREE.SpotLight( 0x441188, .9 );
          slight.position.set( 65, 90, 10 );
          slight.angle = Math.PI / 9;
          slight.castShadow = true;
          slight.shadow.camera.near = 1000;
          slight.shadow.camera.far = 4000;
          slight.shadow.mapSize.width = 1024;
          slight.shadow.mapSize.height = 1024;
          scene.add( slight );
      */
      //#####################################################################################
      // var slightHelper = new THREE.SpotLightHelper( slight );
      // scene.add(slightHelper);
      //LET THERE BE LIGHT. Some more light.
      this.pointLight = new THREE.PointLight(0xffffff, 1);
      this.pointLight.position.set(0, 3000, 400);
      this.scene.add(this.pointLight);
      this.pointLight.color.setHSL(Math.random(), 1, 0.5);
  }
  skybox(){
      // FIXME(Xi): One day make beautiful skies
      // let s0 = new THREE.Sky()
      // s0.scale.setScalar( 450000 );
      // d0.WG.scene.add(s0)

      // SKYBOX
      let skyBoxGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000 );
      let skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xAAAAAA, side: THREE.BackSide } );
      this.skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
      this.scene.add(this.skyBox);
      ////////EITHER SKYBOX OR FOG
      //FOG
      // scene.fog = new THREE.FogExp2( 0x335566, 0.01);//0.00025 );
  }
  animateOLD () {

      /** TODO: RAYCASTER DOESN' this WORK! //update the picking ray with the camera and mouse position
      raycaster.setFromCamera( mouse, camera ); (function fnIntersect() {
      // https://github.com/mrdoob/three.js/issues/1934 *
      const insterss = raycaster.intersectObjects( scene.children );
      for (var i=0;i<insterss.length; i++) {}})();*/

      this.OrbitControls.update();

      // mixerContext.update(); // - TODO:uncomment this, if need a css-renderer
      requestAnimationFrame( this.animate.bind(this) );
      this.labelRenderer.render( this.scene, this.camera );
      this.renderer.render( this.scene, this.camera );
  }
  grid (pos, size, steps, colCL, colG){
      //GRID
      var grid = new THREE.GridHelper(size, steps)//, colorCenterLine=new THREE.Color(colCL), colorGrid=new THREE.Color(colG));
      grid.position.set(pos.x, pos.y, pos.z)
      this.scene.add(grid)
      grid.nameW = this.name(grid)
      this.Grids [grid.nameW] = grid
  }
  infiniteGrid() {
      this.Grids['infiniteGrid'] = new THREE.InfiniteGridHelper()
      this.scene.add(this.Grids['infiniteGrid'])
  }
  onMouseMove( event ) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  static getRandomColor () {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

}

class WGeom {

    //https://tympanus.net/codrops/2017/05/09/infinite-tubes-with-three-js/
    constructor () {
        this.WG = new WGeo() //called only once
        this.name = this.WG.name
        this.G = {}
        this.Groups = {}
    }

  initWGeom (Tau=new THREE.Vector3(500,0,0), YShift=0, norm=[0, 1, 0]) {
    this._clearScene()
    this._Zero = this.V([0,0,0])
    this._A = null
    this._T = null
    this.Na = 1708/(2^2*7) //quantity of dots per arc
    this._Color = 0x00ffff
    this._PrevCol = 0x0
    this._Draw = true
    this.YShift = 0
    this.Norm = undefined
    this._A = (WGeom.copy_vector3(Tau)).negate();
    this._T = Tau
    this.YShift = YShift
    this.Norm = (this.V(norm)).normalize()
    this.I = Tau.length() * 2;
    this.CaMo = 2 * Math.PI / this.Na //part of angle for one step
    this.DotSize = 15.6
    this.DotWS = 7//13
    this.DotHS = 7//17
  }
  _clearScene (){
    //   to fully clear and reinit WGeo
    // this.WG.scene.remove.apply(this.WG.scene, this.WG.scene.children);
    for(let o in this.G) {
        if (this.G.hasOwnProperty(o))
            this.remove_object(o)
    }
    for (let o in this.Groups) {
        if (this.G.hasOwnProperty(o))
            this.remove_object(o)
    }
  }   

  v3arr (v3) {
      return [v3.x, v3.y, v3.z]
  }
  static copy_vector3(vector3) {
      let ret = new THREE.Vector3(vector3.x, vector3.y, vector3.z)
      return ret
  }
  rads (degs) {
      return degs * Math.PI / 180
  }
  degs (rads) {
      return rads * 180 / Math.PI
  }
  get O () {return this._Zero}
  get A () {return this._A}
  get T () {return this._T}
  set O (v) {this._Zero=v}
  set A (v) {this._A=v}
  set T (v) {this._T=v}
  set Color (color) {this._Color = color}
  get Color () {return this._Color}
  set Draw (p=true) {this._Draw = p}
  get Draw () {return this._Draw}
  backupColor () {
    if (this._PrevCol == 0x0) {
      this._PrevCol = this._Color;
    } else {
      this._Color = this._PrevCol;
      this._PrevCol = 0x0
    }
  }
  V (arr) {
      let r=new THREE.Vector3().fromArray(arr)
      return r
  }

  remove_object (name) {
    let o = this.G[name].object
    if (o != 'undefined' && typeof (o) != undefined){
        o.material.dispose()
        o.geometry.dispose()
        this.WG.scene.remove(o)
    }
    delete this.G[name]
  }
  /**
   * https://threejs.org/docs/#api/en/geometries/TubeGeometry
   * https://threejs.org/examples/webgl_lines_fat.html
   * @param {*} vs
   * @param {*} ve
   */
  line (vs, ve, col=this.Color) {
      let name = "";
      let vs0 = this.V([vs.x, vs.y, vs.z]);
      let ve0 = this.V([ve.x, ve.y, ve.z]);
      name = this.name([vs, ve], "line");
      this.G[name] = {object:null, vertices:null};

      let lmat = new THREE.LineBasicMaterial ({color:col})//, linewidth:this.LW})
      let lgeo = new THREE.BufferGeometry()
      let verts = [vs0.x, vs0.y, vs0.z, ve0.x, ve0.y, ve0.z]
      let parr = new Float32Array(verts)
      lgeo.addAttribute ('position', new THREE.BufferAttribute (parr, 3));
      let line = new THREE.Line(lgeo, lmat);
      
      // let line = new Line2(lgeo, lmat);
      line.castShadow = true;
      this.G[name].object = line;

      // BUG: Line щиject cannot be added to Object3d! SOLVE!
      if (this.Draw) {
          this.WG.scene.add(line);
      }
      this.G[name].vertices = verts
      this.G[name].vectors = [vs0, ve0]
      return name;
  }
  lines (vs, ve, first="") {
      let name = "";
      let vs0 = this.V([vs.x, vs.y, vs.z]);
      let ve0 = this.V([ve.x, ve.y, ve.z]);
      name = this.name([vs, ve], "line");
      this.G[name] = {object:null, vertices:null};

      let lmat = new THREE.LineBasicMaterial ({color:this.Color})
      let lgeo = new THREE.BufferGeometry()
      let verts = [vs0.x, vs0.y, vs0.z, ve0.x, ve0.y, ve0.z]
      let parr = new Float32Array(verts)
      if (this.Draw) {
          lgeo.addAttribute ('position', new THREE.BufferAttribute (parr, 3));
          let line = new THREE.Line(lgeo, lmat);
          line.castShadow = true;
          this.G[name].object = line;

          if (first=="")
              this.WG.scene.add(line)
          else
              this.G[first].object.add(line)
      }
      this.G[name].vertices = verts
      this.G[name].vectors = [vs0, ve0]
      return name;
  }
  arc (vCenter, hAxs=[10, 10], aS=0, aE=Math.PI*2, cw=false, shift=0) {
      let name = this.name([vCenter, hAxs, aS, aE, cw, shift], "arc");
      //(Center_Xpos, Center_Ypos, Xradius, Yradius, StartAngle, EndAngle, isClockwise, Rotation)
      let curve = new THREE.EllipseCurve(vCenter.x, vCenter.z, hAxs[0], hAxs[1], aS, aE, cw, 0);
      let parr = curve.getPoints(this.Na);
      let parr0 = [], verts = [];

      this.G[name] = {object:null, vertices:null};

      for(let i=0;i<parr.length;i++) {
          // parr[i].y += shift;
          parr0[i] = this.V([parr[i].x, this.YShift, parr[i].y]);
          verts[i*3+0] = parr0[i].x;
          verts[i*3+1] = parr0[i].y;
          verts[i*3+2] = parr0[i].z;
      }

      // TODO(Xi): To separate function!!!
      //
      let lprop = {
          color:this.Color,
          transparent:true,
          opacity:1,
          linewidth: 60
      }
      let lmat = new THREE.LineBasicMaterial (lprop)
      let lgeo = new THREE.BufferGeometry().setFromPoints(parr)
      let line = new THREE.Line(lgeo, lmat)
      line.castShadow = true

      line.rotation.x = -Math.PI/2
      line.position.z += vCenter.z*2
      this.G[name].object = line;

      // BUG: Line aboject cannot be added to Object3d! SOLVE!
      if (this.Draw) {
          this.WG.scene.add(line);
      }

      this.G[name].vectors = parr0;
      this.G[name].vertices = verts;
      return name;
  }
  circle (focus, radius) {
      // if (typeof(col) == 'undefined') cl = M.getRandomColor();
      let c = this.arc(focus, f(radius));
      return c;
  }

  vectorHelper (vec, length=300) {
      let v = vec.normalize()
      v = v.multiplyScalar (length)
      this.backupColor()
      this.Color = new THREE.Color('maroon')
      this.backupColor()
      return this.line(this.O, v)
  }
  /**
   * https://threejs.org/docs/#manual/en/introduction/How-to-update-things
   * https://threejs.org/docs/#api/en/objects/Points
   * https://threejs.org/examples/?q=points#webgl_custom_attributes_points3
   * @param {*} v
   * @param {*} rad
   * @param {*} col
   */
  dot (v, rad=.5, col=0xce21a5) {
      let name = this.name([v], "dot");
      this.G[name] = {object:null, vertices:null};
      let sgeo = new THREE.SphereBufferGeometry (rad, this.DotWS, this.DotHS);
      let smat = new THREE.MeshPhongMaterial ({
          color:col,
          shininess:75,
          // flatShading:true,
          // transparent:true,
          // opacity:.75,
        //   depthTest:true,
          side:THREE.FrontSide
      });
      let sph = new THREE.Mesh(sgeo, smat);
      sph.castShadow = true;
      sph.position.set(v.x, v.y, v.z)
      this.G[name].object = sph;
      this.G[name].vertices = v;
      if (this._Draw)
          this.WG.scene.add(sph);
      return name;
  }

  util_Vec3toVec2 (v3arr) {
      let ret = []
      for (let v of v3arr) {
          ret.push (new THREE.Vector2(v.x, v.z))
      }
      return ret
  }
  util_BBoxNCentroid (geo) {
      //https://github.com/mrdoob/three.js/issues/3471 — setFromObject
      let bb = new THREE.Box3();
      bb.setFromPoints(geo.geometry.vertices);
      geo.boundingBox = bb;
      geo.centroid = new THREE.Vector3();
      bb.getCenter(geo.centroid);
      [geo.centroid.z, geo.centroid.y] = [geo.centroid.y, geo.centroid.z];
  }
  util_array_chunk(arr, n) {
      return arr.reduce(function(p, cur, i) {
          (p[i/n|0] = p[i/n|0] || []).push(cur);
          return p;
      },[]);
  }

  mesh (name, color=undefined) {
      let pts = [].concat.apply([], this.G[name].vectors)
      let shp = new THREE.Shape()
      shp.moveTo(pts[0].x, -pts[0].z)  // BUG: Look at minus at z
      shp.autoClose = true
      // let cntr = 1
      // let step = 310 / pts.length
      for (let v of pts){
          shp.lineTo(v.x, -v.z) // BUG: Look at minus at z

          // let en = this.V([v.x, cntr++*step, -v.z]), v2 = this.V([v.x, 0, -v.z])  // BUG: Look at minus at z
          // this.line(v2, en)
      }
      // shp.lineTo(pts[0].x, -pts[0].z)

      let egp = {
          steps: 2,
          depth: 2,
          bevelEnabled: true,
          bevelThickness: 1,
          bevelSize: 1,
          bevelSegments: 1
      }
      let eg = new THREE.ExtrudeGeometry(shp, egp)
      let emp = {
          // color: this.getWordColor(W.triple(a, t)), //0x2194ce,
          color: color || WGeo.getRandomColor(),
          // emissive: WGeo.getRandomColor(),// 0x642a2a, //W.getWordColor(W.triple(a, t)),
          // specular: 0x6f8be6,
          // wireframe: true,
          // transparent: true,
          // opacity: .31,
          flatShading:true,
          side:THREE.DoubleSide, //THREE.DoubleSide, THREE.BackSide
      }
      let em = new THREE.MeshPhongMaterial (emp)
      let ms = new THREE.Mesh(eg, em)
      ms.name = name
      if (this.Draw) this.WG.scene.add(ms)
      this.G[name].object = ms

      console.log(name)
      console.log(ms)
      
      ms.rotateX(Math.PI / 2)
      return name
  }

  mesh_reflect (meshname) {
      let obj = this.G[meshname].object
      let name = this.name(meshname, meshname+"_Copy")
      this.G[name] = {object: new THREE.Mesh (obj.geometry, obj.material)}
      this.G[name].object.name = name
      this.WG.scene.add(this.G[name].object)
      this.G[name].object.rotateX(-Math.PI/2)
      return name
  }

  // TODO: dot by something other that Sphere, tube() method
  
  toGroup (groupName, obj) {
      if (typeof(this.Groups[groupName])=='undefined'){
          this.Groups[groupName] = new THREE.Object3D();
          if (this.Draw)
              this.WG.scene.add(this.Groups[groupName])
      }

      this.Groups[groupName].add(obj)
  }
  arrayToGroup (arr, groupName) {
      for (let n of arr) { //iterate over names in array
          this.toGroup(groupName, this.G[n].object)
      }
  }
}

class WXog3DWrite extends aggregation (WGeom, WLet) {
  Labels = {}
  /**
   *
   * @param {Number} iasen — width and height of the symbol
   */
  constructor (iasen=50) {
      super() //init WGeom
      this.prep_props() //init WLet — aggregate is making MIXIN, not multiple inheritance
      this.iasen = iasen //width of the symbol
      this.xer1 = iasen / 5
      this.X = {} //each xoggva under proper name is stored here
      this.Records = [] // records as time, name and an array of drawn letters

  }
  write_CSS2D = function(text, pos, obj) {
      //https://threejs.org/examples/css2d_label.html
      //https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_pdb.html
      //https://threejs.org/examples/#webgl_loader_pdb
      obj = obj || this.WG.scene;
      var objDiv = document.createElement( 'div' );
      let lblname = this.name([text, pos], "lbl")
      objDiv.className = lblname
      objDiv.textContent = text;
      objDiv.style.marginTop = '-1em';
      objDiv.style.color = "rgb(255,0,0)";
      let objLabel = new THREE.CSS2DObject( objDiv );
      objLabel.position.copy(pos);
      this.WG.scene.add( objLabel );
      this.Labels[lblname] = {
          object: objLabel,
          div: objDiv,
          pos: pos
      }
      return lblname;
  }
  cursorToCell = function (x, y) {
      let v = this.V([xw.xer1*(x-1)+xw.xer1/2, 0, xw.xer1*(y-1)+xw.xer1/2])
      return v
  }
  start_record (waertext, rot, object=null, oldxoggvas=[]) {
      let curtime = this.wdate_wdtString(this.wdate_WaerDT())
      //name record by current time in waer + text itself
      let txtnm = this.name(curtime+"!"+waertext, "SA")
      let ndx = this.Records.length //for new record
      this.Records.push({
          created:curtime,
          name:txtnm,
          text:waertext,
          rot: rot,
          object:object, //hoggvas, joined in one Object3D
          xoggvas:oldxoggvas
          //array {xogname:name, index:recXogNdx, lineName: lnam, object: this.G[lnam]}
      })
      return  ndx//return the index of record
  }
  /**
   * Not to be undone
   * @param  {...any} recndxs indexes of the Records to join
   * The old indexes remain, but are nullified
   */
  join_records (...recndxs) {
      throw ("Implement JOIN_RECORD")
      //TODO: Throw an error if the rotations differ
      let obj = new THREE.Object3D()
      let wtxt = "", newxog = [], indexer = 0
      for (let recndx of recndxs) {
          //check all hoggvas, setting xoggva indexes appropriately
          obj.add(this.Records[recndx].object)
          for (let xogg of this.Records[recndx].xoggvas) {
              newxog.push(xogg)
              newxog[newxog.length-1].index = indexer++
          }
      }
      this.WG.scene.add(obj)
      let curtime = this.wdate_wdtString(this.wdate_WaerDT())
      let name = this.name(curtime+"!"+wtxt, "SA") //
      //https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
      let ndx = this.Records.length //for new record
      this.Records.push({
          created:curtime,
          name:name,
          text:wtxt,
          rot: rot,
          object:object, //hoggvas, joined in one Object3D
          xoggvas:oldxoggvas
          //array {xogname:name, index:recXogNdx, lineName: lnam, object: this.G[lnam]}
      })
      return  ndx//return the index of record
  }

  /**
   * // TODO GRAND:
   * 1) make hoggvas float on the sphere
   */

  /**
   *
   *
    //https://learn.javascript.ru/modules-intro
    // import { Line2 } from '../outer/Line2.js';
    // import { LineMaterial } from '../outer/LineMaterial.js';
    // import { LineGeometry } from '../outer/LineGeometry.js';
    // import { GeometryUtils } from '../outer/GeometryUtils.js';

   * https://threejs.org/examples/webgl_lines_fat.html
   * Draw xoggva by lines. Let this.line serve as an Axe of Odhinn WaoaerIe
   * @param {*} recndx index of the record created before calling xoggva()
   * @param {*} x the xoggva in cyrillic
   * @param {*} pos
   * @param {*} axis
   * @param {*} angle
   * @param {*} worldP is the rotation in world or local base
   */
  xoggva (recndx, x) { //, axis=this.Norm, angle=0, worldP=false
      let xi = this.xog_index_by_cyr(x), xp //xoggva index, xog. path
      if (xi >= 0)
          xp = this.waer_drw[xi]
      else
          return null

      let xg = this.draw(recndx, x, xp)

      return xg
  }

  fillPath (t1, cur) { //receives direction and cursor
      let r = new THREE.Vector3(cur.x, cur.y, cur.z)
      switch(t1.from) { //"01 1+01 1+03"
          case "0":
              if (t1.to == "1") {
                  r.x += this.xer1 * t1.q
              } else if (t1.to == "2") {
                  r.z += this.xer1 * t1.q
              } else if (t1.to == "3") {
                  r.x += this.xer1 * t1.q
                  r.z += this.xer1 * t1.q
              } else //00
                  throw (`${st}: wrong pathcode`)
              break;
          case "1":
                  if (t1.to == "0") {
                      r.x -= this.xer1 * t1.q
                  } else if (t1.to == "2") {
                      r.x -= this.xer1 * t1.q
                      r.z += this.xer1 * t1.q
                  }  else //11 13
                      throw (`${st}: wrong pathcode`)
                  break;
          case "2":
                  if (t1.to == "0") {
                      r.z -= this.xer1 * t1.q
                  } else if (t1.to == "1") {
                      r.x += this.xer1 * t1.q
                      r.z -= this.xer1 * t1.q
                  } else //22 23
                      throw (`${st}: wrong pathcode`)
                  break;
          case "3":
                  if (t1.to == "0") {
                      r.x -= this.xer1 * t1.q
                      r.z -= this.xer1 * t1.q
                  } else //33 32 31
                      throw (`${st}: wrong pathcode`)
                  break;
      }
      return r
  }

  draw (recndx, xoggva, path) {
      let p = path.split(" ")
      let half = this.xer1/2

      let recname = this.Records[recndx].name
      let recXogNdx = this.Records[recndx].xoggvas.length //watch out: the index is goven, but the xoggva is not appended still
      let name = this.name(xoggva+ ":" +this.wdate_WaerDT(), "xog:" +recname+ "#" +recXogNdx) //name of xoggva record, name of the object is different
      let lnam //name of the first line, to which we than add other lines

      let s = p[0].split(""),
          sx = parseInt(s[0])*this.xer1+half, //start lines from the center of square
          sz = parseInt(s[1])*this.xer1+half
      let vv = [] //coordinates in xoggva

      vv.push(this.V([sx, 0, sz])) //push starting point

      for (let st of p.slice(1)) { //iterate over pathSteps

          let t0 = st.split(""), //read the next Steps+-Where string of the path
              t1 = {q:parseInt(t0[0]), b:t0[1], from:t0[2], to:t0[3]}

          vv.push( this.fillPath(t1, vv[vv.length-1]) ) //add the direction

          if (t1.b == "+") { //.b means "bool", so + is draw!
              if (typeof(this.G[lnam])!='undefined')
                  this.lines(vv.slice(-2, -1)[0], vv.slice(-1)[0], lnam) //the first iteration won't get here, so lnam will be inited already in 'else'
              else
                  lnam = this.lines(vv.slice(-2, -1)[0], vv.slice(-1)[0])
          }
      } //collecting xoggva from lines ends here

      this.Records[recndx].xoggvas.push({ xogname:name,
                                          index:recXogNdx,
                                          lineName: lnam,
                                          object: this.G[lnam]})

      this.X[name] = this.Records[recndx].xoggvas[recXogNdx].object
      // Position xoggva in record according to recXogNdx
      this.X[name].object.scale.set(.5,1,1)
      this.X[name].object.position.x += recXogNdx * this.iasen / 2

      return name
  }

  langue = function (vec=xw.cursorToCell(5, 1), dir='21', len=2) {
      /* if we go like Math.PI/4*3, Math.PI/4*7, the arc is made so that in, say 21 direction
       * we +x+z by the amount to find. The angle at center is 45, hyp = xer1/3, triangle is equilateral
       * so Math.abs(xer1/3*Math.cos(Math.PI/4)), then we add coordinates as we added in fillPath()
       * Since we have OEzhas, Wyans and stuff like that, we have to make separate "leaves", than join'em
       * How to code the stuff - no ideas for 2019-09-14 02:48:54
       */
      // let l0 = xw.lines(xw.V([0,0,0]), xw.V([0,0,10]))
      // let l1 = xw.lines(xw.V([0,0,10]), xw.V([10,0,15]), l0)
      // xw.backupColor()
      // xw.Color = 'black'
      // xw.arc(xw.V([xw.xer1/2*9, 0, xw.xer1/2]), f(xw.xer1/3), 0,              Math.PI,        false)
      // xw.Color = 'yellow'
      // xw.arc(xw.V([xw.xer1/2*5, 0, xw.xer1/2]), f(xw.xer1/3), Math.PI,        Math.PI*2,      false)
      // xw.Color = 'magenta'
      // xw.arc(xw.V([xw.xer1/2*1, 0, xw.xer1/2]), f(xw.xer1/3), Math.PI/4*1,    Math.PI/4*5,    false)
      // xw.backupColor(); xw.backupColor() //just to reset the status of color backuper XD

      throw ("LANGUE: Implement me!")
  }

  write_semya_cyr (waertext, pos=this.O, axis=this.Norm, ang=Math.PI/2, worldP=true) {
      let ta = [...waertext] //text array
      let recndx = this.start_record(waertext)
      let recname = this.Records[recndx].name
      for (let ltr of ta) {
          if (this.xog_is (ltr)) {
              let xog_id = this.xoggva(recndx, ltr)

              let obj = this.X[xog_id].object
              this.toGroup(recname, obj)
          }
      }
      // Position and rotate the semya
      // Object3D.rotateOnAxis( axis, angle ) or Object3D.rotateOnWorldAxis( axis, angle );
      // or quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), 0.005);
      //    object.position.applyQuaternion(quaternion);
      let obj = this.Groups[recname]
      this.Records[recndx].object = obj

      if (worldP)
          obj.rotateOnWorldAxis(axis, ang)
      else
          obj.rotateOnAxis(axis, ang)

      obj.position.set(pos.x, pos.y, pos.z)

      this.Records[recndx].rot = this.Records[recndx].object.rotation
      return recndx //returns index of record in the this.Records array
  }

  write_semya (waertext, pos=this.O, axis=this.Norm, ang=Math.PI/2, worldP=true) {
      let text = ""
      for (let l of waertext)
          text += this.findInSymbolsAndTranslate(l, this.C.cWAE_XOG, this.C.cWAE_CYR)
      let ret = this.write_semya_cyr (text, pos=pos, axis=axis, ang=ang, worldP=worldP)
      return ret //returns and index of record in this.Records array
  }

  position_rec (recndx, pos) {
      let obj = this.Records[recndx].object
      obj.position.set()
  }

  rotate_rec(recndx, rot, wordlP) {
      let obj = this.Records[recndx].object
      if (wordlP) {
          obj.rotateOnWorldAxis(rot.axis, rot.angle)
      } else {
          obj.rotateOnAxis(rot.axis, rot.angle)
      }
  }

  create_indexes_list_of_phrase (phrase) {
      let res = []
      for (let ltr of phrase) {
          let xig = this.xog_index_by_cyr(ltr)
          if (xig >= 0) res.push(xig)
      }
      return res
  }

  /**
   * 25 - path
   * 28 - clear
   * 20 - force, fingers, grasp, penetrate
   * 24 - impulse or even jerk (third derivative of coordinate by time)
   * 10 - lawful, reasonable, natural
   * 5  - which is only the beginning
   */
  _2153 () {
      let ret = "", word = [25,28,20,24,10,5]
      for (let ltr in word) ret += this.waer_xog[word[ltr]];
      return ret
  }
  _1708 () {
      let ret = "", word = [25,28,20,3]
      for (let ltr in word) ret += this.waer_xog[word[ltr]];
      return ret
  }
  _147 () {
      let ret = "", word = [1, 0, 22]
      for (let ltr in word) ret += this.waer_xog[word[ltr]];
      return ret
  }
  _n (num) {
      return this.waer_xog[num];
  }

  // let xw = new WXog3DWrite()
  // xw.WG.camera.position.set (193, 560, -63)
  // xw.WG.infiniteGrid()
  // // xw.Draw = false
  // let r1 = xw.write_semya_cyr ("эме еохь")//, xw.V([(xw.iasen+10), 0, 0]))
  // let r2 = xw.write_semya_cyr ("сйёфна", xw.V([(xw.iasen+10), 0, 0]))
  // let r3 = xw.write_semya_cyr ("йяр май", xw.V([(xw.iasen*2+10), 0, 0]))
  // // xw.rotate_rec(r1, {axis: xw.V([0, 1, 0]).normalize(), angle:-Math.PI/3}, true)
  // // xw.vectorHelper(xw.V([0, 1, 0]).normalize())
}
