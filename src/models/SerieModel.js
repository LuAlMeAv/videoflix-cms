const { Schema, model } = require('mongoose')

const serieSchema = new Schema({
    alternative_titles: { type: Array },
    backdrop_path: { type: String, required: true },
    certification: { type: String },
    clear_title: { type: String },
    created_by: { type: Array },
    first_air_date: { type: String },
    genres: { type: Array },
    genre_ids: { type: Array },
    images: { type: Object },
    in_production: { type: Boolean },
    last_air_date: { type: String },
    number_of_episodes: { type: Number },
    number_of_seasons: { type: Number },
    online: { type: Boolean, default: false },
    original_name: { type: String },
    original_title: { type: String },
    overview: { type: String },
    poster_path: { type: String, required: true },
    seasons: { type: Array },
    status: { type: String },
    tagline: { type: String },
    title: { type: String, required: true },
    tmdb_id: { type: Number },
    unique_title: { type: String, required: true },
    year: { type: String },
}, { timestamps: {} })

module.exports = model('Serie', serieSchema);
