const { Schema, model } = require("mongoose");

const movieSchema = new Schema({
    alternative_titles: { type: Array },
    backdrop_path: { type: String, required: true },
    belongs_to_collection: { type: Object },
    certification: { type: String },
    clear_title: { type: String },
    duration: { type: String },
    genres: { type: Array },
    genre_ids: { type: Array, required: true },
    tmdb_id: { type: Number },
    images: { type: Object },
    imdb_id: { type: String },
    original_title: { type: String },
    overview: { type: String },
    poster_path: { type: String, required: true },
    release_date: { type: String },
    runtime: { type: Number },
    status: { type: String },
    tagline: { type: String },
    title: { type: String, required: true },
    video_duration: { type: Number },
    video_end: { type: Number },
    video_path: { type: String },
    year: { type: String },
    isSerie: { type: Boolean, default: false }
}, { timestamps: {} })

module.exports = model('Movie', movieSchema);
