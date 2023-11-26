const { Schema, model } = require('mongoose')

const episodeSchema = new Schema({
    air_date: { type: String },
    episode_number: { type: Number, require: true },
    overview: { type: String },
    season_number: { type: Number, require: true },
    crew: { type: Array },
    guest_stars: { type: Array },
    images: { type: Object },
    title: { type: String },
    original_title: { type: String },
    tagline: { type: String },
    episode_name: { type: String, require: true },
    year: { type: Number },
    certification: { type: String },
    genres: { type: Array },
    genre_ids: { type: Array },
    backdrop_path: { type: String, require: true },
    video_path: { type: String, require: true },
    duration: { type: String },
    video_duration_formated: { type: String },
    video_duration: { type: Number },
    video_end: { type: Number },
    video_start: { type: Number, default: 0 },
    video_start_intro: { type: Number, default: 0 },
    video_end_intro: { type: Number, default: 0 },
    tmdb_id: { type: Number },
    serie_id: { type: String },
    season_id: { type: String },
}, { timestamps: {} })

module.exports = model('Episode', episodeSchema);
