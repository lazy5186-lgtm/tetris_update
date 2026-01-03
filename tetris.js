const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;

const PIECES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

const COLORS = [
    '#00f0f0',
    '#f0f000',
    '#a000f0',
    '#f0a000',
    '#0000f0',
    '#00f000',
    '#f00000'
];

class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.fireworksCanvas = document.getElementById('fireworks-canvas');
        this.fireworksCtx = this.fireworksCanvas.getContext('2d');
        
        this.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        
        this.particles = [];
        
        this.init();
    }
    
    init() {
        // 캔버스 크기 설정
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        
        // 폭죽 캔버스도 같은 크기로 설정
        this.fireworksCanvas.width = this.canvas.width;
        this.fireworksCanvas.height = this.canvas.height;
        
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        this.fireworksCanvas.style.position = 'absolute';
        this.fireworksCanvas.style.pointerEvents = 'none';
        
        this.drawThumbnail();
    }
    
    start() {
        this.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameRunning = true;
        this.gamePaused = false;
        
        document.querySelector('.score-board').style.display = 'block';
        document.querySelector('.next-piece').style.display = 'block';
        
        this.spawnPiece();
        this.spawnPiece();
        this.updateScore();
        this.gameLoop();
    }
    
    gameLoop(time = 0) {
        if (!this.gameRunning) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        if (!this.gamePaused) {
            this.dropCounter += deltaTime;
            
            if (this.dropCounter > this.dropInterval) {
                this.dropPiece();
                this.dropCounter = 0;
            }
        }
        
        this.draw();
        this.updateFireworks(deltaTime);
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    spawnPiece() {
        if (this.nextPiece === null) {
            this.currentPiece = this.getRandomPiece();
            this.nextPiece = this.getRandomPiece();
        } else {
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomPiece();
        }
        
        this.pieceX = Math.floor((COLS - this.currentPiece.shape[0].length) / 2);
        this.pieceY = 0;
        
        if (this.collision()) {
            this.gameOver();
        }
        
        this.drawNextPiece();
    }
    
    getRandomPiece() {
        const index = Math.floor(Math.random() * PIECES.length);
        return {
            shape: PIECES[index],
            color: COLORS[index],
            type: index
        };
    }
    
    collision() {
        const shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = this.pieceX + x;
                    const boardY = this.pieceY + y;
                    
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return true;
                    }
                    
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    merge() {
        const shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.pieceY + y;
                    const boardX = this.pieceX + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type + 1;
                    }
                }
            }
        }
    }
    
    rotate() {
        const shape = this.currentPiece.shape;
        const rotated = Array(shape[0].length).fill(null).map(() => Array(shape.length).fill(0));
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                rotated[x][shape.length - 1 - y] = shape[y][x];
            }
        }
        
        const previousShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.collision()) {
            this.currentPiece.shape = previousShape;
        }
    }
    
    move(dir) {
        this.pieceX += dir;
        if (this.collision()) {
            this.pieceX -= dir;
        }
    }
    
    dropPiece() {
        this.pieceY++;
        if (this.collision()) {
            this.pieceY--;
            this.merge();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    hardDrop() {
        while (!this.collision()) {
            this.pieceY++;
        }
        this.pieceY--;
        this.merge();
        this.clearLines();
        this.spawnPiece();
    }
    
    clearLines() {
        const linesToClear = [];
        
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            this.createFireworks(linesToClear);
            
            for (const line of linesToClear) {
                this.board.splice(line, 1);
                this.board.unshift(Array(COLS).fill(0));
            }
            
            this.lines += linesToClear.length;
            this.score += linesToClear.length * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
        }
    }
    
    createFireworks(lines) {
        for (const lineY of lines) {
            for (let x = 0; x < COLS; x++) {
                const centerX = x * BLOCK_SIZE + BLOCK_SIZE / 2;
                const centerY = lineY * BLOCK_SIZE + BLOCK_SIZE / 2;
                
                for (let i = 0; i < 20; i++) {
                    const angle = (Math.PI * 2 * i) / 20;
                    const velocity = 5 + Math.random() * 5;
                    
                    this.particles.push({
                        x: centerX,
                        y: centerY,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity,
                        life: 100,
                        color: COLORS[Math.floor(Math.random() * COLORS.length)],
                        size: 3 + Math.random() * 3
                    });
                }
            }
        }
    }
    
    updateFireworks(deltaTime) {
        this.fireworksCtx.clearRect(0, 0, this.fireworksCanvas.width, this.fireworksCanvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.vy += 0.3;
            particle.life -= deltaTime / 16;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            const alpha = particle.life / 100;
            this.fireworksCtx.globalAlpha = alpha;
            this.fireworksCtx.fillStyle = particle.color;
            this.fireworksCtx.shadowBlur = 10;
            this.fireworksCtx.shadowColor = particle.color;
            
            this.fireworksCtx.beginPath();
            this.fireworksCtx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            this.fireworksCtx.fill();
        }
        
        this.fireworksCtx.globalAlpha = 1;
        this.fireworksCtx.shadowBlur = 0;
    }
    
    draw() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#333';
        for (let x = 0; x <= COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, COLORS[this.board[y][x] - 1]);
                }
            }
        }
        
        if (this.currentPiece) {
            const shape = this.currentPiece.shape;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(this.pieceX + x, this.pieceY + y, this.currentPiece.color);
                    }
                }
            }
        }
        
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('일시정지', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 2, 3);
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE - 2);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 5, y * BLOCK_SIZE, 3, BLOCK_SIZE - 2);
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE - 5, BLOCK_SIZE - 2, 3);
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#111';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const shape = this.nextPiece.shape;
            const blockSize = 16;
            const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize - 2,
                            blockSize - 2
                        );
                    }
                }
            }
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('게임 오버', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`점수: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    handleInput(e) {
        if (!this.gameRunning || (this.gamePaused && e.key !== 'p' && e.key !== 'P')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.move(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.move(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.dropPiece();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.rotate();
                break;
            case ' ':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.gamePaused = !this.gamePaused;
                break;
        }
    }
    
    drawThumbnail() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 240, 240, 0.1)');
        gradient.addColorStop(0.5, 'rgba(240, 240, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(160, 0, 240, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const thumbnailPieces = [
            { piece: 0, x: 2, y: 15, color: COLORS[0] },
            { piece: 1, x: 6, y: 17, color: COLORS[1] },
            { piece: 2, x: 0, y: 13, color: COLORS[2] },
            { piece: 3, x: 7, y: 14, color: COLORS[3] },
            { piece: 4, x: 4, y: 11, color: COLORS[4] },
            { piece: 5, x: 1, y: 10, color: COLORS[5] },
            { piece: 6, x: 5, y: 8, color: COLORS[6] },
            { piece: 0, x: 3, y: 5, color: COLORS[0] },
            { piece: 2, x: 7, y: 6, color: COLORS[2] }
        ];
        
        thumbnailPieces.forEach(item => {
            const shape = PIECES[item.piece];
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(item.x + x, item.y + y, item.color);
                    }
                }
            }
        });
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('테트리스', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#00f0f0';
        this.ctx.fillText('시작 버튼을 눌러주세요', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.shadowBlur = 0;
    }
}

const game = new Tetris();