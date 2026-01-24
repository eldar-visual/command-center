const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    title: String,
    url: String,
    desc: String,
    img: String,
    time: String
});

const TopicSchema = new mongoose.Schema({
    name: String,
    links: [LinkSchema]
});

const QuickLinkSchema = new mongoose.Schema({
    title: String,
    url: String
});

const VisualFavSchema = new mongoose.Schema({
    title: String,
    url: String,
    img: String
});

const DashboardSchema = new mongoose.Schema({
    topics: [TopicSchema],
    quickPills: [QuickLinkSchema],
    visualFavs: [VisualFavSchema]
});

// אנחנו נשמור מסמך יחיד עבור המשתמש (Singleton)
module.exports = mongoose.model('DashboardData', DashboardSchema);