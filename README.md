# 重力鸟 (Gravity Bird)

一个有趣的HTML5游戏，玩家通过控制重力方向来收集金币并躲避障碍。

## 部署指南

### 1. 前端部署 (Netlify)

1. Fork 这个仓库到你的 GitHub 账号
2. 登录 [Netlify](https://www.netlify.com/)
3. 点击 "New site from Git"
4. 选择你的 GitHub 仓库
5. 部署设置：
   - Build command: 留空
   - Publish directory: client
   - Advanced build settings: 无需更改

### 2. 后端部署 (MongoDB Atlas)

1. 创建 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 账号
2. 创建新集群（选择免费层级）
3. 在 "Database Access" 创建数据库用户
4. 在 "Network Access" 添加 IP 地址 `0.0.0.0/0`
5. 获取数据库连接字符串

### 3. 环境配置

在 Netlify 的站点设置中添加以下环境变量：
- `MONGODB_URI`: 你的 MongoDB 连接字符串

## 本地开发

1. 克隆仓库：
```bash
git clone https://github.com/你的用户名/gravity-bird.git
cd gravity-bird
```

2. 安装依赖：
```bash
cd server
npm install
```

3. 创建 `.env` 文件：
```
MONGODB_URI=你的MongoDB连接字符串
PORT=3000
```

4. 启动服务器：
```bash
npm start
```

5. 在浏览器中打开 `client/index.html`

## 游戏特点

- 独特的重力翻转机制
- 金币收集和等级系统
- 炫酷的视觉效果
- 在线排行榜
- 完全响应式设计，支持移动设备

## 游戏玩法

1. 点击屏幕或按空格键来切换重力方向
2. 收集金币来升级（每5个金币升一级）
3. 等级提升会降低重力影响，让控制更容易
4. 躲避绿色管道
5. 尽可能获得高分！

## 技术特点

- 纯原生JavaScript编写
- 使用HTML5 Canvas进行游戏渲染
- 本地存储实现排行榜功能
- 响应式设计适配各种设备

## 如何部署

1. 将所有文件上传到网站服务器
2. 确保服务器支持静态文件托管
3. 访问index.html即可开始游戏

### 文件结构

```
├── index.html    // 游戏主页面
├── style.css     // 样式表
├── game.js       // 游戏逻辑
└── README.md     // 说明文档
```

## 开发者模式

游戏包含两个测试模式快捷键：
- T键：快速获得金币和升级
- I键：切换无敌模式

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License 