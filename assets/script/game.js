const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");

canvasContext.imageSmoothingEnabled = true; 

// Onko mato pelissä mukana
let wormA_enabled = true;
let wormB_enabled = true;

let wormA_Trail = [];
let wormB_Trail = [];
let keyState_PlayerA = {};
let keyState_PlayerB = {};

let checkpointLocation = 8 // määrittää molempien matojen collisionCHeckPointDistance -etäisyyden päästä
 
// Worm A
let wormA_Size = 15;
let wormA_Speed = 2.5;
let wormA_directionChangeRate = .04;

let wormA_X = 50;
let wormA_Y = canvas.height / 2;
let wormA_trailLenght = 15;
let wormA_growingupSpeed = 0.3;
let wormA_collisionCheckPoint_X = wormA_X;
let wormA_collisionCheckPoint_Y = wormA_Y;
let wormA_collisionCheckPointDistance = wormA_Size + checkpointLocation;
let wormA_R = 210;
let wormA_G = 255;
let wormA_B = 255;
let wormA_colorChangeSpeed_R = 8;
let wormA_colorChangeSpeed_B = 15;
let wormA_direction = Math.PI / 2;

// Worm B
let wormB_Size = 15;
let wormB_Speed = 2.5;
let wormB_directionChangeRate = .04;

let wormB_X = 750;
let wormB_Y = canvas.height / 2;
let wormB_trailLenght = 15;
let wormB_growingupSpeed = 0.3;
let wormB_collisionCheckPoint_X = wormB_X;
let wormB_collisionCheckPoint_Y = wormB_Y;
let wormB_collisionCheckPointDistance = wormB_Size + checkpointLocation
let wormB_R = 255;
let wormB_G = 10;
let wormB_B = 0;
let wormB_colorChangeSpeed_R = 8;
let wormB_colorChangeSpeed_B = 15;
let wormB_direction = Math.PI * 1.5;

let playerAScore = 0;
let playerBScore = 0;
let playerBScoreOld = parseInt(localStorage.getItem('playerBScore')) || 0;
let soundControl = parseInt(localStorage.getItem('soundControl'))|| 0;
let cycleValue = 0;
let stars = [];
let mines = [];

let playerWin ="NO POINTS!";
let gameOver = false;

let scoreA= document.getElementById("scoreA");
let scoreB= document.getElementById("scoreB");
let pointsHoverB= document.getElementById("pointsHoverB");
let pointsHoverA= document.getElementById("pointsHoverA");


let scoreSingle= document.getElementById("scoreSingle");


let animationFrameId = null;
let i = null;
let multiPlayerControl = false;

const audioGameOver = new Audio('assets/sounds/gameover.mp3');
const audioWin1 = new Audio('assets/sounds/win1.mp3');
const audioWin2 = new Audio('assets/sounds/win2.mp3');
const audioTie = new Audio('assets/sounds/tie.mp3');
const audioGoodGame = new Audio('assets/sounds/goodGame.mp3');
const audioEat = new Audio('assets/sounds/eating.mp3');
const audioMine = new Audio('assets/sounds/mine.mp3');
const audioPop = new Audio('assets/sounds/pop.mp3');
const audioStart = new Audio('assets/sounds/start.mp3');



function increaseScore(player, arvo) {
    if (player === 'A') {
        if (arvo < 0 && playerAScore === 0) {
        } else {
            playerAScore += arvo;
            cycleValue += 1;
        };
        scoreA.innerText = playerAScore;
        scoreB.innerText = playerBScore;
        pointsHoverA.innerText = `${(arvo >= 0) ? `+${arvo}` : `${arvo}`}`;
        pointsHoverA.classList.add('points-hover');
        setTimeout(function () {
            pointsHoverA.innerText = '';
            pointsHoverA.classList.remove('points-hover');
          }, 600);
    } else if (player === 'B') {
        if (arvo < 0 && playerBScore === 0) {
        } else {
            playerBScore += arvo;
            cycleValue += 1;
        };
        scoreB.innerText = playerBScore;
        localStorage.setItem('playerBScore', playerBScore);
        scoreSingle.innerText = playerBScore;
        pointsHoverB.innerText = `${(arvo >= 0) ? `+${arvo}` : `${arvo}`}`;
        pointsHoverB.classList.add('points-hover');

        setTimeout(function () {
            pointsHoverB.innerText = '';
            pointsHoverB.classList.remove('points-hover');
          }, 600);
        
        scoreA.innerText = playerAScore;
    }
    
    if(multiPlayerControl){
        if (playerAScore > playerBScore) {
            playerWin = "WORM 1 WINS!";
        } else if (playerBScore > playerAScore) {
            playerWin = "WORM 2 WINS!";
        } else {
            playerWin = "TIE GAME!";
        };
    }else{
        playerWin = `Your Score: ${playerBScore}`;
    }
    
}


function wormA_checkStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const distance = Math.sqrt(Math.pow(wormA_X - star.x, 2) + Math.pow(wormA_Y - star.y, 2));

        if (distance < 25) {
            increaseScore('A', 10);
            audioEat.play();

            generateStars();
            if(cycleValue %5 === 0){
                generateMines();
            };

            if (wormA_Size > 5) {   
                wormA_Size -= 1;
                wormA_collisionCheckPointDistance = wormA_Size + checkpointLocation;
                wormA_directionChangeRate += .005

            // Tasataan koko / kääntyminen kuin on pelin alussa
                if (wormB_Size == 15) {
                    wormB_directionChangeRate = .04;
                }
            }           
        }
    }
    for (let i = 0; i < mines.length; i++) {
        const mine = mines[i];
        const distance = Math.sqrt(Math.pow(wormA_X - mine.x, 2) + Math.pow(wormA_Y - mine.y, 2));

        if (distance < 35) {

            wormA_Size += 1;
            wormA_collisionCheckPointDistance = wormA_Size + checkpointLocation;
                
            // Estetään suunnanmuutoksen hidastuminen, jos madon koko on yli 19
                if (wormA_Size <= 19) {
                    wormA_directionChangeRate -= .005
                };

            increaseScore('A', -5);
            audioMine.play();
            generateMines();
        }
    }
}

function wormB_checkStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const distance = Math.sqrt(Math.pow(wormB_X - star.x, 2) + Math.pow(wormB_Y - star.y, 2));

       
        if (distance < 25) {
            increaseScore('B', 10);
            audioEat.play();

            generateStars();
                if(cycleValue %5 === 0){
                    generateMines();
                };

            if (wormB_Size > 5) {
                wormB_Size -= 1;
                wormB_collisionCheckPointDistance = wormB_Size + checkpointLocation;
                wormB_directionChangeRate += .005
                
                // Tasataan koko / kääntyminen kuin on pelin alussa
                    if (wormB_Size == 15) {
                        wormB_directionChangeRate = .04;
                    }
            }       
        }
    }

    for (let i = 0; i < mines.length; i++) {
        const mine = mines[i];
        const distance = Math.sqrt(Math.pow(wormB_X - mine.x, 2) + Math.pow(wormB_Y - mine.y, 2));

        if (distance < 35) {

            wormB_Size += 1;
            wormB_collisionCheckPointDistance = wormB_Size + checkpointLocation;
            
            // Estetään suunnanmuutoksen hidastuminen, jos madon koko on yli 19
                if (wormB_Size <= 19) {
                    wormB_directionChangeRate -= .005
                };

            increaseScore('B', -5);
            audioMine.play();
            generateMines();      
        }
    }
}

function generateStars() {
    stars = [];

    const minDistance = 50;

    while (stars.length < 15) {
        const newX = Math.floor(Math.random() * canvas.width);
        const newY = Math.floor(Math.random() * canvas.height);

        let valid = true;
        for (let i = 0; i < stars.length; i++) {
            const distance = Math.sqrt(Math.pow(newX - stars[i].x, 2) + Math.pow(newY - stars[i].y, 2));
            if (distance < minDistance) {
                valid = false;
                break;
            }
        }

        if (valid) {
            stars.push({ x: newX, y: newY });
        }
    }
}

function generateMines() {
    mines = [];

    const minDistance = 50;

    while (mines.length < 5) {
        const newX = Math.floor(Math.random() * canvas.width);
        const newY = Math.floor(Math.random() * canvas.height);

        let valid = true;
        for (let i = 0; i < mines.length; i++) {
            const distance = Math.sqrt(Math.pow(newX - mines[i].x, 2) + Math.pow(newY - mines[i].y, 2));
            if (distance < minDistance) {
                valid = false;
                break;
            }
        }

        if (valid) {
            mines.push({ x: newX, y: newY });
        }
    }
}

function drawStarFromCircle(x, y, radius, spikes, color) {
    let rotation = Math.PI / 2 * 3;
    let xCenter = x;
    let yCenter = y;
    let step = Math.PI / spikes;

    // Piirretään tähti
    canvasContext.beginPath();
    canvasContext.moveTo(xCenter, yCenter - radius);

    for (let i = 0; i < spikes; i++) {
        x = xCenter + Math.cos(rotation) * radius;
        y = yCenter + Math.sin(rotation) * radius;
        canvasContext.lineTo(x, y);
        rotation += step;

        x = xCenter + Math.cos(rotation) * (radius / 2);
        y = yCenter + Math.sin(rotation) * (radius / 2);
        canvasContext.lineTo(x, y);
        rotation += step;
    }

    canvasContext.closePath();
    canvasContext.fillStyle = color;
    canvasContext.fill();

    // Piirretään pallo tähden päälle, jos kyseessä on miina
    if (color == "black") {
        canvasContext.beginPath();
        canvasContext.arc(xCenter, yCenter, radius / 1.4, 0, 2 * Math.PI);
        canvasContext.fillStyle = "black";
        canvasContext.fill();
        canvasContext.closePath();
    }
};


function drawStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        drawStarFromCircle(star.x, star.y, 15, 5,'rgb(255, 100, 55');
    }
}

function drawMines() {
    for (let i = 0; i < mines.length; i++) {
        const mine = mines[i];
        drawStarFromCircle(mine.x, mine.y, 25, 8,'black');
    }
}

function wormA_drawWorm() {
    for (let i = Math.max(0, wormA_Trail.length - wormA_trailLenght); i < wormA_Trail.length; i++) {
        const { x, y, color } = wormA_Trail[i];
        canvasContext.beginPath();
        canvasContext.arc(x, y, wormA_Size, 0, 2 * Math.PI);
        canvasContext.fillStyle = color;
        canvasContext.fill();
        canvasContext.closePath();

        for (let eyes = -1; eyes <= 1; eyes += 2) {
            wormEyes_X = wormA_X + Math.sin(wormA_direction + eyes) * 4;
            wormEyes_Y = wormA_Y + Math.cos(wormA_direction + eyes) * 4;
            drawEyes(wormEyes_X, wormEyes_Y, 4, "rgb(255,255,255)");
            drawEyes(wormEyes_X, wormEyes_Y, 2, "rgb(0,0,0)");
        }
    }
}

function wormA_moveWorm() {
    wormA_X += Math.sin(wormA_direction) * wormA_Speed;
    wormA_Y += Math.cos(wormA_direction) * wormA_Speed;
    wormA_trailLenght += wormA_growingupSpeed;
    
    let wormColor = `rgb(${wormA_R}, ${wormA_G}, ${wormA_B})`;
    wormA_Trail.push({ x: wormA_X, y: wormA_Y, color: wormColor });

    while (wormA_Trail.length > wormA_trailLenght) {
        wormA_Trail.shift();
    }
}

function wormA_checkCollisions() {
    if (gameOver) return;

    for (let c3po = -0.5; c3po <= 0.5; c3po += 0.5) {
        wormA_collisionCheckPoint_X =
            wormA_X + Math.sin(wormA_direction + c3po) * wormA_collisionCheckPointDistance;
        wormA_collisionCheckPoint_Y =
            wormA_Y + Math.cos(wormA_direction + c3po) * wormA_collisionCheckPointDistance;

        if (
            wormA_collisionCheckPoint_X < 0 ||
            wormA_collisionCheckPoint_X > canvas.width ||
            wormA_collisionCheckPoint_Y < 0 ||
            wormA_collisionCheckPoint_Y > canvas.height ||
            wormA_selfCollision(wormA_collisionCheckPoint_X, wormA_collisionCheckPoint_Y) ||
            wormA_wormTowormCollision(wormA_collisionCheckPoint_X, wormA_collisionCheckPoint_Y)
        ) {
            gameOver = true;
            return;
        }
    }
}

function wormA_selfCollision(x, y) {
    const pxColor = canvasContext.getImageData(x, y, 1, 1).data;
    return pxColor[1] == wormA_G;
}

function wormA_wormTowormCollision(x, y) {
    const pxColor = canvasContext.getImageData(x, y, 1, 1).data;
    return pxColor[1] == wormB_G;
}

function wormA_modWorm() {
    wormA_R += wormA_colorChangeSpeed_R;

    if (wormA_R < 0 || wormA_R > 255) {
        wormA_colorChangeSpeed_R = -wormA_colorChangeSpeed_R;
    }
    if (wormA_B < 0 || wormA_B > 255) {
        wormA_colorChangeSpeed_B = -wormA_colorChangeSpeed_B;
    }
}

function wormB_drawWorm() {
    for (let i = Math.max(0, wormB_Trail.length - wormB_trailLenght); i < wormB_Trail.length; i++) {
        const { x, y, color } = wormB_Trail[i];
        canvasContext.beginPath();
        canvasContext.arc(x, y, wormB_Size, 0, 2 * Math.PI);
        canvasContext.fillStyle = color;
        canvasContext.fill();
        canvasContext.closePath();

        for (let eyes = -1; eyes <= 1; eyes += 2) {
            wormEyes_X = wormB_X + Math.sin(wormB_direction + eyes) * 4;
            wormEyes_Y = wormB_Y + Math.cos(wormB_direction + eyes) * 4;
            drawEyes(wormEyes_X, wormEyes_Y, 4, "rgb(255,255,255)");
            drawEyes(wormEyes_X, wormEyes_Y, 2, "rgb(0,0,0)");
        }
    }
}

function wormB_moveWorm() {
    wormB_X += Math.sin(wormB_direction) * wormB_Speed;
    wormB_Y += Math.cos(wormB_direction) * wormB_Speed;
    wormB_trailLenght += wormB_growingupSpeed;
    
    let wormColor = `rgb(${wormB_R}, ${wormB_G}, ${wormB_B})`;
    wormB_Trail.push({ x: wormB_X, y: wormB_Y, color: wormColor });

    while (wormB_Trail.length > wormB_trailLenght) {
        wormB_Trail.shift();
    }
}

function wormB_checkCollisions() {
    if (gameOver) return;

    for (let c3po = -0.4; c3po <= 0.4; c3po += 0.4) {
        wormB_collisionCheckPoint_X = wormB_X + Math.sin(wormB_direction + c3po) * wormB_collisionCheckPointDistance;
        wormB_collisionCheckPoint_Y = wormB_Y + Math.cos(wormB_direction + c3po) * wormB_collisionCheckPointDistance;

        if (
            wormB_collisionCheckPoint_X < 0 ||
            wormB_collisionCheckPoint_X > canvas.width ||
            wormB_collisionCheckPoint_Y < 0 ||
            wormB_collisionCheckPoint_Y > canvas.height ||
            wormB_selfCollision(wormB_collisionCheckPoint_X, wormB_collisionCheckPoint_Y) ||
            wormB_wormTowormCollision(wormB_collisionCheckPoint_X, wormB_collisionCheckPoint_Y)
        ) {
            gameOver = true;
            return;
        }
    }
}

function wormB_selfCollision(x, y) {
    const pxColor = canvasContext.getImageData(x, y, 1, 1).data;
    return pxColor[1] == wormB_G;
}

function wormB_wormTowormCollision(x, y) {
    const pxColor = canvasContext.getImageData(x, y, 1, 1).data;
    return pxColor[1] == wormA_G;
}

function wormB_modWorm() {
    wormB_R += wormB_colorChangeSpeed_R;

    if (wormB_R < 0 || wormB_R > 255) {
        wormB_colorChangeSpeed_R = -wormB_colorChangeSpeed_R;
    }
    if (wormB_B < 0 || wormB_B > 255) {
        wormB_colorChangeSpeed_B = -wormB_colorChangeSpeed_B;
    }
}

// Piirretään molempien matojen silmät
function drawEyes(x, y, radius, color) {
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = color;
    canvasContext.fill();
    canvasContext.closePath();
}

// Piirretään tuntosarvet molemmille madoille
function drawSensoryHorns(gameType) {
    for (let horns = -0.3; horns <= 0.3; horns += .6) {

        if (wormA_enabled && gameType==2) {
            wormA_hornX1 = wormA_X + Math.sin(wormA_direction + horns) * wormA_collisionCheckPointDistance / 1.3;
            wormA_hornY1 = wormA_Y + Math.cos(wormA_direction + horns) * wormA_collisionCheckPointDistance / 1.3;
            wormA_hornX2 = wormA_X + Math.sin(wormA_direction + horns) * wormA_collisionCheckPointDistance * 1.2;
            wormA_hornY2 = wormA_Y + Math.cos(wormA_direction + horns) * wormA_collisionCheckPointDistance * 1.2;
            
            canvasContext.beginPath();
            canvasContext.moveTo(wormA_hornX1, wormA_hornY1);
            canvasContext.lineTo(wormA_hornX2, wormA_hornY2);
            canvasContext.lineWidth = 1.5; 
            canvasContext.strokeStyle = "black";
            canvasContext.stroke();
            canvasContext.fillStyle = "black";
            canvasContext.arc(wormA_hornX2, wormA_hornY2, wormA_Size / 6, 0, 2 * Math.PI);
            canvasContext.fill();
            canvasContext.closePath();
        };
        
        if (wormB_enabled) {
            wormB_hornX1 = wormB_X + Math.sin(wormB_direction + horns) * wormB_collisionCheckPointDistance / 1.3;
            wormB_hornY1 = wormB_Y + Math.cos(wormB_direction + horns) * wormB_collisionCheckPointDistance / 1.3;
            wormB_hornX2 = wormB_X + Math.sin(wormB_direction + horns) * wormB_collisionCheckPointDistance * 1.2;
            wormB_hornY2 = wormB_Y + Math.cos(wormB_direction + horns) * wormB_collisionCheckPointDistance * 1.2;

            canvasContext.beginPath();
            canvasContext.moveTo(wormB_hornX1, wormB_hornY1);
            canvasContext.lineTo(wormB_hornX2, wormB_hornY2);
            canvasContext.lineWidth = 2; 
            canvasContext.strokeStyle = "black";
            canvasContext.stroke();
            canvasContext.fillStyle = "black";
            canvasContext.arc(wormB_hornX2, wormB_hornY2, wormB_Size / 6, 0, 2 * Math.PI);
            canvasContext.fill();
            canvasContext.closePath();
        };
    }

}

function playerA_controlKeyboard() {
    document.addEventListener("keydown", function (event) {
        keyState_PlayerA[event.key] = true;
    });

    document.addEventListener("keyup", function (event) {
        keyState_PlayerA[event.key] = false;
    });

    if (keyState_PlayerA["d"]) {
        wormA_direction -= wormA_directionChangeRate;
    }

    if (keyState_PlayerA["a"]) {
        wormA_direction += wormA_directionChangeRate;
    }
}

function playerB_controlKeyboard() {
    document.addEventListener("keydown", function (event) {
        keyState_PlayerB[event.key] = true;
    });

    document.addEventListener("keyup", function (event) {
        keyState_PlayerB[event.key] = false;
    });

    if (keyState_PlayerB["ArrowRight"]) {
        wormB_direction -= wormB_directionChangeRate;
    }

    if (keyState_PlayerB["ArrowLeft"]) {
        wormB_direction += wormB_directionChangeRate;
    }
}

function drawGameOver() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const winText = `${playerWin}`;
    const gameOverText = "GAME OVER";
    let isVisible = true;

    canvasContext.fillStyle = "red"; 
    canvasContext.font = "bold 85px Montserrat";
    drawCenteredText(winText, -20, "green"); 

    canvasContext.fillStyle = "white";
    canvasContext.font = "35px Montserrat";
    drawCenteredText(gameOverText, -100, "red"); 

    
    audioGameOver.play();
    setTimeout(function() {
        if (playerWin == "WORM 1 WINS!") {
            audioWin1.play();
        } else if (playerWin == "TIE GAME!") {
            audioTie.play();
        } else if(playerWin == "WORM 2 WINS!") {
            audioWin2.play();
        } else if(!multiPlayerControl){
            audioGoodGame.play();
        }else{
            audioGoodGame.play();
        }
    }, 800);
    
    if(!multiPlayerControl){
        canvasContext.fillStyle = "white";
        canvasContext.font = "20px Montserrat";
        drawCenteredText(`Your previous score: ${playerBScoreOld}`, -65, "black");
    };

    const newGameButtonWidth = 140;
    const newGameButtonHeight = 40;
    const newGameText = "TRY AGAIN";
    const newGameTextSize = 20;

    // Lisää reunus
    canvasContext.strokeStyle = "white";
    canvasContext.lineWidth = 4;
    canvasContext.strokeRect(canvas.width / 2 - 70, canvas.height / 2 + 40, 140, 40);


    function blinkText() {
        isVisible = !isVisible;

        if (isVisible) {
            canvasContext.fillStyle = "white";
            canvasContext.font = "25px Montserrat";
            canvasContext.fillText("Press ENTER", canvas.width / 2 - 80, canvas.height / 2 + 120);
        } else {
            canvasContext.clearRect(canvas.width / 2 - 80, canvas.height / 2 + 100, 180, 30);
        }
    }

    setInterval(blinkText, 500);

    canvasContext.fillStyle = "green";
    canvasContext.fillRect(canvas.width / 2 - newGameButtonWidth / 2, canvas.height / 2 + 40, newGameButtonWidth, newGameButtonHeight);
    canvasContext.fillStyle = "white";
    canvasContext.font = `${newGameTextSize}px Montserrat`;

    const newGameTextWidth = canvasContext.measureText(newGameText).width;
    canvasContext.fillText(newGameText, canvas.width / 2 - newGameTextWidth / 2, canvas.height / 2 + 40 + newGameButtonHeight / 2 + newGameTextSize / 2 - 2);

    function listenToKeyboard(event) {
        if (event.keyCode === 13) {
            location.reload();
        }
    }

    document.addEventListener("keydown", listenToKeyboard);
}

function drawCenteredText(text, yOffset, color) {
    canvasContext.fillStyle = color;
    const fontSize = 35;
    canvasContext.font = `bold ${fontSize}px Montserrat`;

    // Mittaa tekstin leveys
    const textWidth = canvasContext.measureText(text).width;

    // Laske x- ja y-koordinaatit keskittämiseen
    const x = (canvas.width - textWidth) / 2;
    const y = canvas.height / 2 + yOffset;

    // Piirrä teksti
    canvasContext.fillText(text, x, y);
}

function toggleSound() {
    var img = document.getElementById('soundOnOff');
    if (audioGameOver.muted) {
        img.src='assets/images/soundOn.png'
        audioGameOver.muted = false;
        audioWin1.muted = false;
        audioWin2.muted = false;
        audioTie.muted = false;
        audioGoodGame.muted = false;
        audioEat.muted = false;
        audioMine.muted = false;
        audioPop.muted = false;
        audioStart.muted = false;
        audioPop.play();
        soundControl=0;

    } else{
        img.src='assets/images/soundOff.png'
        audioGameOver.muted = true;
        audioWin1.muted = true;
        audioWin2.muted = true;
        audioTie.muted = true;
        audioGoodGame.muted = true;
        audioEat.muted = true;
        audioMine.muted = true;
        audioPop.muted = true;
        audioStart.muted = true;
        soundControl=1;

    }
    localStorage.setItem('soundControl', soundControl);
}



function handleNewGameClick(event) {
    if (gameOver) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        if (
            mouseX > canvas.width / 2 - 70 &&
            mouseX < canvas.width / 2 + 70 &&
            mouseY > canvas.height / 2 + 40 &&
            mouseY < canvas.height / 2 + 80
        ) {
            location.reload();
        }
    }
}
//Kun valitset pelityypin, tehosteen ääni ennen painikkeiden napsauttamista.(MouseOver)

function popSound(){
    audioPop.play()
        .then(() => {
        })
        .catch(error => {
        });
}

function game(gameType) {
    var welcomeContent = document.getElementById('gameTypeSelect');
    welcomeContent.style.display = 'none';
    var scoreSingleContent = document.getElementById('scoreBannerSingle');
    var scoreMultiContent = document.getElementById('scoreBannerMulti');
    var gameControlInfoContent = document.getElementById('gameControlInfo');

    if(i==1){
        audioStart.volume = 0.5;
        audioStart.play();
    };

    if(gameType==1){
        gameControlInfoContent.innerHTML='&nbsp&nbsp&nbsp&nbspGame Controls: Arrow Keys LEFT and RIGHT';
        scoreSingleContent.style.display ='flex';
        wormB_checkStars();
        wormB_checkCollisions();
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        if (gameOver) {
            drawGameOver();
            return;
        }
    
        drawSensoryHorns(1);
        drawStars();
        drawMines();
    
        playerB_controlKeyboard();
        if (wormB_enabled) {
            wormB_moveWorm();
            wormB_modWorm();
            wormB_drawWorm();
        };

    }else if(gameType==2){
        multiPlayerControl=true;
        scoreMultiContent.style.display ='flex';
        wormA_checkStars();
        wormB_checkStars();
        wormA_checkCollisions();
        wormB_checkCollisions();
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
        if (gameOver) {
            drawGameOver();
            return;
        }
    
        drawSensoryHorns(2);
        drawStars();
        drawMines();
    
        playerA_controlKeyboard();
        playerB_controlKeyboard();
    
        if (wormA_enabled) {
            wormA_moveWorm();
            wormA_modWorm();
            wormA_drawWorm();
        };
    
        if (wormB_enabled) {
            wormB_moveWorm();
            wormB_modWorm();
            wormB_drawWorm();
        };
    
    }
    animationFrameId = requestAnimationFrame(() => game(gameType));
    i+=1;
   
};

// Pelin alustaminen
document.addEventListener("DOMContentLoaded", function() {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      
        if (!isChrome) {
            var canvContent = document.querySelector('canvas');
            var bannerContent = document.getElementById('topBanner');
            var gameTypeSelectContent = document.getElementById('gameTypeSelect');
            var logoContent = document.getElementById('logo');

            logoContent.style.left='auto';
            gameTypeSelectContent.style.display='none';
            canvContent.style.display = 'none';
            bannerContent.style.display = 'none';
            var warning = document.createElement('div');
            warning.innerHTML = '<p>This site works best with Google Chrome.</p><button id="continueButton">Click here to continue</button>';
            warning.id = 'Warning';
            warning.style.position = 'fixed';
            warning.style.top = '50%';
            warning.style.left = '50%';
            warning.style.transform = 'translate(-50%, -50%)';
            warning.style.fontSize = '44px';
            warning.style.padding = '40px';
            warning.style.background = 'red';
            warning.style.color = 'white';
            document.body.appendChild(warning);

            document.getElementById('continueButton').addEventListener('click', function() {
                warning.remove();
                canvContent.style.display = 'block';
                gameTypeSelectContent.style.display='block';
                bannerContent.style.display = 'flex';
                generateStars();
                generateMines();
                if(soundControl==1){
                    toggleSound();
                };
            });
        }
        generateStars();
        generateMines();

        if(soundControl==1){
            toggleSound();
        };
});

document.addEventListener("click", handleNewGameClick);
document.getElementById("soundOnOff").addEventListener("click", toggleSound);