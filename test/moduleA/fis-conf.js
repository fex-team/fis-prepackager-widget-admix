//fis2
//fis release -d output


fis.config.set('roadmap.path',[
    {
        reg: '/widget/**.(tpl|html)',
        useMap: true,
        isHtmlLike: true
    },
    {
        reg: /^\/widget\/(.*)/i,
        useMap : true
    }
]);



//组件混淆插件
fis.config.merge({
    namespace: "moduleA",
    modules: {
        prepackager: 'widget-admix'
    },
    settings: {
        prepackager: {
            'widget-admix':  {
                list : [
                    'widget/slogan'
                ],
                ignore: '.wrap'
            }
        }
    }
});






//fis3
//fis3 release -d outupt

/*fis.set('namespace', 'moduleA');


fis.match('widget/**', {
    useMap: true
});


fis.match('**.tpl', {
    isHtmlLike : true
});


fis.match("::package",{
    prepackager : fis.plugin('widget-admix',{
        list : [
            'widget/slogan'
        ],
        ignore: '.wrap',
        //自定义混淆处理
        mix : {}
    })
})*/
