FIS反广告拦截组件样式混淆插件
=============================

通过分析组件widget代码，自动混淆指定组件内所有相关的样式选择器以实现有效的广告反拦截，包括类html、css和js文件的自动混淆，支持设置过滤和自定义的混淆处理。

**注意**：

 - 不适用于列表型内容中插入的广告(如贴吧楼层中的广告，混淆后还是容易通过选择器被识别出来)
 - 混淆的组件css选择器和样式不能被其他组件所调用(因为只混淆当前组件内的代码)
 - 由于混淆范围大，请务必在指定组件内谨慎使用！如果JS中混淆不充分请设置自定义混淆处理
 - 如果在fis中使用，请注意需要混淆的文件是否设置了isHtmlLike、isCssLike、isJsLike属性

## 使用方法

### 安装此插件并进行配置

执行`npm install -g fis-prepackager-widget-admix `安装插件

**FIS2:**

```javascript
//vi fis-conf.js

fis.config.merge({
    modules: {
        prepackager: 'widget-admix'
    },
    settings: {
        prepackager: {
            'widget-admix':  {
                ignore: '.clearfix,',//不进行混淆的选择器，多个逗号隔开
                list: [ //需要混淆的组件，相对模块根目录路径
                    'widget/slogan'
                ],
                //自定义混淆处理
                mix : {}
            }
        }
    }
});
```

注意：如果您已使用其他prepackager插件，请在已有地方添加widget-admix,逗号隔开


**FIS3:**


```javascript
//vi fis-conf.js

fis.match("::package",{
    prepackager : fis.plugin('widget-admix',{
          ignore: '.clearfix',//不进行混淆的选择器，多个逗号隔开
          list: [ //需要混淆的组件，相对模块根目录路径
              'widget/slogan'
          ],
          //自定义混淆处理
          mix : {}
    })
})
```

### 配置说明

- ignore : 不进行混淆的选择器(如果不是本组件样式默认不会混淆)，多个逗号隔开，如.clearfix,#wrap
- list : 需要混淆的组件，数组，相对模块根目录路径
- mix : 自定义混淆处理

例如JS中如果要设置自定义混淆逻辑:

```javascript
 mix : {
    //数组形式，代表多个混淆逻辑，依次执行
    'js' : [function(code){
        var map = this.map;//混淆前后索引表，map.id,map.class
        //do something with js code
        return code;
    }]
 }
```


### 使用效果

#### 自动获取组件内所有css文件和模板内嵌css选择器，生成hash值进行混淆处理

每次编译都重新生成一遍

**开发时:**

```css
/*css文件*/
#slogan {
    position: relative;
}
```

```html
<!-- isHtmlLike 的文件 -->
//默认支持html style和smarty {%style%}、<%style%>标签
<style>
    .style_test a{
        color:black;
    }
</style>

```

**编译后:**

```css
/*css文件*/
#llM67m {
    position: relative;
}
```

```html
<!-- isHtmlLike 的文件 -->
<style>
    .aiMy8D a{
        color:black;
    }
</style>

```

#### 自动替换模板文件中的样式选择器(id|class="xxx")

**开发时:**

```html
<section class="section ignore_class" id='slogan'>
</section>

```

**编译后:**


```html
<section class="zhDXWk ignore_class"  id='zhDXWk'>
</section>

```

#### 自动替换JS代码中的选择器或class名称

 - 替换原生JS中getElementsByClassName、getElementById、setAttribute中的 class/id
 - 替换 css3选择器字符串 .class #id
 - 替换 jquery (add|remove|has|toggle)Class对应的一个或多个class
 - 支持自定义混淆逻辑


**开发时:**

```javascript
    var a = document.getElementsByClassName("style_test");
    var b = $(".style_test");
    b.addClass("style_test style_test2");
```

**编译后:**

```javascript
    var a = document.getElementsByClassName("cakPrn");
    var b = $(".cakPrn");
    b.addClass("cakPrn cakPrn2");
```

## 测试

```
cd test/moduleA
fis release -d output
```
