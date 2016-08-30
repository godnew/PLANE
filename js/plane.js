/**
 * Created by nhy on 2016/8/21.
 */
//定义宽和高
var WIDTH=480,HEIGHT=650;
var score = 0,life=3;
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

var pause = new Image();
pause.src="img/game_pause_nor.png";

var l = [];
l[0] = new Image();
l[0].src="img/game_loading1.png";
l[1] = new Image();
l[1].src="img/game_loading2.png";
l[2] = new Image();
l[2].src="img/game_loading3.png";
l[3] = new Image();
l[3].src="img/game_loading4.png";
//创建英雄图像数组
var h = [];
h[0] = new Image();
h[0].src="img/hero1.png";
h[1] = new Image();
h[1].src="img/hero2.png";
h[2] = new Image();
h[2].src="img/hero_blowup_n1.png";
h[3] = new Image();
h[3].src="img/hero_blowup_n2.png";
h[4] = new Image();
h[4].src="img/hero_blowup_n3.png";
h[5] = new Image();
h[5].src="img/hero_blowup_n4.png";
//创建子弹图像
var b = new Image();
b.src="img/bullet1.png";
//创建小飞机图像数组
var e1 = [];
e1[0] = new Image();
e1[0].src="img/enemy1.png";
e1[1] = new Image();
e1[1].src="img/enemy1_down1.png";
e1[2] = new Image();
e1[2].src="img/enemy1_down2.png";
e1[3] = new Image();
e1[3].src="img/enemy1_down3.png";
e1[4] = new Image();
e1[4].src="img/enemy1_down4.png";

//创建中型飞机图像数组
var e2 = [];
e2[0] = new Image();
e2[0].src="img/enemy2.png";
e2[1] = new Image();
e2[1].src="img/enemy2_down1.png";
e2[2] = new Image();
e2[2].src="img/enemy2_down2.png";
e2[3] = new Image();
e2[3].src="img/enemy2_down3.png";
e2[4] = new Image();
e2[4].src="img/enemy2_down4.png";
//创建大型飞机的图像数组
var e3 = [];
e3[0] = new Image();
e3[0].src="img/enemy3_n1.png";
e3[1] = new Image();
e3[1].src="img/enemy3_n2.png";
e3[2] = new Image();
e3[2].src="img/enemy3_down1.png";
e3[3] = new Image();
e3[3].src="img/enemy3_down2.png";
e3[4] = new Image();
e3[4].src="img/enemy3_down3.png";
e3[5] = new Image();
e3[5].src="img/enemy3_down4.png";
e3[6] = new Image();
e3[6].src="img/enemy3_down5.png";
e3[7] = new Image();
e3[7].src="img/enemy3_down6.png";

//为canvas添加事件(onclick,onmousemove,onmoseout)
canvas.onclick=function(){
    if(state == START){
        state = STARTING;
    }
}
/**
 *鼠标移动事件
 *处理 hero与鼠标的位置
 */
canvas.onmousemove = function(e){
    var x = e.offsetX;
    var y = e.offsetY;

    hero.x = x - HERO.width / 2;
    hero.y = y - HERO.height / 2;
}

canvas.onmouseout = function(e){
    if(state == RUNNING){
        state = PAUSE;
    }
}

canvas.onmouseover = function(e){
    if(state == PAUSE){
        state = RUNNING;
    }
}

//数据对象
var SKY = {image:bg,width:480,height:650,speed:20};
var LOADING = {frames:l,width:186,height:38,x:0,y:HEIGHT-38,speed:5};
var HERO = {frames:h,baseFrameCount:2,width:99,height:124,speed:20};
var BULLET = {image:b,width:9,height:21};
var E1 = {type:1,score:1,frames:e1,baseFrameCount:1,life:1,minSpeed:70,maxSpeed:100,width:57,height:51};
var E2 = {type:2,score:5,frames:e2,baseFrameCount:1,life:5,minSpeed:50,maxSpeed:70,width:69,height:95};
var E3 = {type:3,score:20,frames:e3,baseFrameCount:2,life:20,speed:10,width:169,height:258};

//保存由hero发射的所有子弹
var bullets = [];
var enemies = [];

//业务对象

var Enemy = function(config){
    this.score = config.score;//分数
    this.frames = config.frames;//图像列表
    this.frame=null;//当前显示的图像
    this.frameIndex = 0;//当前显示的图像索引累加值
    this.baseFrameCount=config.baseFrameCount;
    //横纵坐标
    this.x = Math.ceil(Math.random()*(WIDTH - config.width));
    this.y = -config.height;
    this.type = config.type;
    this.speed = 0;
    if(config.minSpeed && config.maxSpeed){
        this.speed = 1000 / (Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed);
    }else {
        this.speed = 1000 / config.speed;
    }

    this.lastTime = 0;

    /**
     * 检查时间是否到期
     */
    this.timeInterval = function(){
        var currentTime = new Date().getTime();
        if(currentTime - this.lastTime >= this.speed){
            this.lastTime = new Date().getTime();
            return true;
        }
        return false;
    }

    this.step=function(){
        if(this.timeInterval()){
            //基本图像切换
            this.frame = this.frames[this.frameIndex % this.baseFrameCount];
            this.frameIndex ++;
            //飞机移动
            this.move();
        }
    }

    this.move = function(){
        //飞机移动
        this.y ++;
    }

    this.paint = function(ctx){
        //绘制飞机图像
        ctx.drawImage(this.frame,this.x,this.y);
    }
    /**
     * 判断当前飞机对象是否超出canvas边界
     */
    this.outOfBounds = function(){
        if(this.y > HEIGHT){
            return true;
        }
        return false;
    }
}

/**
 * 子弹对象
 */
var Bullet = function(config,x,y){
    this.width = config.width;
    this.height = config.height;
    this.frame = config.image;
    this.x = x;
    this.y = y;

    this.move = function(){
        this.y -= 2;
    }

    this.paint = function(ctx){
        ctx.drawImage(this.frame,this.x,this.y);
    }

    this.outOfBounds = function(){
        return this.y < 0-this.height;
    }
}

/**
 * 创建飞机业务对象
 */
var Hero = function(config){
    this.frames = config.frames;
    this.frameIndex = 0;
    this.baseFrameCount=config.baseFrameCount;
    this.width=config.width;
    this.height=config.height;
    this.speed=1000/config.speed;
    this.lastTime = 0;
    this.x = (WIDTH - this.width) / 2;
    this.y = HEIGHT - this.height - 30;

    this.step = function(){
        var currentTime = new Date().getTime();
        if(currentTime - this.lastTime >= this.speed){
            this.frame = this.frames[this.frameIndex % this.baseFrameCount];
            this.frameIndex ++;
            this.lastTime = new Date().getTime();
        }
    }

    this.paint = function(ctx){
        ctx.drawImage(this.frame,this.x,this.y);
    }

    this.shootLastTime=0;
    //发射子弹的间隔
    this.shootInterval = 200;
    //处理子弹的发射
    this.shoot = function(){
        var currentTime = new Date().getTime();
        if(currentTime - this.shootLastTime >= this.shootInterval){
            //到达时间间隔，可以发射子弹
            var bullet = new Bullet(BULLET,this.x+45,this.y);
            bullets[bullets.length] = bullet;

            //console.log("子弹数量:"+bullets.length);
            this.shootLastTime = new Date().getTime();
        }
    }
}

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
        ctx.drawImage(this.bg,this.x1,this.y1);
        ctx.drawImage(this.bg,this.x2,this.y2);
    }
}

//创建业务对象
var sky = new Sky(SKY);
var loading = new Loading(LOADING);
var hero = new Hero(HERO);

//删除多余组件
function deleteComponent(){
    //删除超出下边界的小飞机
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].outOfBounds()){
            enemies.splice(i,1);
        }
    }

    //删除超出上边界的子弹
    for(var i=0;i<bullets.length;i++){
        if(bullets[i].outOfBounds()){
            bullets.splice(i,1);
        }
    }
}

//创建敌人飞机的数据
var lastTime = new Date().getTime();
var interval = 800;
/**
 *根据指定时间差创建不同类型的敌人飞机
 *将创建好的飞机保存进 enemies 数组中
 */
function componentEnter(){
    var currentTime = new Date().getTime();
    if(currentTime - lastTime >= interval){

        var n = Math.floor(Math.random()*10);
        if(n >= 0 && n <= 7){
            //创建小型飞机
            enemies[enemies.length]=new Enemy(E1);
        }else if(n == 8){
            //创建中型飞机
            enemies[enemies.length]=new Enemy(E2);
        } else {
            //创建大型飞机
            //如果数组中第一个元素不是大型飞机，则创建一个，并且放在第一个位置处，其他的飞机位置后移
            if(enemies[0].type != 3){
                enemies.splice(0,0,new Enemy(E3));
            }
        }


        lastTime = new Date().getTime();
    }
}

/**
 * 绘制各个组件
 */
function paintComponent(){
    //绘制子弹
    for(var i=0;i<bullets.length ; i ++){
        var bullet = bullets[i];
        bullet.paint(ctx);
    }

    //绘制所有敌人小飞机
    for(var i=0;i<enemies.length ; i ++){
        enemies[i].paint(ctx);
    }

    //将绘制hero的方法移动至此
    hero.paint(ctx);

    ctx.font = "20px 微软雅黑";
    ctx.fillText("SCORE:"+score,10,20);
    ctx.fillText("LIFE:"+life,400,20)
}

/**
 * 让所有的组件动起来(更新y坐标)
 */
function stepComponent(){
    for(var i=0;i<bullets.length ; i ++){
        bullets[i].move();
    }

    //移动所有敌人小飞机
    for(var i=0;i<enemies.length ; i ++){
        enemies[i].step();
    }
}

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

            hero.step();
            hero.paint(ctx);
            hero.shoot();
            //添加新组件(敌人小飞机)
            componentEnter();
            stepComponent();
            deleteComponent();
            //绘制所有的组件
            paintComponent();

            //打印enemies的长度
            console.log(bullets.length);
            break;
        case PAUSE:
            //暂停
            sky.step();
            sky.paint(ctx);
            paintComponent();
            ctx.drawImage(pause,(WIDTH-pause.width)/2,(HEIGHT-pause.height)/2);
            break;
        case GAME_OVER:
            //游戏结束
            break;
    }
},1000/100);

