/**
 * Created by nhy on 2016/8/21.
 */
//定义宽和高
var WIDTH=480,HEIGHT=650;
//定义状态
var START = 0;
var STARTING = 1;
var RUNNING = 2;
var PAUSE = 3;
var GAME_OVER = 4;

/**
 * state表示游戏的状态
 * 取值必须为以上五种之一
 */
var state = START;

//获取数据
var canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

//创建图像对象用来表示天空、英雄、敌人、版权
var bg = new Image();
bg.src="img/background.png";

var copyright = new Image();
copyright.src="img/shoot_copyright.png";

var l = [];
l[0] = new Image();
l[0].src="img/game_loading1.png";
l[1] = new Image();
l[1].src="img/game_loading2.png";
l[2] = new Image();
l[2].src="img/game_loading3.png";
l[3] = new Image();
l[3].src="img/game_loading4.png";

//为canvas添加事件(onclick,onmousemove,onmoseout)
canvas.onclick=function(){
    if(state == START){
        state = STARTING;
    }
}

//数据对象
var SKY = {image:bg,width:480,height:650,speed:20};
var LOADING = {frames:l,width:186,height:38,x:0,y:HEIGHT-38,speed:5};

//业务对象
/**
 * 加载的业务对象
 * config:表示加载的数据对象
 */
var Loading = function(config){
    this.speed = 1000 / config.speed;
    this.lastTime = 0;
    this.frame=null;
    this.frameIndex = 0;

    //更换loading图像
    this.step = function(){
        var currentTime = new Date().getTime();
        if(currentTime - this.lastTime >= this.speed){
            //获取不同的图像config.frames中的元素给frame
            this.frame = config.frames[this.frameIndex];
            this.frameIndex ++;
            if(this.frameIndex >= 4){
                //更新状态
                state = RUNNING;
            }
            this.lastTime = new Date().getTime();
        }

    }
    /**
     * 绘制不同的图像到canvas上
     */
    this.paint = function(ctx){
        ctx.drawImage(this.frame,config.x,config.y);
    }
}

/**
 * 天空的业务对象
 * config:表示天空的数据对象
 */
var Sky = function(config){
    this.bg = config.image; //设置背景图像
    this.width=config.width;
    this.height = config.height;
    this.speed = 1000 / config.speed;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = -this.height;
    this.lastTime = 0; //上一次执行动作时间的毫秒数

    /**
     * 移动背景纵坐标
     */
    this.step = function(){
        //判断是否到达天空移动的时间
        //获取当前时间的毫秒数
        var currentTime = new Date().getTime();
        if(currentTime - this.lastTime >= this.speed){
            // y1++ , y2++
            this.y1++;
            this.y2++;
            this.lastTime = new Date().getTime();
        }

        //判断y1、y2 是否超出范围
        if(this.y1 >= this.height){
            this.y1 = -this.height;
        }
        if(this.y2 >= this.height){
            this.y2 = -this.height;
        }
    }

    /**
     * 绘制天空图像
     *ctx : canvas 绘图上下文
     */
    this.paint = function(ctx){
        console.log("x2:"+this.x2 + ",y2:"+this.y2);
        ctx.drawImage(this.bg,this.x1,this.y1);
        ctx.drawImage(this.bg,this.x2,this.y2);
    }
}

//创建业务对象
var sky = new Sky(SKY);
var loading = new Loading(LOADING);

//定义计时器，固定刷新频率为 1000 / 100
setInterval(function(){
    switch(state){
        case START:
            //天空在移动
            sky.step();
            sky.paint(ctx);
            //绘制copyright
            var x = (WIDTH - copyright.naturalWidth) / 2;
            var y = (HEIGHT - copyright.naturalHeight) / 2;
            ctx.drawImage(copyright,x,y);
            break;
        case STARTING:
            //准备开始
            sky.step();
            sky.paint(ctx);

            loading.step();
            loading.paint(ctx);
            break;
        case RUNNING:
            //游戏进行
            sky.step();
            sky.paint(ctx);
            break;
        case PAUSE:
            //暂停
            break;
        case GAME_OVER:
            //游戏结束
            break;
    }
},1000/100);
