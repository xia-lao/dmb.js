
/**
 * @module "Discrete Bicentric Model Language"
 * @author Xia Lao, Ly La
 * @copyright 2001..now
 * @version 0.1.0
 * Module for operations with waer: transliteration from and to waer symbols in UNICODE, date and time operations,
 * search for symbols and associations from and to waer, gematria calculation based on waer, 
 * hebrew and English Trigrammaton Qabbalah by L.R. Gilles,
 * beatifying the trinary code into trigram-like UNICODE symbols,
 */

let GeoInitialized = false, CL =  console.log, fuckoff = (msg='Just fuck off!') => {throw (msg)}, f = (p) => {return [p, p]}

const WConsts = {
    cENG_ALP:0, cENG_VAL:1, cENG_COR:2, cENG_NAM:3,  cENG_WAE:4,
    cWAE_CYR:2, cWAE_XOG:1, cWAE_TRL:0, cWAE_LAT:3, cWAE_VAL:4, cWAE_DRW:5, cWAE_NAM:6,

    M0440L: 0, M0440W: 1, M0044L: 2, M0044W: 3

}

class WLetBase {
    // constructor () {
    C = WConsts;
    // }
    array_rotate (arr, steps, direction) {
        if (steps >= arr.length) {
            steps = steps % arr.length;
        }
        if (direction) {
            return arr.slice(arr.length - steps, arr.length).concat(arr.slice(0, arr.length - steps));
        } else {
            return arr.slice(steps, arr.length).concat(arr.slice(0, steps));
        }
    }
    smod (num, baselen) {
        // 0, 1, 2, 3, 4, 5, 6, 7,
        // 0, 1, 2, 3, 2, 1, 0, 1,
        let nummod = num % baselen
        let dir = (Math.floor(num / baselen)%2 == 1)?1:-1
        if (num >= baselen) {
            if (num % baselen != 0 && Math.floor(num/baselen)%2 == 1) {
                nummod = baselen - (num % baselen)
            } else {
                nummod = num - (Math.floor(num/baselen) * baselen)
            }
        }
        if (num > 0 && num % baselen == 0)
        nummod = dir>0?baselen:0
        return nummod
    }
    byIndex (ndx, what) {
        if (ndx > 0 || ndx < this.waer_xog.length)
        return this.Symbols[what][ndx]
        else throw (`byIndex index error: '${ndx}'`)
    }
    findInSymbolsAndTranslate (ltr, where, to) {
        let ret = null
        let cursor = this.Symbols[where].indexOf(ltr)
        if (cursor >= 0 && cursor < this.Symbols[to].length){ //TEQ-Waer search must be done carefully ))
            return this.Symbols[to][cursor]
        }
        return ret
    }
}

class WLetTrigr extends WLetBase {
    constructor () {
        super ()
        this.trig_eng_alp = "i l c h x t y p a j w o g z b f s m n e r q v k d u #".split(" ")
        this.trig_eng_val = [0,1,2,3,6,9,18,4,5,7,8,10,11,19,20,12,15,21,24,13,14,16,22,17,23,25,26]
        this.trig_eng_cor = "☸ ☯ ☷ ☶ ☴ ☰ ☊ ☋ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ♄ ☿ ☉ ♃ ♀ ☽ ♂ ⨁".split(" ")
        this.trig_eng_nam = "Tao De Fire Water Air Earth Caput Cauda " +
        "Aries Taurus Gemini Cancer Leo Virgo Librae Scorpius Sagittarius Capricornus Aquarius " +
        "Saturnus Mercurius Sol Jupiter Venus Luna Mars Terra".split(" ")
        this.trig_eng_wae = 'k x e . j a c o b . . # l . q s y z g p h b r n f . t i u m v d .'.split(" ")
        this.Symbols = [this.trig_eng_alp, this.trig_eng_val, this.trig_eng_cor, this.trig_eng_nam, this.trig_eng_waer]
    }
    teq_analize (text) {
        let tg = {r:this.trig_eng_alp, v: this.trig_eng_val}
        text2 = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " "); //remove punctuation and extra spaces
        let tar = text2.toLowerCase().split(" ");
        let ret = {words:[], gemas:[], letters:{}, total:0, wtot:[], text2: text2};
        let gem = 0;
        for (let i=0;i<tar.length;i++) {
            if (!isNaN(tar[i])) { //if we have plain number
                gem = parseInt(tar[i]);
                ret.words.push(tar[i]);
            } else { //if we have a word
                if (ret.words.indexOf(tar[i])==-1) { //if this word is seen for the first time
                    ret.words.push(tar[i]);
                    gem = 0;
                    let word = tar[i].split("");
                    for (let j=0;j<word.length;j++) {
                        let index = tg.r.indexOf(word[j]);
                        if(index > -1) {
                            gem += parseInt(tg.v[index]);
                            if (typeof(ret.letters[tg.r[index]]) == "undefined"){ret.letters[tg.r[index]] = 0}
                            ret.letters[tg.r[index]] += 1;
                            //but the numbers won't be counted
                        }
                    }
                    ret.gemas.push(gem);
                } //no need to work on already done word
            }
            ret.total += gem;
            if (typeof(ret.wtot[gem]) == "undefined") { //here we save the word that has some gematria in a list by gematria
                ret.wtot[gem] = [tar[i]];
            }else{
                if (ret.wtot[gem].indexOf(tar[i]) == -1) {
                    ret.wtot[gem].push(tar[i]);
                }
            }

        }
        return ret;
    }
    teq_gematria (word) {
        let tg = {r:this.trig_eng_alp, v: this.trig_eng_val}
        let wd = word.split("");
        let ret = 0;
        for (let i=0;i<wd.length;i++) {
            if(tg.r.indexOf(wd[i]) > -1) {
                ret += parseInt(tg.v[tg.r.indexOf(wd[i])]);
            }
        }
        return ret;
    }
    teq_analize_short (text) {
        let t = this.teq_analize(text);
        let ar0 = []
        for (let i=0;i<t.words.length;i++) {
            let g = this.trigr_beautify(t.gemas[i].toString(3));
            ar0.push(`( ${t.words[i]}, ${t.gemas[i]}, ${g} )`); //formatted string "" (word, gematria, trigram) ""
        }
        return ar0.join(", ");
    }
    trigr_beautify (tristr) {
        var tval = parseInt(tristr, 3);
        var sval = tval.toString(3);
        if (tristr != sval) { return NaN }
        //version of padding
        //https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
        if (tristr.length % 3 != 0){
            let add = 3 - (tristr.length % 3);
            for (let i=0;i<add;i++){tristr = "0" + tristr}
        }
        var p = tristr.split(""), ret="";
        var trigr = "○┃╏".split("");//"∗ ∙ ∘".split(" ")
        for (let i=0;i<p.length;i++){
            switch(p[i]){
                case "0":
                ret += trigr[0];
                break;
                case "1":
                ret += trigr[1];
                break;
                case "2":
                ret += trigr[2];
                break;
            }
        }
        return ret;
    }
    trigr_antigram (decimal) {
        var tri = decimal.toString(3).split("");
        var ant = "";
        tri.forEach(function(el){
            switch (el) {
                case "0":
                ant += "0"
                break;
                case "1":
                ant += "2"
                break;
                case "2":
                ant += "1"
                break;
            }
        });
        return ant;
    }
    trigr_reverse (decimal) {
        return parseInt(decimal.toString(3).split("").reverse().join(""), 3);
    }
}

class WLet extends WLetBase {
    constructor () {
        super()
        this.prep_props()
    }
    prep_props () {
        //we add push(" ") in order to match the space sign, used in waer_drw

        //0
        this.waer_trl = "э ω I я з а å м ξ г к т в у щ б о ρ ш л c ё р ж й п х е и w д θ н э ы å ф ˉ ˉ ч ⁝ ⁅ ⁆ ⁝ͱ ⁝|⁝ ео ".split(" "); this.waer_trl.push(" ")
        
        //1
        this.waer_xog = "⅄ ͱ ɾ q ʌ p չ ↷ m ϙ I C ʙ ʜ O Ƒ ɯ ϵ ʞ d ψ Ξ ʀ Պ b Ʋ ⊥ է T Ɣ Δ փ n Y Ӻ = ϟ ˉ ˉ փ ⁝ ⁅ ⁆ ⁝ͱ ⁝|⁝ Ϣ ".split(" "); this.waer_xog.push(" ") //ꙈꙉƕʎըϯʞѦŦ
        
        //2
        this.waer_cyr = "э ы ь я з а ъ м ю г к т в у щ б о Р ш л с ё р ж й п х е и В д ц н Э Ы Ъ ф – - ч _ ( ) ? ! ео ".split(" "); this.waer_cyr.push(" ")
        
        //3
        this.waer_lat = "e y I q z a A m X g k t b u C b o R S l s E r J j p h e i w d T n E Y $ f – - Z _ ( ) ? ! eo ".split(" "); this.waer_lat.push(" ")
        
        //4
        this.waer_val = [1,2,3,4,5,6,7,8,9,10,11,1*12,2*12,3*12,4*12,5*12,6*12,7*12,8*12,9*12,10*12,11*12,1*144,2*144,3*144,4*144,5*144,6*144,7*144,8*144,9*144,10*144,11*144,1,2,3,4*144*2,0,0,10*144,0,0,0,0,0,936, 0]
        
        //5
        this.waer_drw = [
            "00 2+01 4+02 2-20 2+01", //wati 18
            "20 2+02 2+12 4-01 2+30", //eroth 18
            "02 1+20 3+01 1-20 4+02 1+01", //1эер 22
            "20 1+10 1+12 1+03 2+01 2-20 4+02 1+01", //яян30
            "03 1+20 2+21 2+03 1+02", //Зера
            "04 1+01 4+20 2+01 1+03 1+12 1+10",//Акюа
            "20 2+12 3-01 2+12", //ъьъ14
            "04 4+21 4+02", //мокь 10
            "00 4+02 3-20 4+01 1-30 1-10 4+02 2-01 4+20", //юерь34
            "24 2+20 1+10 1+30 1+21 2+01 1+03 1+12", //га 30
            "20 4+02",// 2+01 1+03 1+21 1+10", //кымп
            ////
            "44 1+30 1+12 1+10 1+30 2+20 1+21 1+01 1+03 1+21", //тВъвв30
            "40 1+30 1+10 2+12 1+03 2+01 2-10 1+12 2+03 1+01 1+21 4+20", //въжа
            "00 4+02 2-20 4+01 2-20 4+02", //уюсъ
            "20 2+12 2+03 2+21 2+30", //щит
            "00 4+01 4+02 2-20 3-10 3+01", //бйер
            "00 1+02 2+03 2+21 1+20 4-12 1+21 1-01 2+20 2-02 1-01 1+03", //о
            "40 1+10 2+12 2+03 1+01 2-20 4+10", //РуВ
            "00 1+01 2+03 1+01 1-10 2+12 1+10 4-21 4+02",//шелй
            "40 1+10 4+02 2+10 1+30 1+21 1+01",//лъу
            "00 2+03 2-02 3+20 1-02 2+21",//сэлй
            "00 4+01 2-02 4+10 2-02 4+01",//ёж
            ////
            "04 4+20 2+01 1+03 1+12 1+10 1-01 2+03",//реед
            "04 2+21 2+20 4-02 1+21 1+03",//jeoz
            "00 1+01 4+02 2+01 1+21 1+30 1+10",//yar
            "00 4+02 4+01 4+20",//пеюц
            "03 1+03 1-01 4+20 4-02 1-01 1+21",//хуВ
            "00 4+02 4+01 2-20 1-10 3+10",//egx
            "00 4+01 2-10 4+02",//iasn
            "04 3+21 1+30 1+12 3+03",//Вян
            "03 1+02 4+01 1+20 1+30 1+20 1+30 1+12 1+02 1+12",//дыъ
            "04 2+20 4+01 2+20 2-10 4+02",//цэгх
            "04 4+20 4+01 4+02",//на
            ////
            // Э Ы Ъ ф – - ч _ ( ) ? ! ео
            "", "", "",
            "00 2+02 4+01 2+02",//affa
            "", "", "", "",  "", "", "", "",
            "44 4+10 4+20 2-02 2+01 1+20 1-03 1+01 2+20",//eoh
            //space
            "21 1+02 1-02 1+02" 
        ]
        
        //6
        this.waer_nam = "уо эр ье яа зо ак ъь ме юэ га кВ тВ въ ую щь бй оо Ру ше лэ се ёж ре же йа пи ху ее ии Вя дw цу на".split(" ")
        
        //7
        this.waer_num = ["фа", "эр ω Iэ я зе аз åI мо ξе га кω".split(" "), "та вå ξcå же бйе оо".split(" ")]
        
        this.Symbols = [this.waer_trl, this.waer_xog, this.waer_cyr, this.waer_lat, this.waer_val, this.waer_drw, this.waer_nam]
        this.__rndxgcntr = 33
        this.__rndxtab = this.waer_cyr.slice(0, 33)
    }

    xog_rand(NEWP=false) {
        /**
        * Function will return a random xoggva once, having iterated over all waer, starts from the full 33-set
        */
        if (NEWP || this.__rndxgcntr == 0) {
            this.__rndxgcntr = 33
            this.__rndxtab = this.waer_cyr.slice(0, 33)
        }
        //cryptoStor = new Uint16Array(33)
        //crypto.getRandomValues(cryptoStor)
        let ndx = Math.floor(Math.random() * (this.__rndxtab.length))
        let ret = this.__rndxtab[ndx]
        this.__rndxtab.splice(ndx, 1)
        this.__rndxgcntr--
        return ret
    }
    xog_index_by_cyr (cyr) {
        return this.waer_cyr.findIndex(x=>x==cyr)
    }
    xog_index_by_xog (xog) {
        return this.waer_xog.findIndex(x=>x==xog)
    }
    xog_is (cyr) {
        return this.xog_index_by_cyr(cyr) >= 0? true: false
    }
    xog_dec2hog (num) {
        if (num == 0) return "ϟ";
        var als = this.waer_xog.slice(0, 33)
        var flv = [];
        var slv = [];
        var tlv = [];
        for (let i=1; i < 12; i++) {
            flv[i-1] = i;
            slv[i-1] = i * 12;
            tlv[i-1] = i * 144
        }
        var alv = flv.concat(slv, tlv);
        ///////////////////////////////////////////////
        var rest = 0, ret = "", arr = [];
        do {
            rest = Math.floor(num / (12**3));
            num = num % (12**3);
            var counter = num;
            for (let i = alv.length-1; i >= 0; i--) {
                if (alv[i] <= counter) {
                    ret += als[i];
                    counter -= alv[i];
                }
            }
            arr.unshift(ret);
            num = rest;
            if (num > 0) {
                ret = "";
            }
        } while (rest > 0);
        return arr.length>1?arr.join("."):arr[0];
    }
    xog_hog2dec (hog) {
        /**
         * This one converts 2153 to ⅄.ՊΞʌ
         * There are other options. First of them - lack of dot separator. We are to teach the function to find missing zeroes 
         * OR
         * difference between N2Os are to be neglected so 2153 should look like ͱ⅄ʌɾ, so simple positional base
         * The forumla is to be seen as number somehow, not by simple summation, so 
         */
        if (hog == "ϟ") return 0;
        var als = this.waer_xog.slice(0, 33)

        //PYTHON: [i*12**j for j in range(0, 3) for i in range(1, 12)]
        
        var flv = [], slv = [], tlv = [];
        for (let i=1; i < 12; i++) {flv[i-1] = i; slv[i-1] = i * 12; tlv[i-1] = i * 144}
        var alv = flv.concat(slv, tlv);
        var grp = hog.split(".");
        var res = 0;
        for (let i = grp.length-1; i >= 0; i--) { //this is the counter of power of twelve
            var ai = grp.length - i - 1;
            var dig = grp[i].split("");
            for (let j = dig.length-1; j >= 0; j--) { //this is the counter of the digits in 3-groups
                var ndx = als.indexOf(dig[j]);
                if (ndx >= 0) {
                    res += ((12**3)**ai) * alv[ndx];
                }
            }
        }
        return res;
    }
    xog_cyr2hog (str, SorT=true) {
        var ca = str.split(""),
        cy = this.waer_cyr,
        ho = this.waer_xog,
        rt = [];
        if (!SorT)
        ho = this.waer_trl

        for (var i = 0; i < ca.length; i++){
            let pos = cy.indexOf(ca[i]);
            if (pos == -1) {
                if (ca[i] == " ") {
                    rt[i] = " ";
                } else if (cy.indexOf(ca[i].toLowerCase()) != -1) {
                    rt[i] = "⁝" + ho[cy.indexOf(ca[i].toLowerCase())];
                } else {
                    rt[i] = "" + ca[i] + "";
                }
            } else {
                rt[i] = ho[pos];
            }
        }
        return rt.join("");
    }
    xog_sumFromCyr (str) {
        let ret = -1
        for (let l of str) {
            let ind = this.xog_index_by_cyr(l)
            if (ind >= 0)
            ret += this.waer_val[ind]
        }
        return ret
    }
    xog_cyr2dec = (str) => this.xog_hog2dec(this.xog_cyr2hog(str))
}

class WDate extends WLet {
    constructor() {
        super()
    }

    wdate_Now() {
        var ts = new Date().getTime();
        return ts;
    }
    wdate_DTS2WTS (timestamp) { //date-time stamp to waer time stamp
        //milliseconds from epoch (1/0/1970) to waer time
        //TODO: one day think how to SUBSTRACT 66 years correctly - waer epoch starts at 20/00/1904
        //x = mhpd * ts / mspd
        var milsecperday = 24*60*60*1000; //86400000
        var milhogperday = 33**3 * 33**2; //39135393
        var hogts = milhogperday * timestamp / milsecperday
        return this.xog_dec2hog(Math.round(hogts)/*FUCK CORRECTNESS*/);
    }
    wdate_WTS2DTS (waerts) { //waer time stamp to date-time stamp
        //waer timestamp to milliseconds from epoch (1/0/1970)
        //TODO: one day think how to ADD 66 years correctly - waer epoch starts at 20/00/1904
        //x = mspd * waerts / mhpd
        var wts = this.xog_hog2dec(waerts);
        var milsecperday = 24*60*60*1000; //86400000
        var milhogperday = 33**3 * 33**2; //39135393
        var ts = milsecperday * wts / milhogperday;
        return Math.round(ts); // FUCK CORRECTNESS TWICE!
    }
    wdate_LeapYear(year) {
        var result;
        if (year % 400 == 0) {
            result = true
        } else if (year % 100 == 0) {
            result = false
        } else if (year % 4 == 0) {
            result= true
        } else {
            result= false
        }
        return result;
    }
    wdate_dayOfYear(ts){
        var now = new Date(ts);
        var start = new Date(now.getFullYear(), 0, 1);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);
        return day;
    }
    wdate_dateDiff(strdA, strdB) {
        var a = new Date(strdA);
        var b = new Date(strdB);
        var diff = b - a;
        var oneDay = 1000 * 60 * 60 * 24;
        return  Math.floor(diff / oneDay);
    }
    wdate_get20MarDayOfYear(ts) {
        var now = new Date(ts);
        var efuy = now.getYear()
        var nDays = (Date.UTC(efuy, 2, 20) - Date.UTC(efuy, 0, 1)) / 86400000;
        return nDays;
    }
    wdate_WaerDT(ts) {
        ts = ts || this.wdate_Now();
        let edt = new Date (ts);
        let efuy = edt.getYear(), emon = edt.getMonth(), edat = edt.getDate();
        let sfuy = efuy;
        // if march, but not yet 20th
        if (this.wdate_dayOfYear(ts) < this.wdate_get20MarDayOfYear(ts))
        sfuy--
        let nDays = (Date.UTC(efuy, emon, edat) - Date.UTC(sfuy, 2, 20)) / 86400000;
        let wmon = Math.floor(nDays / 28);
        let wdag = nDays % 28;
        let secs = edt.getSeconds() + (60 * (edt.getMinutes() + (60 * edt.getHours())));
        let wtotsecs = secs * 35937 / 86400
        let whours = Math.floor(wtotsecs / 1089);
        let tmp0 = wtotsecs - whours * 1089;
        let wmins = Math.floor(tmp0 / 33);
        let wsecs = Math.floor(tmp0 - wmins * 33);
        //Year, Month, Day of Month, Day of Year, Hour, Minute, Second
        let time_array = [
            efuy-4,
            wmon,
            wdag,
            nDays,
            whours,
            wmins,
            wsecs,
        ];
        return time_array;
    }
    wdate_WTime (ts) {
        let t0 = this.wdate_WaerDT(ts)
        let t1 = this.wdate_WaerizeWDTArray(t0)
        let t2 = `\`${t1[4]}:${t1[5]}:${t1[6]} (${t0[4]}:${t0[5]}:${t0[6]})`
        return  [t0[4], t0[5], t0[6], t1[4], t1[5], t1[6], t2]

    }
    wdate_WDate (ts) {
        let wdt = this.wdate_WaerDT(ts)
        let wdta = this.wdate_WaerizeWDTArray(wdt)
        //Year, Month, Day of Month, Day of Year, Hour, Minute, Second
        let wdat =
        "" + wdta[0] + ";" + wdta[1] + ";" + wdta[2] +
        ", #" + wdt[3] + " / " + this.xog_dec2hog(wdt[3]) +
        " / " + wdta[3]
        return wdat
    }
    wdate_toString (ts) {
        ts = ts || this.wdate_Now()
        let dta = this.wdate_WaerDT(ts)
        let wdta = this.wdate_WaerizeWDTArray(dta)
        let wdt =
        "" + wdta[0] + ";" + wdta[1] + ";" + wdta[2] +
        ", #" + dta[3] + " / " + this.xog_dec2hog(dta[3]) +
        " / " + wdta[3] + "; " + "`" +
        wdta[4] + ":" + wdta[5] + ":" + wdta[6];
        return wdt
    }
    wdate_WaerizeWDTArray (time_array) {
        var ta = time_array.slice();
        var als = this.waer_xog;
        var year=this.xog_dec2hog(ta[0]),
        trig = new WLetTrigr (),
        wmon=("ϟђYɭqʌpչ↷mϙIC".split(""))[ta[1]],
        wdag=this.xog_dec2hog(ta[2]),//ta[2],
        nDays=trig.trigr_beautify((ta[3]).toString(3)),
        whours=als[ta[4]],
        wmins=als[ta[5]],
        wsecs=als[ta[6]];

        // var teq = {
        //     eng: trig.trig_eng_alp,
        //     dec: trig.trig_eng_val,
        //     sym: trig.trig_eng_cor
        // };
        // teq.eng.unshift("ʔ"); teq.dec.unshift("()"); teq.sym.unshift("☼");

        // if (wdag != 0) {
        //     wdag = trig.trigr_beautify(parseInt(teq.dec[wdag]).toString(3));
        // } else {
        //     wdag = teq.dec[wdag];
        // }
        return [year, wmon, wdag, nDays, whours, wmins, wsecs];
    }
    wdate_UncipherWDT(wdt) {return this.wdate_WaerDT(this.wdate_WTS2DTS(wdt))}
    wdate_json2wdt (wdtstr) {return JSON.parse(sdtstr)}
    wdate_wdt2json (wdt) {return JSON.stringify(wdt)}
}

class WDbmSymbols extends WLet {
    constructor(symbols=WConsts.cWAE_XOG, start=0, len=33){

        super()

        this._symbols = symbols
        this._start = start
        this._length = len

        ////https://en.wikipedia.org/wiki/X11_color_names#Color_name_chart
        ////https://github.com/gka/chroma.js

        this.MaxIndex = len - 1

        if (symbols >= 0) {
            this.Waer = (this.Symbols[symbols]).slice(start, start+len)
            let getMaxVal = () => { //straightforward solution, no idea how to do better
                // FIXME(Xi): Find better way to calculate this!
                // HACK(Xi): Cache it!
                let recname = md5(JSON.stringify(this.Waer))+"_MaxVal"
                let mv = 0
                // if (recname in localStorage) {
                //     mv = parseInt(localStorage.getItem(recname))
                //     return mv
                // }
                // if (typeof (mv) != "null") return mv
                for (let i=0;i<this.MaxIndex;i++){
                    for (let j=0;j<this.MaxIndex;j++) {
                        let tr = this.triple_from_table(i, j)
                        let vl = this.word_value(tr)
                        if (vl > mv)
                        mv = vl
                    }
                }
                localStorage.setItem(recname, mv+1) //+1 is just in case )
                return mv+1
            }
            this.MaxVal = getMaxVal()
            this.RBW = new Rainbow()
            this.RBW.setNumberRange(0, this.MaxVal)
        }

        this.MaxIndexesSum = this.MaxIndex * 3
        this.iRBW = new Rainbow()
        this.iRBW.setNumberRange(0, this.MaxIndexesSum)
    }
    сolor_invert(hex, bw) { //src - http://qaru.site/questions/11583981/how-can-i-generate-the-opposite-color-according-to-current-color
        /**
         * Get inverted color for the given hex value
         * @param {*} hex color to get flashing color for
         * @param {bool} bw use white and black or not
         */
        function padZero(str, len) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        }
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + padZero(r) + padZero(g) + padZero(b);
    }
    /**
     * Get color of a string of the symbols according to gematria and chosen gradient
     * @param {string} word
     */
    color_by_word(word) {
        let wg = this.word_value(word)
        let col = this.RBW.colourAt(wg)

        // console.log(`Word ${word} has value ${wg} and color ${col} --- (fn color_by_word)`)
        return col
    }
    /**
     * Get color of the value within the set up gradient
     * @param {integer} val value, not exceeding MaxVal of the chosen alphabet (symbols)
     */
    color_by_val(val) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        if (val >= this.MaxVal) return false
        let col = this.RBW.colourAt(val)
        return col
    }
    color_by_IJ (i, j, l=0) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        let word = this.triple_from_table(i, j, l)
        let val = this.color_by_word(word)
        return val
    }
    color_by_index_only(i, j, l=0) {
        let val = this.triple_ndx(i, j)
        let col = this.iRBW.colourAt(val)
        return col
    }
    /**
     * Returns word value in current chosen letters, so cyrillization doesn't work with xoggvas!
     * @param {string} word a word to get gematria for
     */
    word_value (word) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        let arr = [...word], res = 0
        for (let ltr of arr) {
            let val = this.findInSymbolsAndTranslate(ltr, this._symbols, WConsts.cWAE_VAL)
            if (val != null) res += val
        }
        return res
    }
    /**
     * Finds the letter at offset from the given
     * @param {char} ltr
     * @param {integer} steps
     */
    shift_xog (ltr, steps) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        // let v0 = this.findInSymbolsAndTranslate(ltr, where, to=where)
        let cursor = this.Symbols[this._symbols].indexOf(ltr)
        let c2 = this.smod(cursor + steps, this._length)
        return this.Symbols[this._symbols][c2]
    }
    /**
     * Gets a triple at ij position, when searched as in the table, which differs from the method of numbering the circles
     * @param {integer} i offset from A-focus
     * @param {integer} j offset from T-focus
     */
    triple_from_table (i, j) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        let basic_pair = this.Waer[this.smod(i, this.MaxIndex)] + this.Waer[this.smod(j, this.MaxIndex)]
        let level = this.triple_ndx(i, j)
        let llet = this.Waer[level]
        return basic_pair + llet
    }
    triple_AT(a, t, up=false, l=0) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        let sa = this.smod(a, this._length)
        let st = this.MaxIndex - this.smod(t, this._length)
        let sl = this.smod(l, this._length)
        if (up) {
            /*  AaEe table; aE-eA circles

                0:4 -> aE
                1:(4;3) -> aD; bD; bE
                2:(4;3;2) -> aC; bC; cC; cD; cE
                if (a + t >= this.X1-1) { //intersection should exist!!!
                    if (a >= t) { // In I1 we're in upper half of table or on base axis
                        ;
                    } else { //
                        if (Math.abs(a - t) < this.X1) {
                        if (t > a) { In I1 this is lower half
                                ;
                        }
                    }
                }
             TA GA BA AA
             TB GB BB ab
             TG GG bg ag
             TT gt bt at
             //a:t numeration differs in that it has up parameter and in general, lower part of table can be avoided
             //since the DBM is in general (without l-component) diagonal matrix, not full square
             //just SWAP VARIABLES AND GO AHEAD.
            */
           [sa, st] = [st, sa]
        }
        let tr = this.triple_from_table (sa, st, sl)
        let t0 = ""
        if (l > 0){
            for (let v of tr)
                t0 += this.shift_xog(v, sl)
            tr = t0
        }
        return tr
    }
    triple_sum (triple, to33=false) {
        if (this._symbols < 0) fuckoff("SYMBOLS CHOSEN -1")
        let ar0 = 0
        for (let v of triple) {
            let v0 = this.findInSymbolsAndTranslate(v, this._symbols)
            ar0 += v0
        }
        if (to33) ar0 = ar0.toString(33)
        return ar0
    }
    /**
     * There is no difference for this function, whether we select as table or as circles,
     * the numerator is table-like ONLY
     * @param {*} i row
     * @param {*} j column
     * @param {*} to33 should we give only 1 sign, which is 33-fold counting system
     */
    triple_ndx(i, j, model=WConsts.M0440W, to33=false) {
        // TODO(Xi): Possible FAIL!
        let i0 = this.smod(i, this.MaxIndex), j0 = this.smod(j, this.MaxIndex)

        let level = 0
        switch (model) {
            case WConsts.M0440L: //04-40 "лента"
                level = (i0 + j0) <= this.MaxIndex
                ? this.MaxIndex - (i0 + j0)
                : this.MaxIndex + (this.MaxIndex - (i0 + j0)) + 1
                break;
            case WConsts.M0440W: //04-40 "крылья"
                level = Math.abs(this.MaxIndex - (i0 + j0))
                break
            case WConsts.M0044L: //00-44 "лента"
                level = (i0 > j0) ? this.MaxIndex - (i0 - j0) + 1 : Math.abs(i0 - j0)
                break;
            case WConsts.M0044W: //00-44 "крылья"
                level = Math.abs(i0 - j0)
                break;
        }
        level = this.smod(level, this.MaxIndex)
        if (to33) level = level.toString(33).toUpperCase()
        return level
    }
    triple_xoggvas(i, j, t) {
        return this.waer_xog[i] + this.waer_xog[j] + this.waer_xog[t]
    }
    triple_xog_val (i, j, t) {
        return this.waer_val[i] + this.waer_val[j] + this.waer_val[t]
    }
    __test_triples () {
        let align_left = function (str, len) {
            if (str.length < len)
            str = " ".repeat(len-str.length) + str
            return str
        }
        let ssum = function (ar) {
            let ar0 = 0
            for (let i of ar) {
                // ar0 += parseInt(i, 33)
                ar0 += i
            }
            return ar0
        }

        $('body').append('<table id="tbl0" border="1"></table>')

        for (let i=0;i<=this.MaxIndex;i++) {
            $('#tbl0').append('<tr id="' + `t0r_${i}` + '" align="center"></tr>')
            for (let j=0;j<=this.MaxIndex;j++) {

                let t = this.triple_ndx(i, j, 0), xgw = this.triple_xoggvas(i, j, t); 
                if (xgw.indexOf('undef') >= 0) console.error (`${i}:${j}: ${xgw}; NDX ${t}`)

                let strn = ssum([i,j,t])

                let val = this.word_value(xgw);
                let colI = this.color_by_index_only(i, j);
                let colX = this.color_by_word(xgw);
                let icolI = this.сolor_invert(`#${colI}`);
                let icolX = this.сolor_invert(`#${colX}`);

                let str = `
                    <div id="d0_${i}${j}${t}">
                      ${i}.${j}.<b>${t}</b>
                    </div>
                    `+
                    // <br />
                    // ${val}—<b>${strn}</b>
                    // <br />
                    `<div id="d1_${i}${j}${t}">
                       <b>${xgw}</b>
                     </div>`
                // str = `
                // `
                $(`#t0r_${i}`).append('<td id="' + `t0r_${i}_c_${j}` + '"></td>'); $(`#t0r_${i}_c_${j}`).append(str)

                $(`#d0_${i}${j}${t}`).css(`backgroundColor`, `#${colX}`).css('color', icolX)
                $(`#d1_${i}${j}${t}`).css(`backgroundColor`, `#${colI}`).css('color', icolI)
            }
        }
    }
    // let limit = 11
    // let L = new WDbmSymbols(WConsts.cWAE_XOG, 0, limit, WConsts.M0044L)//.M0440L)//.M0044W) //WConsts.M0440W)
    // L.__test_triples()
}

class MusO {
    constructor () {
      this.Griff = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    }

    __ShiftDiatonicStep (param) {
        param = param || this.Griff.splice(0)
        let next = 1
        if (param[next].length == 2) next = 2
        let l0 = param.splice(0, next)
        param.push(l0)
        return next //returns the number of halftones pushed
    }

    __DiatonicStruct (notes) {
        let gl = notes || this.Griff.slice(0)
        let start = gl[0], nextstep = "", retstruct = ""
        do {
        let steplength = this.__ShiftDiatonicStep (gl)
        gl = gl.flat()
        nextstep = gl[0]
        retstruct += (steplength == 2? "T" : "S")
        } while (nextstep != start)
        return retstruct
    }

    __GetHalfToneStruct(scheme) {
        let sch0 = scheme.split(""), s = []
        for (let step of sch0) s.push(step == "T" ? 2 : 1)
        return s
    }

    __ChromaticFrom (note) {
        let io = this.Griff.indexOf(note)
        if (io < 0) throw (`No such note ${note}! \nEnough of me!`)
        let param = this.Griff.slice(0)
        let l0 = param.splice(0, io)
        param.push(l0); param = param.flat();
        return param
    }

    GetDiatonicModeFrom (notemode, note) {
        if (notemode.length != 1) throw (`Not diatonic mode from ${note}!\nI kill myself!`)
        let mode = this.__GetHalfToneStruct(this.__DiatonicStruct(this.__ChromaticFrom(notemode)))
        // console.log(`${notemode} is ${mode}`)
        let chr = this.__ChromaticFrom(note)
        let ss = []
        for (let step of mode) {
        ss.push(chr[0])
        chr.splice(0, step)
        }
        return ss.flat()
    }

    Test () {
        let nmod = "F"
        ,   note = "F#"

        console.log(`${this.__GetHalfToneStruct(this.__DiatonicStruct(this.__ChromaticFrom(nmod))).join("")} => `+
                `( ${this.GetDiatonicModeFrom (nmod, note).join(" ")} )`)

    }
}


