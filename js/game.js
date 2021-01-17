let gameScene = new Phaser.Scene("Game");

let config = {
	type: Phaser.AUTO,
	width: 640,
	height: 360,
	scene: gameScene
};

let game = new Phaser.Game(config);

gameScene.init = function(){
	this.playerSpeed = 1.5;
	this.enemyMaxY = 280;
	this.enemyMinY = 80;
}

gameScene.preload = function(){
	this.load.image('background','assets/background.png');
	this.load.image('player','assets/player.png');
	this.load.image('dragon', 'assets/dragon.png');
	this.load.image('treasure', 'assets/treasure.png');
}

gameScene.create = function(){
	name = String(window.location.search).slice(6); //Имя игрока
	
	let bg = this.add.sprite(0,0, 'background');
	bg.setOrigin(0,0);
	
	this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height/2,'treasure');
	this.treasure.setScale(0.6)
	
	this.player = this.add.sprite(40, this.sys.game.config.height/2, 'player');
	this.player.setScale(0.5);
	
	this.isPlayerAlive = true;
	
	this.enemies = this.add.group({
		key:'dragon',
		repeat: 5,
		setXY: {
			x:110,
			y:100,
			stepX: 80,
			stepY: 20
		}
	});
	Phaser.Actions.ScaleXY(this.enemies.getChildren(),-0.5,-0.5);
	Phaser.Actions.Call(this.enemies.getChildren(),function(enemy){
		enemy.speed = Math.random() + 1;
	}, this);
	this.cameras.main.resetFX();
	
	this.timer = 1000 * 20;
	this.timerText = this.add.text(16, 16, this.timer / 1000, {fontSize: '32px', fontStyle:'bold'});
	this.helloText = this.add.text(100, 16, String(name), {fontSize: '16px', fontStyle:'bold'});
	let delay = 1000;
	
	this.timerEvent = this.time.addEvent({callback: this.timerLoop, delay: delay, repeat: this.timer/delay, callbackScope :this});
}

gameScene.update = function(){
	if (!this.isPlayerAlive){
		return;
	}
	
	let enemies = this.enemies.getChildren();
	let numEnemies = enemies.length;
	
	for (let i = 0; i < numEnemies; i++){
		enemies[i].y += enemies[i].speed;
		
		if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0){
			enemies[i].speed *= -1;
		} else if (enemies[i].y <= this.enemyMinY && enemies[i].speed <0){
			enemies[i].speed *= -1;
		}
		
		if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())){
			this.gameOver();
			break;
		}
	}
	
	if(this.input.activePointer.isDown){
		this.player.x += this.playerSpeed;
	}
	
	if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.treasure.getBounds())){
		this.timerEvent.destroy();
		this.treasure.visible=false;
	}
}

gameScene.gameOver = function(){
	this.isPlayerAlive = false;
	
	this.cameras.main.shake(500);
	
	this.time.delayedCall(250, function(){
		this.cameras.main.fade(250);
	}, [], this);
	
	this.time.delayedCall(500, function(){
		this.scene.restart();
	}, [], this);
}

gameScene.timerLoop = function(){
	console.log(1);
	let progress =  this.timerEvent.getRepeatCount();
	this.timerText.setText(progress);
	if (progress == 0){
		this.gameOver();
	}
}
