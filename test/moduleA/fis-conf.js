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

