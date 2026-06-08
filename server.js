const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

// User Schema
const UserSchema = new mongoose.Schema({
  piUserId: { type: String, unique: true },
  username: String,
  points: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze Pioneer' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  lastLoginDate: String,
  watchCountToday: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Video Schema
const VideoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: String,
  thumbnail: String,
  caption: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', VideoSchema);

// Cloudflare R2 (S3-compatible)
const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY,
  region: 'auto',
  signatureVersion: 'v4'
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.R2_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `videos/${Date.now()}_${file.originalname}`);
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only videos allowed'), false);
  }
});

// Auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.post('/api/auth/pi', async (req, res) => {
  const { piUserId, username } = req.body;
  try {
    let user = await User.findOne({ piUserId });
    if (!user) {
      user = new User({ piUserId, username: username || `Pioneer_${piUserId.slice(-4)}` });
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, points: user.points, level: user.level } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/videos/upload', auth, upload.single('video'), async (req, res) => {
  try {
    const videoUrl = req.file.location;
    const newVideo = new Video({
      userId: req.user._id,
      url: videoUrl,
      thumbnail: videoUrl.replace('.mp4', '.jpg'),
      caption: req.body.caption || '',
    });
    await newVideo.save();
    req.user.videos.push(newVideo._id);
    req.user.points += 20;
    await req.user.save();
    res.json({ video: newVideo, points: req.user.points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/videos/feed', auth, async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).limit(30).populate('userId', 'username level');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/videos/:videoId/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video.likes.includes(req.user._id)) {
      video.likes.push(req.user._id);
      await video.save();
      req.user.points += 1;
      await req.user.save();
      res.json({ likes: video.likes.length, points: req.user.points });
    } else {
      res.json({ message: 'Already liked', likes: video.likes.length });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/videos/:videoId/watch', auth, async (req, res) => {
  const today = new Date().toDateString();
  if (req.user.lastLoginDate !== today) {
    req.user.lastLoginDate = today;
    req.user.points += 15;
    req.user.watchCountToday = 0;
  }
  req.user.watchCountToday += 1;
  if (req.user.watchCountToday <= 50) {
    req.user.points += 1;
  }
  await req.user.save();
  const showAd = (req.user.watchCountToday % 10 === 0);
  res.json({ points: req.user.points, showAd });
});

app.post('/api/redeem', auth, async (req, res) => {
  if (req.user.points < 500) return res.status(400).json({ error: 'Need at least 500 points' });
  if (req.user.videos.length < 3) return res.status(400).json({ error: 'Need at least 3 videos' });
  const piAmount = (req.user.points / 1000).toFixed(2);
  req.user.points = 0;
  await req.user.save();
  res.json({ success: true, piAmount, message: `Redeemed ${piAmount} Pi` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
