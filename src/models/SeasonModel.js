const { Schema, model } = require('mongoose')

const sesaonSchema = new Schema({
    air_date: { type: String },
    episode_count: { type: Number },
    tmdb_id: { type: Number },
    tmdb_serie_id: { type: Number },
    serie_id: { type: String },
    season_name: { type: String},
    overview: { type: String },
    poster_path: { type: String, required: true },
    season_number: { type: Number, required: true },
    images: { type: Object },
    episodes: { type: Array },
    title: { type: String },
    original_title: { type: String },
    tagline: { type: String },
    year: { type: Number },
    certification: { type: String },
    genres: { type: Array },
    genre_ids: { type: Array }
}, { timestamps: {} })

module.exports = model('Season', sesaonSchema);
