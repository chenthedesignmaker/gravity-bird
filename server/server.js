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
});

// 定义分数模型
const Score = mongoose.model('Score', {
    name: String,
    score: Number,
    level: Number,
    coins: Number,
    date: { type: Date, default: Date.now }
});

// API路由
// 获取前100名最高分
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(100);
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 提交新分数
app.post('/api/scores', async (req, res) => {
    try {
        const { name, score, level, coins } = req.body;
        const newScore = new Score({ name, score, level, coins });
        await newScore.save();
        res.status(201).json(newScore);
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
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