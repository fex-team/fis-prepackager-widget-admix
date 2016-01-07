/**
 * fis.baidu.com
 */


'use strict';

var path = require("path");
var Mix  = require("./lib/mix");

var exports = module.exports = function(ret, conf, settings, opt) {
    var ids         = ret.ids || {};
    var mixer       = settings.mixer || [];//自定义混淆逻辑
    var list        = settings.list  || [];

    //混淆指定组件
    for(var i = 0; i < list.length; i++){
        var mix = new Mix({
            'path'  : list[i],
            'res'   : ids,
            'ignore': settings['ignore'] || '',
            'mixer' : mixer//自定义混淆逻辑
        });
    }
};

