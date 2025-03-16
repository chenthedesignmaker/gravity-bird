require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// CORS 配置
app.use(cors({
    origin: '*', // 在生产环境中应该设置为实际的域名
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('错误:', err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
});

// MongoDB连接
console.log('正在连接到MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB 连接成功！'))
.catch(err => {
    console.error('MongoDB 连接错误:', err);
    process.exit(1); // 如果数据库连接失败，终止服务器
});

// 监听数据库连接事件
mongoose.connection.on('connected', () => {
    console.log('Mongoose 已连接到 MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose 已断开连接');
});

// 定义分数模型
const Score = mongoose.model('Score', {
    name: String,
    score: Number,
    level: Number,
    coins: Number,
    date: Date
});

// 健康检查端点
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Gravity Bird 服务器正在运行',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? '已连接' : '未连接'
    });
});

// API路由
// 获取排行榜
app.get('/leaderboard', async (req, res) => {
    try {
        console.log('正在获取排行榜数据...');
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .exec();
        console.log(`成功获取 ${scores.length} 条排行榜记录`);
        res.json(scores);
    } catch (error) {
        console.error('获取排行榜失败:', error);
        res.status(500).json({ error: '获取排行榜失败', details: error.message });
    }
});

// 提交新分数
app.post('/scores', async (req, res) => {
    try {
        console.log('正在保存新分数:', req.body);
        const newScore = new Score(req.body);
        await newScore.save();
        console.log('分数保存成功:', newScore);
        res.status(201).json(newScore);
    } catch (error) {
        console.error('保存分数失败:', error);
        res.status(500).json({ error: '保存分数失败', details: error.message });
    }
});

// 获取玩家最佳分数
app.get('/api/scores/:name', async (req, res) => {
    try {
        console.log('正在获取玩家最佳分数:', req.params.name);
        const playerScores = await Score.find({ name: req.params.name })
            .sort({ score: -1 })
            .limit(1);
        console.log('玩家最佳分数:', playerScores[0] || '无记录');
        res.json(playerScores[0] || null);
    } catch (error) {
        console.error('获取玩家分数失败:', error);
        res.status(500).json({ error: '服务器错误', details: error.message });
    }
});

// 处理未找到的路由
app.use((req, res) => {
    console.log('404 - 未找到路由:', req.url);
    res.status(404).json({ error: '未找到请求的资源' });
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${port}`);
    console.log('环境变量:', {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? '已设置' : '未设置'
    });
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，准备关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        mongoose.connection.close(false, () => {
            console.log('MongoDB 连接已关闭');
            process.exit(0);
        });
    });
}); 