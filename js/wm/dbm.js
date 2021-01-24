/***
 * 1) желательно использовать для вывода какую-нибудь графическую среду, отображение в 2D хватит
 * 
 * 2) на заданном расстоянии I (пусть будет длина - 1) поставлены две точки (далее - фокусы А и Т). 
 * 
 * 3) Расстояние разделено на алфавит: положим, иврит, тогда фокус А - алеф, а фокус Т - тау. 
 * 
 * 4) От обоих фокусов построены последовательности концентрических окружностей (по Тау штук, в случае иврита 22, где нулевая окружность имеет радиус 0)
 * 
 * 5) Окружности будут иметь точки пересечения. Требуется найти решение для задачи поиска точек пересечения окружностей
 * 
 * 6) Поставить точки на местах пересечения
 * 
 * 7*) В ходе поиска можно исследовать иные геометрические свойства системы и сделать некоторую сумму выводов
 * 
 * сделали некие изменения
 */
class WDbm extends WGeom {
    constructor () {super()}

    init(X1=3, add=0, Tau=new THREE.Vector3(500,0,0), YShift=0) {
        this.initWGeom(Tau, YShift)
        this.X1 = X1
        this.X2 = X1 + add
        this.Mok1 = this.I / (X1 - 1)
        this.ThLPh = this.intersection(this.X2-1, this.X2-1)
        this.A_Color = "white"
        this.T_Color = "white"
        this.ThLPh_Color = "green"
    }
    /**
     * Returns an angle in the direction of this.T focus
     * @param {Vector3} coord the dot to be measured
     * @param {Vector3} base "Start of the vector"
     */
    angle (coord, base=this.O) {
        let crd = new THREE.Vector3();
        crd.subVectors(coord, base);
        let ret = {
            rad: crd.distanceTo(this.O),
            angle: (coord.z > 0 ? -1 : 1)*crd.angleTo(this.T)}; //case -z- is closer to us, it is negative angle
        return ret
    }
    spherical_from_cart (coord) {
        let ret = new THREE.Spherical ().setFromVector3 (coord)
        ret.makeSafe()
        return ret
    }
    cartesian_from_sphc (s) {
        return new THREE.Vector3().setFromSpherical (s)
    }
    intersection (a, t, up=false) {

        var ret = false;
        let ar = this.Mok1 * a,
            tr = this.Mok1 * t,
            hp = (this.I + ar + tr) / 2;
        if(a + t >= this.X1-1 && //in I1
           Math.abs(a - t) < this.X1 ) { //not out of I2

            let hI = 0, x = 0, coef = 1;
            try {hI = (2 * Math.sqrt(hp * (hp - this.I) * (hp - ar) * (hp - tr) ) ) / this.I}
            catch(e) {hI = 0}

            if(isNaN(hI)) hI = 0;

            if (tr >= ar) {
                tr = [ar, ar = tr][0];
                coef = -1;
            }
            let sina = 0;
            if (ar != 0) sina = hI / ar;
            let an = Math.asin(sina);
            let sx = ar * Math.cos(an);
            x = coef * (-this.I) / 2 + coef * sx; //correction of the position of adjacent katet
            ret = this.V([x, this.YShift, up?hI:-hI]); //TODO: REDO UP-DOWN, NOW NEGATIVE IS POSITIVE AND VICE VERSA
        }
        return ret;
    }
    /* ON SPIRALS - OBSOLETE
        spiralCoords (vecStart=new THREE.Vector3(0,0,0), direction=1, partPer2Pi=22, radStart=0) {
            // r f t, t - azimutal
            //this.X2 is the quantity of turns
            let stepOfSpiral = this.Mok1, // / this.X2,
                v3StartPos = vecStart.clone(),
                stepAngle = Math.PI * 2 / partPer2Pi,
                qtyLines = this.X2 * partPer2Pi,
                stepRadius = stepOfSpiral / partPer2Pi,
                rad = radStart,
                listCoords = [v3StartPos],
                extParam = ChangeSpiralRadiusParam/partPer2Pi//stepOfSpiral/ChangeSpiralRadiusParam/partPer2Pi //parameter, extending the radius in current point
                // console.log(extParam)
            if (vecStart.x < 0) 
                direction = -direction
            for(let i = 1; i <= qtyLines; i++) { //do turns
                rad += stepRadius + (i * extParam)
                let newX = direction * rad * Math.cos(i * stepAngle), newZ = rad * Math.sin(i * stepAngle)
                let newPointCart = this.V([newX + vecStart.x, listCoords[listCoords.length-1].y, newZ + vecStart.z])

                listCoords.push(newPointCart)
            }
            // console.log(listCoords)
            return listCoords
        }
        spiral (vecStart=new THREE.Vector3(0,0,0), col='red', listCoords=undefined, partPer2Pi=24, radStart=0) {
            listCoords = listCoords || this.spiralCoords(vecStart, -1, partPer2Pi, radStart)
            let names = []
            // let fname = this.lines(listCoords[0], listCoords[1])
            for (let v = 1; v < listCoords.length; v++) {
                let lname = this.line(listCoords[v-1], listCoords[v], col=col)
                // let dname = this.dot(listCoords[v], this.DotSize, WGeo.getRandomColor())
                names.push(lname)
                // this.G[lname].object.material.color = WGeo.getRandomColor()
                // names.push(dname)
                // this.G[dname].object.rotateZ(-Math.PI/2)

                // this.G[lname].object.rotateZ(-Math.PI/2)

                // this.lines(listCoords[0], listCoords[1], fname)
            }
            // this.G[fname].object.rotateZ(-Math.PI)
            return names
    }*/


    mark_foci () {
        this.dot(this.A, this.DotSize, 'black')
        let dt = this.dot(this.T, this.DotSize, 'white')
        // SS.push(dt)
        // this.dot(this.O, this.DotSize, 'green')
    }
    mark_circle_2d (focus, radius, color='black') {
        this.backupColor()
        this.Color = color;
        let ret = this.circle(focus, radius)
        this.backupColor()
        return ret;
    }
    mark_circles_AT (a, t) {
        let ar = a * this.Mok1, tr = t * this.Mok1
        let ret = []
        ret.push(this.mark_circle_2d(this.A, ar))
        ret.push(this.mark_circle_2d(this.T, tr))
        return ret
    }
    mark_circle_mok1 (n, focus, col='blue') {
        return this.mark_circle_2d(focus, n * this.Mok1, col)
    }
    mark_circles_all (third=false) {
        let ret = []
        for (let i=0;i<this.X2;i++) {
            ret.push(this.mark_circle_mok1(i, this.A, this.ThLPh_Color))
            let CT = this.mark_circle_mok1(i, this.T, this.ThLPh_Color)
            // ret.push(CT)
            // SS.push(CT)
            if (third) ret.push(this.mark_circle_mok1(i, this.ThLPh, this.ThLPh_Color))
        }
        return ret
    }
    mark_circles4wyan (a, t) {
        let ar = a * this.Mok1, tr = t * this.Mok1
        let br = (a-1) * this.Mok1, ur = (t-1) * this.Mok1
        let ret = []
        ret.push(this.mark_circle_2d(this.A, ar))
        ret.push(this.mark_circle_2d(this.A, br))
        ret.push(this.mark_circle_2d(this.T, tr))
        ret.push(this.mark_circle_2d(this.T, ur))
        return ret
    }

    wyan_path (a, t) {
        const _WyanPaths = {
            '4d__': "0- -0 0+ +0", //regular group - in both Is
            'e1I1': "0- -+ +0", //first ellipse groups, going first towards T-focus (A -> T)
            'bAI2': "0- -0 ++", //"+0 0+ --", #no 1e on I2: BA from A out
            'bTI2': "-0 0- ++" //no 1e on I2: BA from T out
            //'3uI1':"",'3uI2':"",'3dI1':"",'3dI2':"",'3rI1':"",'3rI2':"",'3lI1':"",'3lI2':""
        }
        let _pex1c = function (a, t, pathcode) {
            let pa = pathcode.split(" ");
            let path = [[a, t]];
            for (let i=0;i<pa.length;i++) {
                path.push(pa[i]);
                switch (pa[i]) {
                    case "0-": path.push([a,   t-1]);break
                    case "0+": path.push([a,   t+1]);break
                    case "-0": path.push([a-1, t  ]);break
                    case "+0": path.push([a+1, t  ]);break
                    case "-+": path.push([a-1, t+1]);break
                    case "+-": path.push([a+1, t-1]);break
                    case "--": path.push([a-1, t-1]);break
                    case "++": path.push([a+1, t+1]);break
                }
                a = path[path.length-1][0];
                t = path[path.length-1][1];
            }
            return path;
        }
        //
        let pathcode="";
        if (a==0||t==0) { //zeros don't shine
            return false;
        } else { //non-zero dot
            pathcode = _WyanPaths['4d__'];
            if (a+t==this.X1-1) { //BA doesn't shine
                return false;
            } else if (a+t==this.X1) { //first ellipsoid
                pathcode = _WyanPaths['e1I1'];
            } else if (a>=this.X1||t>=this.X1) { //other dots
                let l = Math.min(a, t), h = Math.max(a, t);
                if (h-l<=this.X2-1){ //
                    if(h-l==this.X1-1) { //4: 5-7 -> 2;
                        if (a>t) {pathcode = _WyanPaths['bTI2']}
                        else {pathcode = _WyanPaths['bAI2']}
                    } else {
                        pathcode = _WyanPaths['4d__'];
                    }
                } else {
                    return false;
                }
            }
            let p = _pex1c(a, t, pathcode);
            return p; //in the form [[a, t], '+0', [a+1, t], ...]
        }

    }
    wyan_pathExists (path) {
        if (!path) return false;
        for (let i=0;i<path.length;i+=2) { //we skip pathfrase item
            let a = path[i][0], t = path[i][1];
            if (!this.intersection(a, t))
                return false;
        }
        return true;
    }
    wyan_vecs (a, t, up=false) {
        let path = this.wyan_path(a, t)
        if (!path || !this.wyan_pathExists(path)) return []

        let wyan = [], wnam = `Wyan ${a}:${t}:${up}`
        for (let i=0;i<=path.length-1;i+=2) {
            if (i==path.length-1) break

            let a = path[i][0],
                t = path[i][1]
            let arr = [a, t]
            let pw = path[i+1] //string representation of path step
            let pfr = [...pw]//pw.split("")
            let cwd = true //clockwise direction

            //if T in the pair is not getting lower or A doesn't grow, we write CW
            if (pw == "-0" || pw == "0+") cwd = false
            //"downstairs" draw everything in opposite direction
            if (up) cwd = !cwd

            for (let c=0;c<pfr.length;c++) {
                if (pfr[c] == '+')
                    arr[c] += 1
                else if (pfr[c] == '-')
                    arr[c] -= 1
            }
            let d0 = this.intersection(a, t, up)
            let d1 = this.intersection(arr[0], arr[1], up)

            let index = pfr.indexOf('0')
            let foci = [this.A, this.T]
            let curr = [a, t] //current radius

            // FIXME(Xi): From here to separate function?
            //
            if (index > -1){ //an ark around some focus

                let radius = curr[index] * this.Mok1

                let ar0 = this.angle(d0, foci[index]),
                    ar1 = this.angle(d1, foci[index])

                let name = this.arc(foci[index], f(radius), ar0.angle, ar1.angle, cwd)

                // if(_DEBUG_){CL(`WV: arc ${name}`)}

                this.toGroup(wnam, this.G[name].object)

                // if(_DEBUG_){CL(`WV: after toGroup ${wnam}`)}

                wyan.push(this.G[name].vectors)
            } else { //a line between dots
                let lnnam = this.line(d0, d1)
                this.toGroup(wnam, this.G[lnnam].object)
                wyan.push(this.G[lnnam].vectors)
            }
        }

        this.G[wnam] = {vectors: [].concat.apply([], wyan), vertices: null, object: 'undefined'}
        return wnam
    }
    wyans_all (symbols=WConsts.cWAE_CYR) { //accepts -1 to colorize by indexes only

        let wd = new WDbmSymbols(symbols, 0, this.X1) //IN ORDER TO WORK WITH TEXT WE WILL HAVE TO EXTEND THE CLASS

        for(let t=0;t<dbm.X2;t++){
            for(let a=0;a<dbm.X2;a++){
                let p = dbm.wyan_path(a, t)
                if (dbm.wyan_pathExists(p)) {

                    this.backupColor()

                    if (symbols == -1) {

                        let wv = null

                        let a1 = wd.MaxIndex - wd.smod(a, wd.MaxIndex),
                            t1 = wd.MaxIndex - wd.smod(t, wd.MaxIndex)
                        let index_color = wd.color_by_index_only(a1, t1, true)
                        this.Color = `#${index_color}`
                        wv = dbm.wyan_vecs (a, t, true)

                        let a0 = t,
                            t0 = a
                        index_color = wd.color_by_index_only(a0, t0)
                        this.Color = `#${index_color}`
                        wv = dbm.wyan_vecs (a, t)

                        // CL(`A${a}T${t} => ${a0}:${t0} + ${a1}:${t1}`)

                    } else { //if (false) {
                        let tr = wd.triple_AT(a, t), ntr = wd.triple_AT(a, t, true)
                        // let trvp = wd.word_value(tr), trvn = wd.word_value(ntr)
                        let colp0 = wd.color_by_word (tr)
                        let coln0 = wd.color_by_word (ntr)
                        this.Color = `#${colp0}`
                        let wv0p = dbm.wyan_vecs(a, t)
                        this.Color = `#${coln0}`
                        let wv0n = dbm.wyan_vecs(a, t, true)
                        // let wm0p = dbm.mesh(wv0p, `#${colp0}`)
                        // let wm0n = dbm.mesh(wv0n, `#${coln0}`)
                    }

                    this.backupColor()
                    // this.dot(this.intersection(a, t), this.DotSize*2, `${wd.сolor_invert(colp0, true)}`)
                    // this.dot(this.intersection(a, t, true), this.DotSize*2, `${wd.сolor_invert(coln0, true)}`)
                }
            }
        }
    }
}


var WLLEN = 5 
let wd = new WDbmSymbols(WConsts.cWAE_CYR, 0, WLLEN)
var dbm = new WDbm(), D = (pos, col) => dbm.dot(pos, dbm.DotSize*3, col), I = (a, t, up=false) => dbm.intersection (a, t, up)


function animate () {
    function Build () {    
        dbm.wyans_all(-1); 
        D(dbm.A, dbm.A_Color)
        D(dbm.T, dbm.T_Color)
    }

    dbm.init(WLLEN)
    Build()

    dbm.WG.OrbitControls.update();

    requestAnimationFrame( animate );
    dbm.WG.labelRenderer.render( dbm.WG.scene, dbm.WG.camera );
    dbm.WG.renderer.render( dbm.WG.scene, dbm.WG.camera );
} 
animate()











