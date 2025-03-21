// 导入精灵图像
import SPRITES from './assets/sprites.js';

// 游戏版本号
const GAME_VERSION = '1.0.3';

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 基准尺寸（设计尺寸）
const BASE_WIDTH = 1200;
const BASE_HEIGHT = 1600;

// 设置画布大小
canvas.width = BASE_WIDTH;
canvas.height = BASE_HEIGHT;

// 缩放因子
let scale = 1;

// 更新缩放因子
function updateScale() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    scale = Math.min(displayWidth / BASE_WIDTH, displayHeight / BASE_HEIGHT);
}

// 初始更新缩放
updateScale();
window.addEventListener('resize', updateScale);

// 游戏变量
let bird = {
    x: 100,
    y: canvas.height / 2,
    velocity: 0,
    gravity: 0.5,
    gravityDirection: 1,
    size: 120, // 增大小鸟尺寸到原来的3倍
    rotation: 0,
    trail: [],
    flipProgress: 0,
    coins: 0,
    level: 1,
    baseGravity: 0.5,
    baseJumpForce: 12, // 增加跳跃力以适应更大的尺寸
    invincible: false,
    // 等级特权
    getGravity() {
        return this.baseGravity * Math.pow(0.95, this.level - 1);
    },
    getJumpForce() {
        return this.baseJumpForce * Math.pow(1.05, this.level - 1);
    },
    getTrailLength() {
        return 5 + Math.floor(this.level * 1.5);
    },
    getColor() {
        const colors = [
            '#ffd700',
            '#ff4500',
            '#9400d3',
            '#00ffff',
            '#ff1493',
            '#32cd32',
            '#4169e1',
            '#ff69b4',
            '#daa520',
            '#ff0000'
        ];
        return colors[Math.min(this.level - 1, colors.length - 1)];
    }
};

let pipes = [];
let coins = [];
let clouds = [];
let particles = [];
let score = 0;
let maxScore = 0;
let gameOver = false;
let playerName = '';
const pipeWidth = 100; // 增大基础尺寸
const pipeGap = 300;   // 增大基础尺寸
const pipeSpeed = 4;   // 增加速度以匹配更大的尺寸
let gameStarted = false;
let countdownValue = 3;
let lastCountdownTime = 0;
let gameSpeed = 1; // 添加游戏速度变量
let lastFrameTime = 0; // 添加上一帧时间变量

// 加载或初始化排行榜
let leaderboard = JSON.parse(localStorage.getItem('flappyLeaderboard')) || [];

// 加载图片资源
const birdImg = new Image();
birdImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk4MzlBNjE0NjU1MTFFNDkyRTVFMTA4QzM5QTFCQUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk4MzlBNjI0NjU1MTFFNDkyRTVFMTA4QzM5QTFCQUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5OTgzOUE1RjQ2NTUxMUU0OTJFNUUxMDhDMzlBMUJBQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5OTgzOUE2MDQ2NTUxMUU0OTJFNUUxMDhDMzlBMUJBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pq6O1QUAAAGwSURBVHjaYvz//z/DQAKAAGJiGGAAEEAsDMMZAAQQC4yRmZ3FICYiwvDt+3eGHz9/MXBzczP8/PWLgY2NjYGZmZnh9+/fDH///WNgYmJi+P//P8OfP38YGBkZGUCAkZGRxDQFEEAsMMa///8YxEVFGbi5uBi+fv3K8P37dwYBAQGGO3fvMvDz8zPw8/Ex3L17l0FYWJjh/r17DJycnAwPHz5k4OHhYXj+/DkDNzcPAycXF4lGAAQQC0wHExMTw/dv3xn4+fkZvn7+zPD582cGQUFBhpcvXzJ8/PiRQVxcnOHFixcMb968YZCSkmJ49uwZA9B1DK9fv2H48OEDAxc3F8PPnz9IMgIggBhp7YMBBQABxDLYIxAggFgGewQCBBDLYI9AgABiGewRCBBALIM9AgECiGWwRyBAALEM9ggECCCWwR6BAAHEMtgjECCAWAZ7BAIEEMtgj0CAABrQCAQIIJbBHoEAAcQy2CMQIIBYBnsEAgQQy2CPQIAAYhnsEQgQQCyDPQIBAohFRFiIYbBHIEAAsQz2CAQIIJbBHoEAAcQy2CMQIMAABqYEik3RCN0AAAAASUVORK5CYII=';

// 云朵类
class Cloud {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * canvas.height;
        this.width = 80 + Math.random() * 120; // 增大基础尺寸
        this.height = 40 + Math.random() * 60; // 增大基础尺寸
        this.speed = 1 + Math.random(); // 增加速度
        this.opacity = 0.3 + Math.random() * 0.3;
    }

    update() {
        this.x -= this.speed;
        return this.x + this.width > 0;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.height/2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/3, this.y - this.height/4, this.height/2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/1.5, this.y, this.height/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 粒子类
class Particle {
    constructor(x, y, color = '#ffd700') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8; // 增加速度
        this.vy = (Math.random() - 0.5) * 8; // 增加速度
        this.life = 1;
        this.color = color;
        this.size = 6; // 增大基础尺寸
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        return this.life > 0;
    }

    draw() {
        ctx.fillStyle = `${this.color}${Math.floor(this.life * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 金币类
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.size = 50; // 增大基础尺寸
        this.rotation = 0;
        this.collected = false;
        this.value = 1;
        this.oscillation = Math.random() * Math.PI * 2;
        this.glowSize = 70; // 增大光晕尺寸
    }

    update() {
        this.x -= pipeSpeed; // 与管道同步移动
        this.rotation += 0.1;
        this.oscillation += 0.05;
        this.y = this.initialY + Math.sin(this.oscillation) * 15; // 增加浮动幅度并基于初始位置计算
        return !this.collected && this.x + this.size > 0; // 当金币移出屏幕时移除
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        
        // 添加外发光效果
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.glowSize);
        glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 旋转金币
        ctx.rotate(this.rotation);
        
        // 金币主体
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size/2);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(0.8, '#ffd700');
        gradient.addColorStop(1, '#daa520');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 绘制¥符号
        ctx.rotate(-this.rotation); // 保持¥符号正向
        ctx.fillStyle = '#b8860b';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¥', 0, 0);
        
        ctx.restore();
    }

    checkCollision(bird) {
        const distance = Math.sqrt(
            Math.pow(this.x + this.size/2 - (bird.x + bird.size/2), 2) +
            Math.pow(this.y + this.size/2 - (bird.y + bird.size/2), 2)
        );
        return distance < (this.size/2 + bird.size/2);
    }
}

// 生成新管道
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const isTop = Math.random() < 0.5; // 随机决定管道是从上方还是下方出现
    
    return {
        x: canvas.width,
        y: isTop ? 0 : height + pipeGap,
        width: pipeWidth,
        height: isTop ? height : canvas.height - height - pipeGap,
        passed: false,
        isTop: isTop
    };
}

// 绘制渐变背景
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (bird.gravityDirection === 1) {
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(1, '#2c3e50');
    } else {
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#4a90e2');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// API 配置
const API_BASE_URL = 'https://gravity-bird-server.onrender.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 带重试的 fetch 函数
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.log(`Attempt ${i + 1}/${retries} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

// 更新排行榜显示
async function updateLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    const currentPlayerDiv = document.getElementById('currentPlayer');
    
    try {
        // 获取全局排行榜数据
        const response = await fetchWithRetry(`${API_BASE_URL}/leaderboard`);
        const globalLeaderboard = await response.json();
        
        // 清空当前内容
        leaderboardContent.innerHTML = '';
        
        // 显示全局排行榜
        globalLeaderboard.forEach((entry, index) => {
            const div = document.createElement('div');
            const date = new Date(entry.date).toLocaleDateString('en-US');
            div.textContent = `${index + 1}. ${entry.name}: ${entry.score} pts Level ${entry.level} Coins ${entry.coins} (${date})`;
            
            // 如果是当前玩家的记录，高亮显示
            if (entry.name === playerName && entry.score === score) {
                div.classList.add('highlight');
            }
            
            leaderboardContent.appendChild(div);
        });
    } catch (error) {
        console.error('Failed to update leaderboard:', error);
        // 显示错误消息
        const errorDiv = document.createElement('div');
        errorDiv.style.color = '#ff4444';
        errorDiv.textContent = 'Unable to connect to server, showing local leaderboard';
        leaderboardContent.appendChild(errorDiv);
        
        // 如果获取全局排行榜失败，显示本地排行榜作为后备
        const localLeaderboard = JSON.parse(localStorage.getItem('flappyLeaderboard') || '[]');
        localLeaderboard.forEach((entry, index) => {
            const div = document.createElement('div');
            const date = new Date(entry.date).toLocaleDateString('en-US');
            div.textContent = `${index + 1}. ${entry.name}: ${entry.score} pts Level ${entry.level} Coins ${entry.coins} (${date}) [Local]`;
            if (entry.name === playerName && entry.score === score) {
                div.classList.add('highlight');
            }
            leaderboardContent.appendChild(div);
        });
    }
    
    // 更新当前玩家显示
    if (playerName && !gameOver) {
        currentPlayerDiv.textContent = `Current Player: ${playerName} | Level: ${bird.level} | Coins: ${bird.coins}`;
    } else {
        currentPlayerDiv.textContent = '';
    }
}

// 保存分数
async function saveScore(name, score) {
    const saveButton = document.getElementById('saveScore');
    // 禁用保存按钮，防止重复提交
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    
    const newScore = {
        name,
        score,
        level: bird.level,
        coins: bird.coins,
        date: new Date().toISOString()
    };
    
    try {
        // 提交分数到服务器
        const response = await fetchWithRetry(`${API_BASE_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newScore)
        });
        
        // 保存成功后更新排行榜显示
        await updateLeaderboard();
        
        // 显示成功消息
        const message = document.createElement('div');
        message.textContent = 'Score saved successfully!';
        message.style.color = '#4CAF50';
        message.style.marginTop = '10px';
        document.getElementById('leaderboardContent').prepend(message);
        
        // 3秒后移除消息
        setTimeout(() => message.remove(), 3000);
        
        // 隐藏保存按钮，显示已保存状态
        saveButton.style.display = 'none';
        const savedText = document.createElement('div');
        savedText.textContent = 'Score saved';
        savedText.style.color = '#4CAF50';
        savedText.style.padding = '10px';
        saveButton.parentNode.appendChild(savedText);
        
    } catch (error) {
        console.error('Failed to save score:', error);
        // 如果提交到服务器失败，保存到本地作为后备
        const localLeaderboard = JSON.parse(localStorage.getItem('flappyLeaderboard') || '[]');
        localLeaderboard.push(newScore);
        localLeaderboard.sort((a, b) => b.score - a.score);
        const top10 = localLeaderboard.slice(0, 10);
        localStorage.setItem('flappyLeaderboard', JSON.stringify(top10));
        
        // 显示本地保存消息
        const message = document.createElement('div');
        message.textContent = 'Server connection failed, score saved locally!';
        message.style.color = '#FFA500';
        message.style.marginTop = '10px';
        document.getElementById('leaderboardContent').prepend(message);
        
        // 更新显示
        await updateLeaderboard();
        
        // 重新启用保存按钮，允许重试
        saveButton.disabled = false;
        saveButton.textContent = 'Retry Save';
    }
}

// 更新游戏状态
function update(delta) {
    if (gameOver) return;
    
    if (!gameStarted) {
        // 倒计时逻辑
        const currentTime = Date.now();
        if (lastCountdownTime === 0) {
            lastCountdownTime = currentTime;
        }
        
        if (currentTime - lastCountdownTime >= 1000 / gameSpeed) {
            countdownValue--;
            lastCountdownTime = currentTime;
            
            if (countdownValue <= 0) {
                gameStarted = true;
            }
        }
        return;
    }

    // 更新小鸟
    bird.gravity = bird.getGravity();
    bird.velocity += bird.gravity * bird.gravityDirection * delta;
    bird.y += bird.velocity * delta;
    
    // 更新翻转动画
    if (bird.flipProgress > 0) {
        bird.flipProgress -= 0.1 * delta;
    }

    // 计算旋转角度（考虑重力方向）
    bird.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, bird.velocity * 0.1)) + 
                   (bird.gravityDirection === -1 ? Math.PI : 0) +
                   (bird.flipProgress * Math.PI);
    
    // 更新小鸟尾迹
    bird.trail.unshift({x: bird.x, y: bird.y, rotation: bird.rotation});
    if (bird.trail.length > bird.getTrailLength()) bird.trail.pop();

    // 更新云朵
    if (Math.random() < 0.02 * delta) clouds.push(new Cloud());
    clouds = clouds.filter(cloud => {
        cloud.x -= cloud.speed * delta;
        return cloud.x + cloud.width > 0;
    });

    // 更新金币
    coins = coins.filter(coin => {
        coin.rotation += 0.1 * delta;
        coin.oscillation += 0.05 * delta;
        coin.x -= pipeSpeed * delta;
        coin.y = coin.initialY + Math.sin(coin.oscillation) * 15;
        return !coin.collected && coin.x + coin.size > 0;
    });

    // 检查金币收集
    coins.forEach(coin => {
        if (!coin.collected && coin.checkCollision(bird)) {
            coin.collected = true;
            bird.coins++;
            // 增加游戏分数
            score += 2; // 每个金币增加2分
            maxScore = Math.max(score, maxScore);
            
            // 检查升级
            const newLevel = Math.floor(bird.coins / 5) + 1;
            if (newLevel > bird.level) {
                bird.level = Math.min(newLevel, 10); // 最高10级
                createLevelUpEffect(bird.x, bird.y);
                // 升级额外奖励分数
                score += 5; // 每次升级额外奖励5分
                maxScore = Math.max(score, maxScore);
            }
            createCoinCollectEffect(coin.x, coin.y);
        }
    });

    // 更新粒子
    particles = particles.filter(particle => {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.life -= 0.02 * delta;
        return particle.life > 0;
    });

    // 生成新管道和金币
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 400) { // 增加管道间距
        const pipe = createPipe();
        pipes.push(pipe);
        
        // 修改金币生成逻辑
        const gapCenter = pipe.isTop ? 
            pipe.height + pipeGap/2 :
            pipe.y - pipeGap/2;
        
        // 总是生成金币
        const coinCount = 3;
        const spacing = 80; // 增加金币间距
        const totalWidth = (coinCount - 1) * spacing;
        
        for (let i = 0; i < coinCount; i++) {
            const offset = (i - (coinCount-1)/2) * spacing;
            const coinX = pipe.x + pipeWidth/2;
            const coinY = gapCenter + offset;
            
            // 确保金币在安全范围内
            if (coinY > 150 && coinY < canvas.height - 150) { // 调整安全范围
                coins.push(new Coin(coinX, coinY));
            }
        }
    }

    // 更新管道位置
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed * delta;

        // 检查得分
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            maxScore = Math.max(score, maxScore);
            // 添加得分粒子效果
            for (let j = 0; j < 10; j++) {
                particles.push(new Particle(bird.x, bird.y));
            }
        }

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }

    // 碰撞检测
    if (!bird.invincible && (bird.y < 0 || bird.y + bird.size > canvas.height)) {
        gameOver = true;
        createExplosion(bird.x, bird.y);
    }

    pipes.forEach(pipe => {
        if (checkCollision(bird, pipe)) {
            gameOver = true;
            createExplosion(bird.x, bird.y);
        }
    });

    if (gameOver) {
        const gameOverScreen = document.getElementById('gameOver');
        const finalScoreSpan = document.getElementById('finalScore');
        gameOverScreen.classList.remove('hidden');
        finalScoreSpan.textContent = score;
        
        // Initialize the ad
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Ad initialization error:', e);
        }
    }
}

// 创建爆炸效果
function createExplosion(x, y) {
    const colors = ['#ff0000', '#ff7700', '#ffff00'];
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
    }
}

// 碰撞检测
function checkCollision(bird, pipe) {
    if (bird.invincible) return false; // 无敌模式下不会碰撞
    return bird.x + bird.size > pipe.x && 
           bird.x < pipe.x + pipe.width && 
           bird.y + bird.size > pipe.y && 
           bird.y < pipe.y + pipe.height;
}

// 创建升级特效
function createLevelUpEffect(x, y) {
    const colors = ['#ffd700', '#ff8c00', '#ff1493'];
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
    }
}

// 创建收集金币特效
function createCoinCollectEffect(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, '#ffd700'));
    }
}

// 绘制游戏画面
function draw() {
    ctx.save();
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    drawBackground();

    // 绘制云朵
    clouds.forEach(cloud => {
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        ctx.drawImage(SPRITES.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
        ctx.restore();
    });

    // 绘制管道
    pipes.forEach(pipe => {
        ctx.save();
        if (pipe.isTop) {
            ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
            ctx.scale(1, -1);
            ctx.translate(-(pipe.x + pipe.width / 2), -(pipe.y + pipe.height / 2));
        }
        ctx.drawImage(SPRITES.pipe, pipe.x, pipe.y, pipe.width, pipe.height);
        ctx.restore();
    });

    // 绘制金币
    coins.forEach(coin => coin.draw());

    // 绘制小鸟尾迹
    bird.trail.forEach((pos, i) => {
        const alpha = (1 - i/bird.getTrailLength()) * 0.2;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(pos.x + bird.size/2, pos.y + bird.size/2);
        ctx.rotate(pos.rotation);
        ctx.drawImage(SPRITES.bird, -bird.size/2, -bird.size/2, bird.size, bird.size);
        ctx.restore();
    });

    // 绘制小鸟
    ctx.save();
    ctx.translate(bird.x + bird.size/2, bird.y + bird.size/2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(SPRITES.bird, -bird.size/2, -bird.size/2, bird.size, bird.size);
    ctx.restore();

    // 绘制粒子
    particles.forEach(particle => particle.draw());

    // 绘制UI文本
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px Arial'; // 增大字体大小
    ctx.textAlign = 'left';
    ctx.strokeText(`Score: ${score}`, 20, 60);
    ctx.fillText(`Score: ${score}`, 20, 60);
    ctx.strokeText(`High Score: ${maxScore}`, 20, 120);
    ctx.fillText(`High Score: ${maxScore}`, 20, 120);
    ctx.strokeText(`Level: ${bird.level}`, 20, 180);
    ctx.fillText(`Level: ${bird.level}`, 20, 180);
    ctx.strokeText(`Coins: ${bird.coins}`, 20, 240);
    ctx.fillText(`Coins: ${bird.coins}`, 20, 240);

    // 绘制倒计时
    if (!gameStarted && !gameOver) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.font = 'bold 144px Arial'; // 增大字体大小
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const scale = 1 + Math.sin((Date.now() - lastCountdownTime) / 1000 * Math.PI) * 0.2;
        ctx.scale(scale, scale);
        
        if (countdownValue > 0) {
            ctx.strokeText(countdownValue, canvas.width/2, canvas.height/2);
            ctx.fillText(countdownValue, canvas.width/2, canvas.height/2);
        } else {
            ctx.strokeText('START!', canvas.width/2, canvas.height/2);
            ctx.fillText('START!', canvas.width/2, canvas.height/2);
        }
        ctx.restore();
    }

    // 绘制测试模式提示
    if (bird.invincible) {
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = 'bold 40px Arial'; // 增大字体大小
        ctx.textAlign = 'right';
        ctx.strokeText('Invincible Mode ON', canvas.width - 20, 60);
        ctx.fillText('Invincible Mode ON', canvas.width - 20, 60);
    }

    // 添加版本号显示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.font = '24px Arial'; // 增大字体大小
    ctx.textAlign = 'right';
    ctx.strokeText(`v${GAME_VERSION}`, canvas.width - 10, canvas.height - 10);
    ctx.fillText(`v${GAME_VERSION}`, canvas.width - 10, canvas.height - 10);

    ctx.restore();
}

// 游戏循环
function gameLoop(currentTime) {
    // 计算帧时间差
    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
    }
    const deltaTime = (currentTime - lastFrameTime) / (1000 / 60); // 标准化为60fps
    lastFrameTime = currentTime;

    // 使用deltaTime和gameSpeed更新游戏状态
    update(deltaTime * gameSpeed);
    draw();
    requestAnimationFrame(gameLoop);
}

// 重置游戏
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.gravityDirection = 1;
    bird.rotation = 0;
    bird.trail = [];
    bird.coins = 0;
    bird.level = 1;
    pipes = [];
    coins = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    countdownValue = 3;
    lastCountdownTime = 0;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('nameInput').value = '';
    bird.invincible = false;
    
    // 重置保存按钮状态
    const saveButton = document.getElementById('saveScore');
    saveButton.disabled = false;
    saveButton.style.display = 'inline-block';
    saveButton.textContent = 'Save Score';
    
    // 移除已保存状态文本（如果存在）
    const savedText = saveButton.parentNode.querySelector('div');
    if (savedText) {
        savedText.remove();
    }
}

// 初始化事件监听
function initializeEventListeners() {
    canvas.addEventListener('click', (e) => {
        if (!gameOver && gameStarted) {
            // 翻转重力
            bird.gravityDirection *= -1;
            bird.velocity = bird.gravityDirection * -bird.getJumpForce();
            bird.flipProgress = 1;
            
            // 添加重力翻转特效
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(bird.x, bird.y, '#ffffff'));
            }
        }
    });

    document.getElementById('saveScore').addEventListener('click', () => {
        const nameInput = document.getElementById('nameInput');
        const name = nameInput.value.trim();
        if (name) {
            playerName = name.substring(0, 8);
            saveScore(playerName, score);
        }
    });

    document.getElementById('playAgain').addEventListener('click', () => {
        resetGame();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameOver && gameStarted) {
                // 翻转重力
                bird.gravityDirection *= -1;
                bird.velocity = bird.gravityDirection * -bird.getJumpForce() * gameSpeed;
                bird.flipProgress = 1;
                
                // 添加重力翻转特效
                for (let i = 0; i < 15; i++) {
                    particles.push(new Particle(bird.x, bird.y, '#ffffff'));
                }
            }
            e.preventDefault();
        }
        
        // 测试模式快捷键
        if (e.code === 'KeyT') {
            // 增加5个金币
            bird.coins += 5;
            score += 10; // 增加相应的分数
            // 检查升级
            const newLevel = Math.floor(bird.coins / 5) + 1;
            if (newLevel > bird.level) {
                bird.level = Math.min(newLevel, 10); // 最高10级
                createLevelUpEffect(bird.x, bird.y);
                score += 5; // 升级奖励
            }
            maxScore = Math.max(score, maxScore);
            createCoinCollectEffect(bird.x, bird.y);
        }
        
        if (e.code === 'KeyI') {
            // 无敌模式开关
            bird.invincible = !bird.invincible;
            // 视觉反馈
            if (bird.invincible) {
                createLevelUpEffect(bird.x, bird.y);
            }
        }

        // 添加速度控制快捷键
        if (e.code === 'KeyS') {
            // 在1x和2x速度之间切换
            gameSpeed = gameSpeed === 1 ? 2 : 1;
            // 视觉反馈
            createLevelUpEffect(bird.x, bird.y);
        }
    });
}

// 初始化排行榜显示和事件监听
updateLeaderboard();
initializeEventListeners();

// 开始游戏
requestAnimationFrame(gameLoop);