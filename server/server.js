require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gravity-bird', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB 连接成功！'))
.catch(err => console.error('MongoDB 连接错误:', err));

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

// API路由
// 获取排行榜
app.get('/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .exec();
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: '获取排行榜失败' });
    }
});

// 提交新分数
app.post('/scores', async (req, res) => {
    try {
        const newScore = new Score(req.body);
        await newScore.save();
        res.status(201).json(newScore);
    } catch (error) {
        res.status(500).json({ error: '保存分数失败' });
    }
});

// 获取玩家最佳分数
app.get('/api/scores/:name', async (req, res) => {
    try {
        const playerScores = await Score.find({ name: req.params.name })
            .sort({ score: -1 })
            .limit(1);
        res.json(playerScores[0] || null);
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
}); 