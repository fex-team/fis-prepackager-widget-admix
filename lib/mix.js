/**
 * Copyright (c) 2015 fis
 * Licensed under the MIT license.
 * https://github.com/fex-team/fis-prepackager-widge-admix
 */

'use strict';

//获取随机长度的字符串
function getRandomStr(len){
    var str = "",len=len || 5;
    for (var i = 0; i < len; i++) {
        str+= String.fromCharCode(Math.floor( Math.random() * 26) + "a".charCodeAt(0));
    };
    return str;
}

var css_parser  = require("css-parse"),
    Hashids     = require('hashids'),
    //4位长度，随机的加盐值
    hashids     = new Hashids(getRandomStr(), 4);


/**
 * 混淆类
 */
var Mix = function(args){
    //选择器混淆前后map表
    this.map = {
        'id'    : {},
        'class' : {}
    };

    // ignore classes
    this.ignoreClasses = ['clearfix','cbg-ads'];
    this.ignoreIds = [];

    // token counter
    this.mapCounter = 0;

    //组件内文件列表
    this.files = {};

    //组件路径
    this.path = args['path'];

    //自定义混淆器
    this.mixer = {
        'js'   : [],
        'html' : [],
        'css'  : []
    };

    //初始化运行
    if (args) {
        this.init(args);
        this.run();
    }
}

/**
 * 初始化参数
 * @return {[type]}
 */
Mix.prototype.init = function(args) {
    var that = this;

    // set the ignore maps for Ids and Classes
    this.ignore = args['ignore'] || '';
    this.ignore.split(',').forEach(function(ign) {
        ign = ign.replace(/\s/,'');
        if (ign.indexOf('.') === 0) that.ignoreClasses.push(ign.replace('.', ''));
        if (ign.indexOf('#') === 0) that.ignoreIds.push(ign.replace('#', ''));
    });

    //读取组件内所有文件
    if(that.path && args.res){
        fis.util.map(args.res, function (id, file) {
            if(file.dirname.indexOf(that.path) > -1 ){
                that.files[id] = file;
            }
        })
    }


    //自定义混淆处理
    if (args['mixer']) {
        fis.util.map(args['mixer'],function(type,mixers){
            mixers.forEach(function(mixer) {
                if (typeof mixer == 'function'){
                    that.addCustomMixer(type,mixer);
                }
            });
        })
    }
}

/**
 * 添加自定义混淆起
 */
Mix.prototype.addCustomMixer = function(type,cb) {
    if (typeof cb == 'function' && this.mixer[type]) {
        this.mixer[type].push(cb);
    }
}

/**
 * 执行混淆操作入口
 */
Mix.prototype.run = function() {
    this.parserFiles();
    this.mixFiles();
}

/**
 * 解析组件内所有css的待混淆的选择器
 */
Mix.prototype.parserFiles = function(){
    var that  = this;
    var files = that.files;
    //处理所有css
    fis.util.map(files,function(id,file){
        if(file.isCssLike){
            that.parseCss(file.getContent());
        }else if(file.isHtmlLike){
            that.parseHtml(file.getContent());
        }
    })
}




/**
 * 混淆指定文件
 */
Mix.prototype.mixFiles = function(){
    var that  = this;
    var files = that.files;
    //处理所有css
    fis.util.map(files,function(id,file){
        if(file.isCssLike){
            that.mixCss(file);
        }else if(file.isHtmlLike){
            that.mixHtml(file);
        }else if(file.isJsLike){
            that.mixJs(file);
        }
    })
}

/**
 * 解析css文件
 * @param  {[type]}
 * @return {[type]}
 */
Mix.prototype.parseCss = function(css){
    var   that = this,
           css = css_parser(css),
        styles = [];

    fis.util.map(css.stylesheet.rules, function(i, style) {
        if(style.media) {
            styles = styles.concat(style.rules);
        }
        if(style.selectors){
            styles.push(css.stylesheet.rules[i]);
        }
    });

    fis.util.map(styles, function(o, style) {
        style.selectors.forEach(function(selector) {
            that.parseCssSelector(selector);
        });
    });

}


/**
 * 解析html/tpl文件中的css片段
 * @param  {[type]}
 * @return {[type]}
 */
Mix.prototype.parseHtml = function(html){
    //支持<style> <%style%> {%style%} 三种格式
    var re = /(<|{%|<%)style.*(%}|%>|>)([\s\S]*?)(<|{%|<%)\/style(%}|%>|>)/m;
    var match;
    var that = this;
    while (match = re.exec(html)) {
        that.parseCss(match[3]);
        html = html.replace(match[0],"");
    }
}



/**
 * parseCssSelector
 *
 * parse CSS strings to get their classes and ids
 *
 * @param css String the css string
 */
Mix.prototype.parseCssSelector = function(selector) {
    var that = this,
        match = null,
        tid = selector.match(/#[\w\-]+/gi),
        tcl = selector.match(/\.[\w\-]+/gi);

    if (tid) {
        tid.forEach(function(match) {
            var id = match.replace('#', '');
            that.addId(id);
        });
    }
    if (tcl) {
        tcl.forEach(function(match) {
            var cl = match.replace('.', '');
            that.addClass(cl);
        });
    }
}


/**
 * addCss
 *
 * adds Classes to the CLASS map
 *
 * @param cl String
 */
Mix.prototype.addClass = function(cl) {
    var that = this;

    var addClass = function(cls) {
        if (that.ignoreClasses.indexOf(cls) > -1) return true; // shoul be a list of no-nos
        if (!that.map["class"][cls]) {
            that.map["class"][cls] = getRandomStr(2) + hashids.encode(that.mapCounter);
            that.mapCounter++;
        }
    }

    if (typeof cl == 'object'){
        if (cl) {
            cl.forEach(function(pass) {
                addClass(pass);
            });
        }
    } else {
        addClass(cl);
    }
}

/**
 * addId
 *
 * adds Ids to the ID map
 *
 * @param id String
 */
Mix.prototype.addId = function(id) {
    if (!this.map["id"][id]) {
        //if (!this.ignoreIds.indexOf(id)) return true; // shoul be a list of no-nos
        this.map["id"][id] = getRandomStr(2) + hashids.encode(this.mapCounter);
        this.mapCounter++;
    }
}

/**
 * 混淆css
 * @param  {[type]}
 * @return {[type]}
 */
Mix.prototype.mixCss = function(file) {
    var content = this.getMixCssString(file.getContent());
    file.setContent(content);
}


/**
 * 根据map表计算混淆后的样式
 * @return {[type]}
 */
Mix.prototype.getMixCssString = function(css) {
    var   that = this,
          text = css,
        styles = [],
           css = css_parser(text);

    fis.util.map(css.stylesheet.rules, function(i, style) {
        if(style.media) {
            styles = styles.concat(style.rules);
        }

        if(style.selectors){
            styles.push(css.stylesheet.rules[i]);
        }
    });

    fis.util.map(styles, function(u, style) {
        style.selectors.forEach(function(selector) {
            var original = selector,
                     tid = selector.match(/#[\w\-]+/gi),
                     tcl = selector.match(/\.[\w\-]+/gi);

            if (tid) {
                fis.util.map(tid, function(i, match) {
                    match = match.replace('#', '');
                    if (that.ignoreIds.indexOf(match) > -1) return true;
                    selector = selector.replace(new RegExp("#" + match.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "gi"), '#' + that.map["id"][match]);
                });
            }
            if (tcl) {
                fis.util.map(tcl, function(o, match) {
                    match = match.replace('.', '');
                    if (that.ignoreClasses.indexOf(match) > -1) return true;
                    selector = selector.replace(new RegExp("\\." + match.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "gi"), '.' + that.map["class"][match]);
                });
            }

            text = text.replace(original, selector);
        });
    });

    // custom parsers
    if (this.mixer.css.length > 0) {
        this.mixer.css.forEach(function(cb) {
            text = cb.call(that, text);
        });
    }

    return text;
}

/**
 * 获取混淆后的js代码
 * @param  {[type]}
 * @return {[type]}
 */
Mix.prototype.getMixJsString = function(js){
    var  that = this,
        match = null;

    //js getElementsByClassName、getElementById
    var parser_1 = /(getElementsByClassName|getElementById)\(\s*[\'"](.*?)[\'"]/gi;
    while ((match = parser_1.exec(js)) !== null) {
        var type = match[1].indexOf("Class") > -1 ? "class" : "id";
        var name = match[2].trim();
        if(that.ignoreClasses.indexOf(name) < 0
            && that.map[type][name]){
            var passed = match[0].replace(new RegExp(match[2], "gi"), that.map[type][name]);
            js = js.replace(match[0], passed);
        }

    }

    //js setAttribute id class
    var parser_2 = /setAttribute\(\s*[\'"](id|class)[\'"],\s*[\'"](.+?)[\'"]/gi;
    while ((match = parser_2.exec(js)) !== null) {
        var key = (match[1] == 'id') ? 'id': 'class';
        var passed = match[0];
        if (key == 'class') {
            var splitd = match[2].split(/\s+/);
            fis.util.map(splitd, function(i, cls) {
                if (that.ignoreClasses.indexOf(cls) < 0 && that.map[key][cls]){
                    passed = passed.replace(new RegExp(cls, "gi"), that.map[key][cls]);
                }
            });
        }else if(that.ignoreIds.indexOf(match[2]) < 0 &&
            that.map[key][match[2]]){
            passed = match[0].replace(new RegExp(match[2], "gi"), that.map[key][match[2]]);
        }
        js = js.replace(match[0], passed);
    }

    //jquery $("selector") 注意带.或#前缀
    var parser_3 = /[\'"](.*?)[\'"]/gi;
    while ((match = parser_3.exec(js)) !== null) {
        //如果路径字符串不处理
        if(match[1].indexOf("/") > -1){
            continue;
        }
        var passed = match[0];
        fis.util.map(that.map.id,function(origin_id,mix_id){
            if(match[1].indexOf("#" + origin_id) > -1){
                passed = passed.replace("#" + origin_id,"#" + mix_id);
            }
        })
        fis.util.map(that.map.class,function(origin_class,mix_class){
            if(match[1].indexOf("." + origin_class) > -1){
                passed = passed.replace("." + origin_class,"." + mix_class);
            }
        })
        js = js.replace(match[0], passed);
    }

    //jquery add/remove class
    var parser_4 = /(add|remove|has|toggle)Class\([\'"](.*?)[\'"]/gi;
    while ((match = parser_4.exec(js)) !== null) {
        var passed = match[0];
        var splitd = match[2].trim().split(/\s+/);
        fis.util.map(splitd, function(i, cls) {
            if (that.ignoreClasses.indexOf(cls) < 0 && that.map.class[cls]){
                passed = passed.replace(new RegExp(cls, "gi"), that.map.class[cls]);
            }
        });
        js = js.replace(match[0], passed);
    }

    // custom parsers
    if (this.mixer.js.length > 0) {
        this.mixer.js.forEach(function(cb) {
            js = cb.call(that, js);
        });
    }

    return js;
}

/**
 * 混淆Js的选择器
 * @param  {[type]}
 * @return {[type]}
 */
Mix.prototype.mixJs = function(file) {
    var content = this.getMixJsString(file.getContent());
    file.setContent(content);
}


/**
 * 混淆html页面中的css和js区块
 * @return {[type]}
 */
Mix.prototype.mixCssJsBlock = function(file){
    var re = /(<|{%|<%)(style|script).*(%}|%>|>)([\s\S]*?)(<|{%|<%)\/(style|script)(%}|%>|>)/m;
    var match;
    var that = this;
    var html = file.getContent();
    var codes = {};
    var count = 0;
    while (match = re.exec(html)) {
        count++;
        var type = match[2].trim();
        var innerCode = match[4];
        var text = type == "style" ? that.getMixCssString(innerCode)
                        : that.getMixJsString(innerCode);
        var flag = "ad_mix_" + type + "_" + count;
        html = html.replace(match[0],"<!--"+ flag +"-->");
        codes[flag] = match[0].replace(innerCode,text);
    }

    fis.util.map(codes,function(flag,code){
        html = html.replace("<!--" + flag + "-->",code);
    });

    file.setContent(html);
}



/**
 * 混淆Html
 * @param  {[type]}
 * @return {[type]}
 */
Mix.prototype.mixHtml = function(file) {
    var that = this;
    //混淆 js css 区块
    this.mixCssJsBlock(file);

    //混淆html中的样式选择器
    //只处理html中的id 和 class属性
    var html = file.getContent();
    var re = /\s+(id|class)\s*=\s*[\'"](.*?)[\'"]/gi;
    html = html.replace(re,function(origin,type,selector){
        var splitd = selector.trim().split(/\s+/);
        var passed = origin;
        fis.util.map(splitd, function(i, cls) {
            if (that.map[type][cls]){
                passed = passed.replace(new RegExp(cls, "gi"), that.map[type][cls]);
            }
        });
        return passed;
    })

    // custom parsers
    if (this.mixer.html.length > 0) {
        this.mixer.html.forEach(function(cb) {
            html = cb.call(that, html);
        });
    }

    file.setContent(html);
}

module.exports  = Mix;





