class HockeyGame{

	constructor(lives, playingTime, ballsAtATime, dropInterval)
	{
		this.minGX = 40;
		this.maxGX = 220;
	    this.minBX = 16;
	    this.maxBX = 274;
	    this.height = 500;
	    this.gX = 130;
	    this.moving = false;
	    this.gameEnded = false;
	    this.point = 0;
	    this.lives = lives;
	    this.playingTime =playingTime;
	    this.dropBallLower = 1;
	    this.dropBallUpper = 2;
	    this.ballsAtATime = ballsAtATime;
	    this.dropInterval = dropInterval;
        
        this.gameCanvas = document.getElementById('game-canvas');
	    this.goalKeeper = document.getElementById('goal-keeper');
        this.livesDiv = document.getElementById('lives');
        this.pointDiv = document.getElementById('point');

        this.positionGameKeeper();
        this.showLives();
        this.dropBalls();

        this.lasttouch = null;

        setTimeout(() => {
        this.endGame();
    	}, this.playingTime * 1000);

    	window.addEventListener('keydown', (e) => {
	        if (this.moving) {
	            return;
	        }
	        switch (e.keyCode) {
	            case 37:
	                this.moving = true;
	                this.moveGameKeeper('left');
	                break;
	            case 39:
	                this.moving = true;
	                this.moveGameKeeper('right');
	                break;
	            default:
	                break;
	        } e.keyCode
    	});


	    window.addEventListener('keyup', (e) => {
	        if (e.keyCode == 37 || e.keyCode == 39) {
	            this.moving = false;
	        }
	    });

        document.getElementById('goal-keeper').addEventListener('touchmove',(e) => {
            if(this.lasttouch)
            {
                this.moveGameKeeperBySwipe(e.touches[0].screenX-this.lasttouch)
            }
            this.lasttouch = e.touches[0].screenX;
        })

	    
	}

	moveGameKeeperBySwipe(shiftamount) { 
	    this.gX += shiftamount;
	    this.positionGameKeeper();
 	}

	moveGameKeeper(direction) {
        if (direction == 'left' && this.gX > this.minGX) {
            this.gX --;
        }
        if (direction == 'right' && this.gX < this.maxGX) {
            this.gX ++;
        }
        this.positionGameKeeper();
        if (this.moving) {
            setTimeout(() => {
                this.moveGameKeeper(direction);
            }, 10);
        }
    }

	positionGameKeeper()
	{
		this.goalKeeper.style.left = String(this.gX) + 'px';
	}

	showLives()
	{
		this.livesDiv.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            let img = document.createElement("IMG");
            img.src = './img/life.png';
            img.width = 19;
            this.livesDiv.appendChild(img);
        }
	}

	async dropBalls()
	{
		for(let i = 0; i < this.ballsAtATime; i++)
		{
			
            let aBall = this.createABallElement();
            await new Promise ( done => setTimeout(()=> {
            	this.gameCanvas.appendChild(aBall);
            	this.dropBall(this.createBall(aBall));
            	done();
            },this.dropInterval));

            
		}
	}

	reDropABall()
	{
		let aBall = this.createABallElement();
		this.gameCanvas.appendChild(aBall);
        this.dropBall(this.createBall(aBall));

	}

	createABallElement()
	{
		let aBall = document.createElement("IMG");
			aBall.src = './img/ball.png';
            aBall.width = 30;
            aBall.classList.add('ball');
        return aBall;
	}

	createBall(ballElement)
    {   
    	return {
    		ballElement : ballElement,
	        bX : 16,
	        bY : 57,
	        falling : false,
	        flying : false,
	        bTargetX : 40,
	        tanA : 0,
	        tanFlyAngle : 0
    	}
        
    }

	dropBall(ball)
	{
		if (this.gameEnded) {
            return;
        }
        ball.ballElement.style.display = 'initial';
        ball.bY = 57;
        ball.bX = this.randomIntFromInterval(this.minBX, this.maxBX);
        ball.bTargetX = this.randomIntFromInterval(this.minGX, this.maxGX); // random target point
        ball.tanA = (ball.bX - ball.bTargetX)/this.height;
        ball.falling = true;
        this.fallBall(ball);
	}

	fallBall(ball)
	{
		if (this.gameEnded) {
            return;
        }
        if (ball.bY < 557) {
            ball.bY ++;
            ball.bX = ball.bTargetX + ball.tanA * (this.height - ball.bY + 57);
            ball.ballElement.style.left = String(ball.bX) + 'px';
            ball.ballElement.style.top = String(ball.bY) + 'px';
        } else {
            ball.falling = false;
            this.lives --;
            ball.ballElement.style.display = 'none';
            this.showLives();
            if (!this.lives) {
                this.endGame();
                return;
            }
            setTimeout(() => {
               this.reDropABall();
            }, this.randomIntFromInterval(this.dropBallLower*1000, this.dropBallUpper*1000));
        }
        if (ball.falling) {
            setTimeout(() => {
                this.fallBall(ball);
            }, 3);
        }
        this.calculateHitBall(ball);
	}

	calculateHitBall(ball)
	{
		if (ball.flying) {
            return;
        }
        if (Math.abs(477 - ball.bY) < 15 && Math.abs(ball.bX - this.gX - 32) < 15) {
            this.point ++;
            this.pointDiv.innerText = this.point;
            ball.falling = false;
            ball.flying = true;
            ball.tanFlyAngle = Math.tan(this.randomIntFromInterval(-45, 45) * Math.PI/180);
            ball.bTargetX = ball.bX;
            this.flyBall(ball);
        }
	}

	flyBall(ball)
	{
		if (this.gameEnded) {
            return;
        }
        if (ball.bX > 0 && ball.bX < 320 && ball.bY > -30) {
            ball.bY --;
            ball.bX = ball.bTargetX - ball.tanFlyAngle * (this.height - ball.bY + 57);
            ball.ballElement.style.left = String(ball.bX) + 'px';
            ball.ballElement.style.top = String(ball.bY) + 'px';
        } else {
            ball.flying = false;
            ball.ballElement.style.display = 'none';
            this.reDropABall();
        }
        if (ball.flying) {
            setTimeout(() => {
                this.flyBall(ball);
            }, 3);
        }
	}

	endGame() {
        this.gameEnded = true;
        if (!this.lives) {
            alert('Game Over!');
        } else {
            alert('Time out! You score ' + this.point + '. Congratulations!');
        }
    }

	randomIntFromInterval(min, max) // min and max included
	{  
    return Math.floor(Math.random() * (max - min + 1) + min);
	}


}

window.addEventListener('DOMContentLoaded', () => {

    // Parameters: "Lives", "gamePlayTime", "No.of Ball at a time", "Ball drop interval in seconds"
	let NewGame = new HockeyGame(4,30,2,1000);
	
})