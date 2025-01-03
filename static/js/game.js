//创建一个新的 Phaser 游戏实例参数依次为：画布宽度、画布高度、渲染模式、游戏画布的DOM元素（设置为null将自动创建一个canvas元素到文档中）、游戏配置对象
const game = new Phaser.Game(480, 320, Phaser.CANVAS, null, {
    preload: preload,   
    create: create, 
    update: update
  });

  let ball;             // 定义一个全局变量球 ball
  let paddle;           // 定义一个全局变量球拍 paddle
  let bricks;           // 定义一个全局变量砖块 bricks
  let newBrick;         // 定义一个全局变量砖块 newBrick
  let brickInfo;        // 定义一个全局变量砖块信息 brickInfo
  let scoreText;        //定义一个全局变量分数文本 scoreText
  let score = 0;        // 定义一个全局变量分数 score
  let lives = 3;        // 定义一个全局变量生命值 lives
  let livesText;        // 定义一个全局变量生命值文本 livesText
  let lifeLostText;     // 定义一个全局变量生命值丢失文本 lifeLostText
  let playing = false;  // 定义一个全局变量是否正在游戏 playing
  let startButton;      // 定义一个全局变量开始按钮 startButton






// 预加载游戏资源
function preload() {
game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;        // 设置缩放模式为 SHOW_ALL，保持纵横比，但可能会有黑色边框
game.scale.pageAlignHorizontally = true;                    // 设置水平居中
game.scale.pageAlignVertically = true;                      // 设置垂直居中
game.stage.backgroundColor = '#eee';                        // 设置背景颜色为灰色
game.load.image('paddle', 'img/paddle.png');                // 加载球拍图片
game.load.image('brick', 'img/brick.png');                  // 加载砖块图片
game.load.spritesheet('ball', 'img/wobble.png', 20, 20);    // 加载球图片
game.load.spritesheet("button", "img/button.png", 120, 40); // 加载开始按钮图片

}



// 创建游戏场景
function create() {
//启用物理系统
game.physics.startSystem(Phaser.Physics.ARCADE); 
// 禁用向下碰撞检测
game.physics.arcade.checkCollision.down = false;
// 在屏幕中心下方创建一个球体
ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
// 添加一个名为 'wobble' 的动画，动画帧为 [0,1,0,2,0,1,0,2,0]，每帧持续 24 毫秒
ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
// 设置球体的锚点为中心
ball.anchor.set(0.5);
// 启用球体的 Arcade 物理系统
game.physics.enable(ball, Phaser.Physics.ARCADE);
// 设置球体碰到边界时反弹
ball.body.collideWorldBounds = true;
// 设置球体的反弹系数为 1
ball.body.bounce.set(1);
// 检查球体是否离开屏幕
ball.checkWorldBounds = true;
// 当球体离开屏幕时调用 ballLeaveScreen 函数
ball.events.onOutOfBounds.add(ballLeaveScreen, this);

// 在屏幕中心下方创建一个挡板
paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
// 设置挡板的锚点为底部中心
paddle.anchor.set(0.5,1);
// 启用挡板的 Arcade 物理系统
game.physics.enable(paddle, Phaser.Physics.ARCADE);
// 设置挡板为不可移动
paddle.body.immovable = true;

// 初始化砖块
initBricks();

// 设置文本样式
textStyle = { font: '18px Arial', fill: '#0095DD' };
// 在屏幕左上角创建一个显示分数的文本
scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
// 在屏幕右上角创建一个显示剩余生命数的文本
livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
// 设置文本的锚点为右对齐
livesText.anchor.set(1,0);
// 在屏幕中心创建一个显示“生命丢失，点击继续”的文本
lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, '你失去了一条命，请点击继续！', textStyle);
// 设置文本的锚点为中心
lifeLostText.anchor.set(0.5);
// 隐藏“生命丢失，点击继续”的文本
lifeLostText.visible = false;


 // 在屏幕中心创建一个开始按钮
startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
// 设置按钮的锚点为中心
startButton.anchor.set(0.5);

// 创建暂停按钮
pauseButton = game.add.button(game.world.width - 50, 5, 'pause', togglePause, this, 1, 0, 2);
// 设置按钮的锚点
pauseButton.anchor.set(1, 0);

}

//更新游戏状态
function update() {
//检测球和球拍的碰撞
game.physics.arcade.collide(ball, paddle, ballHitPaddle);
//检测球和砖块的碰撞
game.physics.arcade.collide(ball, bricks, ballHitBrick);
//如果正在游戏，则让球拍跟随鼠标移动,如果鼠标没有移动，则让球拍保持在屏幕中心
if(playing) {
    paddle.x = game.input.x || game.world.width*0.5;
}
}

//初始化砖块
function initBricks() {
//砖块信息
brickInfo = {
    width: 50,
    height: 20,
    count: {
        row: 7,
        col: 3
    },
    offset: {
        top: 50,
        left: 60
    },
    padding: 10
}
//创建一个组来存储砖块
bricks = game.add.group();
for(c=0; c<brickInfo.count.col; c++) {
    for(r=0; r<brickInfo.count.row; r++) {
        //创建砖块
        var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
        var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
        newBrick = game.add.sprite(brickX, brickY, 'brick');
        //启用物理系统
        game.physics.enable(newBrick, Phaser.Physics.ARCADE);
        //设置砖块为不可移动
        newBrick.body.immovable = true;
        //设置砖块的锚点为中心
        newBrick.anchor.set(0.5);
        //将砖块添加到组中
        bricks.add(newBrick);
    }
}
}

//球击中砖块
function ballHitBrick(ball, brick) {
//创建缩放动画：将砖块缩放到0，持续200毫秒，使用线性插值
var killTween = game.add.tween(brick.scale);
killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
//当动画完成时，销毁砖块
killTween.onComplete.addOnce(function(){
    brick.kill();
}, this);
//开始动画
killTween.start();
//增加分数
score += 10;
//更新分数显示
scoreText.setText('Points: '+score);
//如果所有砖块都被击中，则显示胜利信息并重新加载游戏
if(score === brickInfo.count.row*brickInfo.count.col*10) {
    alert('You won the game, congratulations!');
    location.reload();
}
}
//球离开屏幕
function ballLeaveScreen() {
lives--;
if(lives) {
    //更新生命数显示
    livesText.setText('Lives: '+lives);
    //显示“生命丢失，点击继续”的文本
    lifeLostText.visible = true;
    //重置球和挡板的位置
    ball.reset(game.world.width*0.5, game.world.height-25);
    paddle.reset(game.world.width*0.5, game.world.height-5);
    //当点击屏幕时，重新开始游戏，并隐藏“生命丢失，点击继续”的文本
    game.input.onDown.addOnce(function(){
        lifeLostText.visible = false;
        ball.body.velocity.set(150, -150);
    }, this);
}
else {
    //如果生命值为0，则显示游戏结束信息并重新加载游戏
    alert('You lost, game over!');
    location.reload();
}
}

//球击中挡板
function ballHitPaddle(ball, paddle) {
//播放球击中挡板的动画
ball.animations.play('wobble');
//根据球击中挡板的位置，改变球的速度
ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}

//开始游戏
function startGame() {
//销毁开始按钮
startButton.destroy();
//设置球的速度
ball.body.velocity.set(150, -150);
//设置游戏状态为正在游戏
playing = true;
}