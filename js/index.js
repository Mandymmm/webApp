(function () {
    //获取操作元素
    var oUls=document.getElementById('oUls');
    var oImgs=oUls.getElementsByTagName('img');//获取到所有要加载的图片
    var winH=utils.win('clientHeight');//获取浏览器可视窗口的高度
    var back=document   .getElementById('back');// 获取回到顶部按钮


    var timer;
    back.onclick=function () {
        utils.win('scrollTop',0);

/*
        // 每隔一段时间 获取到此时的scrollTop 让它递减到 0(到达顶部)为止
        timer=setInterval(function () {
            var sTop=utils.win('scrollTop');
            if(sTop<=0){
                clearInterval(timer);
                utils.win('scrollTop',0);
                return;
            }
            sTop-=100;
            utils.win('scrollTop',sTop);
        },10)
        */
    };


    //获取初始数据
    var data;
    function getInitData() {
        //发送ajax请求
        var xhr = new XMLHttpRequest;
        xhr.open('get', 'data.txt?_=' + Math.random(), false);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && /^2\d{2}$/.test(this.status)) {
                data=utils.toJson(this.responseText);
                console.log(data);
                data && data.length ? bindData(data) : null;// 如果有数据并且数据长度不为0 就执行绑定数据的方法
            }
        };
        xhr.send(null);
    }

    getInitData();

    //绑定数据
    function bindData(data) {
        var str='';
        for(var i=0;i<20;i++){
            var ind=Math.round(Math.random()*8);// 0-8之间的随机整数 作为索引
            var cur=data[ind];
            str+='<li><a href='+cur.link+'>';
            str+='<div><img data-real="'+cur.src+'"></div>';// 将当前img要加载的图片路径 先保存到自身的data-real属性上 只有符合加载标准再让当前img的src加载这个路径 否则显示默认背景图
            str+='<div>';
            str+='<h3>'+cur.title+'</h3>';
            str+='<p>'+cur.text+'</p>';
            str+='</div>';
            str+='</a></li>';
        }
        oUls.innerHTML+=str;// 在原有的基础上继续拼接累加输出  如果绑定数据用的是动态创建的方式就不用+= 直接=即可 因为动态创建的方式 页面元素会即时更新
        delayImgs(); // 最开始页面刷新的时候 执行一次图片加载 也就是一屏的时候 让图片加载出来显示在页面中
    }

    //图片延迟加载
    function delayImgs() {
        for (var i=0;i<oImgs.length;i++){
            if(oImgs[i].flag) continue;// 如果当前的img的flag为true 说明已经加载过了 本轮就不再执行checkImg(oImgs[i]) 继续下一张图片的检测
            checkImg(oImgs[i]);//循环遍历每一张图片 并且把每一张图片放在另一个function里用来检测当前图片是否符合加载标准
        }
    }


    //检测当前图片是否符合加载标准
    function checkImg(img) {
        var sTop=utils.win('scrollTop');// 滚动条滚动出去了的距离
        var imgTop=utils.offset(img).top;// 获取图片上边框外边距离body的上偏移量
        var imgH=img.offsetHeight*0.5;// 获取图片自身高度的一半
        // 如果浏览器窗口高度+滚动条滚出的距离 >= 图片上偏移值+自身高度的一半 时，说明图片的一半已经完全出现在可视窗口中，这时我再让图片加载
        if(winH+sTop >= imgTop+imgH){
            var imgSrc=img.getAttribute('data-real');// 获取到当前图片自身保存的属性data-real上的图片真实路径
            var tempImg=new Image;// 通过实例的方式 创建一个临时的img标签
            tempImg.src=imgSrc;// 先将获取到的图片真实路径 赋给这个临时的img标签 并且让其加载 如果加载成功了 就会触发自身的onload事件执行
            tempImg.onload=function () {
                console.log('ok');
                img.src=imgSrc;// 如果加载成功了 就让页面中的img 加载这个图片真实路径地址
                img.flag=true;// 设定一个标识属性flag为true  说明加载过  再在每一轮检测图片加载之前判断img.flag是否为true 来避免图片重复加载
            }
        }
    }

    //滚动条实时监听事件  在滚动滚动条的时候触发onscroll事件 然后执行检测图片加载的方法 检测是否有新的图片完全出现在页面中  然后是否进行加载
    window.onscroll=function () {
        delayImgs();
        //当滚动条快要滚动到页面最底部时 继续发送加载请求 并且进行加载
        //首先利用判断来实现滚动条快要到最底部时继续发送获取数据和绑定数据的请求
        var sTop=utils.win('scrollTop');
        var wScrollH=utils.win('scrollHeight');// scrollHeight是整个页面的高度  包括可视窗口的高度+滚动条滚动的最大高度  一定要在这里(滚动条实时监听事件里)获取 这样获取的才是当前的整个页面的高度
        if(winH+sTop > wScrollH - 500){
            getInitData();// 再次发送ajax请求
        }

        //控制回到顶部按钮的 显示和隐藏
        if(sTop>=winH*0.5){
            utils.setCss(back,'display','block');
        }else {
            utils.setCss(back,'display','none');
        }
    }
})();