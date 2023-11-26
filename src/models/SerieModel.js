const { Schema, model } = require('mongoose')

const serieSchema = new Schema({
    backdrop_path: { type: String, required: true },
    clear_title: { type: String },
    genre_ids: { type: Array },
    tmdb_id: { type: Number },
    original_name: { type: String },
    overview: { type: String },
    poster_path: { type: String, required: true },
    first_air_date: { type: String },
    title: { type: String, required: true },
    original_title: { type: String },
    created_by: { type: Array },
    genres: { type: Array },
    in_production: { type: Boolean },
    last_air_date: { type: String },
    number_of_episodes: { type: Number },
    number_of_seasons: { type: Number },
    seasons: { type: Array },
    status: { type: String },
    tagline: { type: String },
    images: { type: Object },
    certification: { type: String },
    alternative_titles: { type: Array },
    year: { type: String },
    isSerie: { type: Boolean, default: true }
}, { timestamps: {} })

module.exports = model('Serie', serieSchema);
