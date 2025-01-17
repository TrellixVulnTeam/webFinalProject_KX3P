var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update});
var ball;
var paddle;
var bricks;
var newBrick;
var brickInfo;

var playing = false;
var startButton;

var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;


function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.stage.backgroundColor = '#eee';
	game.load.image('ball', 'assets/ball.png');	
	game.load.image('paddle', 'assets/paddle.png');
	game.load.image('brick', 'assets/brick.png');
	game.load.spritesheet('ball', 'assets/wobble.png', 20, 20);
	game.load.spritesheet('button', 'assets/button.png', 120, 40);


}

function gameOver(){
	alert('Game over!');
}		

function initBricks() {
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
    };
}

function ballLeaveScreen() {
    lives--;
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
        ball.reset(game.world.width*0.5, game.world.height-25);
        paddle.reset(game.world.width*0.5, game.world.height-5);
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
        }, this);
    }
    else {
        alert('You lost, game over!');
        location.reload();
    }
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// ball = game.add.sprite(50, 250, 'ball');

	ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
	ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
	ball.anchor.set(0.5);
	game.physics.enable(ball, Phaser.Physics.ARCADE);
	ball.body.collideWorldBounds = true;
	ball.body.bounce.set(1);
	// ball.body.velocity.set(150, -150);

	paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
	paddle.anchor.set(0.5,1);
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	paddle.body.immovable = true;

	game.physics.arcade.checkCollision.down = false;
	ball.checkWorldBounds = true;
	ball.events.onOutOfBounds.add(ballLeaveScreen, this);

    initBricks();
	bricks = game.add.group();
	for(c=0; c<brickInfo.count.col; c++) {
	    for(r=0; r<brickInfo.count.row; r++) {
			var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
			var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;			
	        newBrick = game.add.sprite(brickX, brickY, 'brick');
	        game.physics.enable(newBrick, Phaser.Physics.ARCADE);
	        newBrick.body.immovable = true;
	        newBrick.anchor.set(0.5);
	        bricks.add(newBrick);
	    }
	}	

	// scoreText = game.add.text(5, 5, 'Points: 0', { font: '18px Arial', fill: '#0095DD' });
	// livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, { font: '18px Arial', fill: '#0095DD' });
	// livesText.anchor.set(1,0);
	// lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, click to continue', { font: '18px Arial', fill: '#0095DD' });
	// lifeLostText.anchor.set(0.5);
	// lifeLostText.visible = false;
	textStyle = { font: '18px Arial', fill: 'red' };

	scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
	livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
	livesText.anchor.set(1,0);
	lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, click to continue', textStyle);
	lifeLostText.anchor.set(0.5);
	lifeLostText.visible = false;

	startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
	startButton.anchor.set(0.5);
}

function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}

function update() {
	game.physics.arcade.collide(ball, paddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);

    if(playing) {
        paddle.x = game.input.x || game.world.width*0.5;
    }
}

function ballHitBrick(ball, brick) {
	// brick.kill();

	var killTween = game.add.tween(brick.scale);
	killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
	killTween.onComplete.addOnce(function(){
	    brick.kill();
	}, this);
	killTween.start();

	// game.add.tween(brick.scale).to({x:2,y:2}, 500, Phaser.Easing.Elastic.Out, true, 100);


    score += 10;
	scoreText.setText('Points: '+score);
    var count_alive = 0;
    for (i = 0; i < bricks.children.length; i++) {
      if (bricks.children[i].alive == true) {
        count_alive++;
      }
    }
    if (count_alive == 0) {
      alert('You won the game, congratulations!');
      location.reload();
    }
}

function ballHitPaddle(ball, paddle) {
	ball.animations.play('wobble');
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);

}