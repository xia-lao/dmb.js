var M = {Obj: {}}, scene, camera, renderer, axesHelper, OrbitControls, resizer, light, lightbulb, skyBox, mouse

function posSetEqual(obj1, obj2) {
  obj1.position.set(obj2.position.x, obj2.position.y, obj2.position.z);
}
function rads(degrees) {
  return degrees * math.PI / 180;
}
function degs(radians) {
  return radians * 180 / math.PI;
}
function setup() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000000 );

  renderer = new THREE.WebGLRenderer({alpha:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor(new THREE.Color('black'), 0)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild( renderer.domElement );
  camera.position.set(40, 40, 40); //125000
  axesHelper = new THREE.AxesHelper(100);
  scene.add( axesHelper );
  resizer = new THREEx.WindowResize( renderer, camera );
  
  OrbitControls = new THREE.OrbitControls(camera);
  OrbitControls.addEventListener( 'change', () => renderer.render( scene, camera ) );
  function animate () {
    requestAnimationFrame( animate );
    // OrbitControls.update();
    renderer.render( scene, camera );
  };animate();
  function skybox(){
    // SKYBOX
    var skyBoxGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xeebbee, side: THREE.BackSide } );
    skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    scene.add(skyBox);
    ////////EITHER SKYBOX OR FOG
    //FOG
    // scene.fog = new THREE.FogExp2( 0x335566, 0.01);//0.00025 );
  };skybox();
  function lightSetup(){
    // general light
    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    // light to see some volume
    light = new THREE.PointLight(0xffffff,2);
    light.position.set(300, 1000, -500);
    scene.add(light);
    //#####################################################################################
    //lightbulb
    var lightbulbGeometry = new THREE.SphereGeometry( 3, 8, 8 );
    var lightbulbMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true,  opacity: 0.9, blending: THREE.AdditiveBlending } );
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );
    var materialArray = [lightbulbMaterial, wireMaterial];
    lightbulb = THREE.SceneUtils.createMultiMaterialObject( lightbulbGeometry, materialArray );
    posSetEqual(lightbulb, light);
    scene.add(lightbulb);
    //#####################################################################################
    var slight = new THREE.SpotLight( 0x441188, .9 );
    slight.position.set( 65, 90, 10 );
    slight.angle = math.PI / 9;
    slight.castShadow = true;
    slight.shadow.camera.near = 1000;
    slight.shadow.camera.far = 4000;
    slight.shadow.mapSize.width = 1024;
    slight.shadow.mapSize.height = 1024;
    scene.add( slight );
    //#####################################################################################
    // var slightHelper = new THREE.SpotLightHelper( slight );
    // scene.add(slightHelper);
    //LET THERE BE LIGHT. Some more light.
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 1000, 400);
    scene.add(pointLight);
    pointLight.color.setHSL(Math.random(), 1, 0.5);
  };lightSetup();
  function baseSetup() {
    planeGeo = new THREE.PlaneGeometry(32,32);
    planeMat = new THREE.MeshBasicMaterial({color:0xbbbbbb, opacity:.8, transparent: true});
    basePlane = new THREE.Mesh(planeGeo, planeMat);
    basePlane.rotation.x = -math.PI / 2;
    basePlane.position.set(9,-5,9);
    basePlane.base = true;
    scene.add(basePlane);
  };baseSetup();
};setup();

M.V = function (arr) {
  var r = new THREE.Vector3();
  r.fromArray(arr);
  return r;
};

M.Name = function (obj) {
  return md5(JSON.stringify(obj));
};

M.IAngle = function (not_inv_coord, focus) {
  let crd = new THREE.Vector3(); crd.subVectors(not_inv_coord, focus);
  return {rad: crd.distanceTo(M.O), angle: -crd.angleTo(M.T)};
};

M.Inverse = function (coords, focus, radius) {
  focus = focus || M.InvFocus;
  radius = radius || M.InvRadius;
  let dx = coords.x, dz = coords.z, fx = focus.x, fz = focus.z
  let x = dx + (math.pow(radius, 2) * (dx - fx)) / (math.pow(dx - fx, 2) + math.pow(dy - fy, 2));
  let z = dz + (math.pow(radius, 2) * (dz - fz)) / (math.pow(dx - fx, 2) + math.pow(dz - fz, 2));
  return M.V([x, M.YS, z]);
};

M.Line = function (vs, ve, onlyDots, col) {
  if (typeof(onlyDots=='undefined')) onlyDots = false;
  col = col || 0x00ffff;

  let name = "";

  let vs0 = M.V([vs.x, vs.y, vs.z]);
  let ve0 = M.V([ve.x, ve.y, ve.z]);

  name = M.Name([vs0, ve0]);
  M.Obj[name] = {object:null, vertices:null};

  let lmat = new THREE.LineBasicMaterial ({color:col});
  let lgeo = new THREE.BufferGeometry();
  let verts = [vs0.x, vs0.y, vs0.z, ve0.x, ve0.y, ve0.z];
  let parr = new Float32Array(verts);
  if (!onlyDots) {
      lgeo.addAttribute ('position', new THREE.BufferAttribute (parr, 3));
      let line = new THREE.Line(lgeo, lmat);
      line.castShadow = true;
      M.Obj[name].object = line;
      scene.add(line);
  }
  M.Obj[name].vertices = verts;
  return verts;
};

M.EllArc = function (vCenter, hAxs, aS, aE, onlyDots, col, cw) {
  if (true) {
      hAxs = hAxs || [10, 10];
      aS = aS || 0;
      aE = aE || math.PI*2;
      if (typeof(onlyDots) == 'undefined') onlyDots = false;
      col = col || 0x00ffff;
      if (typeof(cw) == 'undefined') cw = false;
  }
  let name = M.Name([vCenter, hAxs, aS, aE, inv]);
  let curve = new THREE.EllipseCurve(vCenter.x, vCenter.z, hAxs[0], hAxs[1], aS, aE, cw, 0);
  let parr = curve.getPoints(M.Na);
  let parr0 = [], verts = [];

  M.Obj[name] = {object:null, vertices:null};

  for(let i=0;i<parr.length;i++) {
      // parr[i].y += shift;
      parr0[i] = M.V([parr[i].x, M.YS, parr[i].y]);
      verts[i*3+0] = parr0[i].x;
      verts[i*3+1] = parr0[i].y;
      verts[i*3+2] = parr0[i].z;
  }
  if (onlyDots == false) {
      let lmat = new THREE.LineBasicMaterial ({color:col, transparent:true, opacity:1});
      let lgeo = new THREE.BufferGeometry().setFromPoints(parr);
      let line = new THREE.Line(lgeo, lmat);
      line.castShadow = true;
      line.rotation.x = -math.PI/2;
      line.position.z += vCenter.z*2;
      scene.add(line);
      M.Obj[name].object = line;
  }

  M.Obj[name].vectors = parr0;
  M.Obj[name].vertices = verts;
  return verts;
};

M.Circle = function (focus, radius, inv) {
  if (typeof(inv) == 'undefined') inv = false;
  let old_na = M.Na;
  M.Na = 2460;
  let c = M.EllArc(
      focus,
      f(radius),
      undefined, undefined, undefined, col=M.getRandomColor(), undefined,
      inv, undefined, undefined);
  M.Na = old_na;
  return c;
}

M.Dot = function (vDot, rad, col, visible) { //accepts InSect of Vector3
  rad = rad || .5;
  col = col || 0xce21a5;
  if(typeof(visible) == 'undefined')
      visible = true;
  let name = M.Name([vDot]);
  M.Obj[name] = {object:null, vertices:null};
  if (!vDot) return;
  let sgeo = new THREE.SphereBufferGeometry (rad, 13, 17);
  let smat = new THREE.MeshPhongMaterial ({
      color:col,
      shininess:75,
      // flatShading:true,
      // transparent:true,
      // opacity:.75,
      depthTest:true,
      // side:THREE.FrontSide
  });
  let sph = new THREE.Mesh(sgeo, smat);
  sph.castShadow = true;
  sph.position.set(vDot.x, vDot.y, vDot.z)
  M.Obj[name].object = sph;
  M.Obj[name].vertices = vDot;
  if (visible)
      scene.add(sph);
  return name;
};

function markIt(vec) {
  //TODO: make lines start from axis of wave
  let dot = M.Dot (M.V(vec), .2);
  let line = M.Line (M.V([0,0,vec[2]]), M.V(vec));
}

function Car2Sph (carArr) {
  //https://stackoverflow.com/questions/30271693/converting-between-cartesian-coordinates-and-spherical-coordinates
  let ss = new THREE.Spherical().setFromCartesian(M.V(carArr)).makeSafe();
  return [ss.radius, ss.phi, ss.theta];
}

function Sph2Car (sphArr) {
  //https://stackoverflow.com/questions/30271693/converting-between-cartesian-coordinates-and-spherical-coordinates
  let ss = new THREE.Spherical(sphArr[0], rads(sphArr[1]), rads(sphArr[2])).makeSafe();
  let cc = new THREE.Vector3().setFromSpherical(ss);
  return [cc.x, cc.y, cc.z];
}

function fnWavePts (){
  let ell = [5, 4];
  //Радиус эллипса в данной точке это отрезок, соединяющий центр эллипса с точкой, а также его длина, которая вычисляется
  let elrad = (b, l, phi) => (b*l)/math.sqrt(l**2*math.cos(phi)**2+b**2*math.sin(phi)**2);
  let ps = [], t = 0;
  for(let i=0;i<361*10;i+=10) {
    let ang = rads(i);
    let rad =  elrad(ell[0], ell[1], ang);
    // let c0 = math.exp(math.complex(0, rads(i)));
    // let c1 = math.multiply(rad, c0);
    let c1 = math.complex({r:rad, phi:ang});
    ps.push([c1.re, c1.im, i/150]); //i/150
  }
  return ps;
}

fnWavePts0 = function () {
  /** sheer polarization is governed by the radius of ellipse at the given point
   * всё есть здесь: https://ru.wikipedia.org/wiki/Эллипс
   * r = (_BHA * _LHA) / sqrt(_LHA* *2 * cos(radians(BHA_Point_angle))** 2 + _BHA** 2 * sin(radians(BHA_Point_angle))**2)
   * or:  excentricity = sqrt(1 - _LHA* *2 / _BHA**2)
   * r = _LHA / sqrt(1 - excentricity* *2 * cos(BHA_Point_angle)**2)
   */
  let W = fnWavePts0;
  W.wPERIOD =          13;//wave length coefficient
  W.wRANGE =           6;//quantity of loops
  W.wRRUN =            3;//within how many loops the radius changes from min to max or backwards
  W.wSHEER_FACTOR =    .5;
  W.wCIRCLE =          360;//number of degrees in a loop
  W.wRADIUS =          2;//just the radius of a wave
  W.wZSHIFT =          .005;
  W.wELLIPSE =            3;//0: ellipse, 1: ellipse + z-running r-shift, 2: z-running r-shift
  W.wBHA =                W.wRADIUS;
  W.wLHA =                W.wRADIUS / 2;
  W.wEANGLE =             W.wCIRCLE / 12;//angle of the _BHA inclination
  W.wROTEAN =             true;//rotate _EANGLE by the _CIRCLE/_RANGE part for each iteration. Experimental, has explicable rips
  let res =               [];
  let rfactor =           -1;
  let sfactor =           (r) => {return (r / W.wSHEER_FACTOR) / W.wCIRCLE};//sheer factor
  let r =                 W.wRADIUS;
  let bha =               W.wBHA;
  let lha =               W.wLHA;
  let rng =               math.round(W.wCIRCLE * W.wRANGE);

  let elrad =             (b, l, phi) => {
      return ((b * l) / math.sqrt(l**2 * math.cos(phi)**2 + b**2 * math.sin(phi)**2))
  };

  for (let angle=0;angle<rng;angle++) {
      let aa = W.wROTEAN % W.wCIRCLE;
      let BHA_Point_angle = aa - W.wEANGLE;
      if (W.wROTEAN) {
          if (aa == 0) {
              W.wEANGLE = W.wEANGLE + (W.wCIRCLE / W.wRANGE);
          }
      }
      if (W.wELLIPSE == 0) {//try elliptical polarization
          r = elrad(W.wBHA, W.wLHA, BHA_Point_angle);
      } else if (W.wELLIPSE == 1) {//try'em both
          if (angle % (W.wCIRCLE * W.wRRUN) == 0) {
              rfactor = -rfactor;
          }
          bha = bha + rfactor * sfactor(W.wBHA);
          lha = lha + rfactor * sfactor(W.wLHA);
          r = elrad(bha, lha, BHA_Point_angle);
      } else if (W.wELLIPSE == 2) {//try just changing radius for several cycles, TODO: may be joined to the elliptical polarization
          if (angle % (W.wCIRCLE * W.wRRUN) == 0) {
              rfactor = -rfactor;
          }
          r = r + rfactor * sfactor (W.wRADIUS);
      } else {
          ;//static radius
      }
      let ang = rads(aa);
      let c1 = math.complex({r:r, phi:ang});
      // let c1 = math.multiply(math.exp(c0), r);
      let time = W.wPERIOD / W.wCIRCLE * angle;
      let p0 = [c1.re, c1.im, time];
      res.push(p0)
  }
  return res;
};

function testWave() {
  camera.position.set(4, 3, 14);
  let ps = fnWavePts0();
  for(let i=1;i<ps.length;i++) {
    let vec = ps[i-1];
    M.Dot (M.V(vec), .2); //let dot = 
    M.Line (M.V([0,0,vec[2]]), M.V(vec)); //let line = 
    M.Line(M.V(ps[i-1]), M.V(ps[i]));
  }
}; 
testWave();

function testSph() {
  let pa = [];
  for(let i=0;i<360*2;i+=10) {
    let cc = Sph2Car([10, 90-i/15, i]);
    markIt(cc);
    pa.push(M.V(cc));
    if (i>0)
      M.Line(pa.slice(-2)[0], pa.slice(-1)[0]);
    // console.log(`${cc}`);
  }
}; 
// testSph();
/**
 * Чем тяжело ещё всё с Яной вышло - вначале она дала мне надежду на то, что она та, кого я столько лет ждал, человек, который реально станет соратником в моём деле. 
 */
