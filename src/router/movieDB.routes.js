const router = require('express').Router()

const Movie = require('../models/MovieModel')
const Serie = require('../models/SerieModel')
const Season = require('../models/SeasonModel')
const Episode = require('../models/EpisodeModel')
const File = require('../models/FileModel')

// this function are nedd a middelware simily to verifytoken
const clearTitle = (title) => {
    if (!title) {
        return false
    }

    const title_clear_accents = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const title_clear_symbols = title_clear_accents.replace(/[^a-zA-Z0-9 ]/g, '')
    const title_clear_spaces = title_clear_symbols.replaceAll(" ", "")

    return title_clear_spaces.toLowerCase()
}

//////////-----  POST  -----\\\\\\\\\\
router.post('/movie', async (req, res) => {
    try {
        const clear_title = clearTitle(req.body.title)

        if (!clear_title) {
            return res.status(409).json({ resStatus: "error", message: "El titulo es un campo requerido" })
        }

        const exist = await Movie.findOne({ clear_title })

        if (exist) {
            return res.status(409).json({ resStatus: "warning", message: "Esta película ya fue guardada" })
        }

        const data = { ...req.body, tmdb_id: req.body.id, clear_title }
        delete data.id

        const movie = new Movie(data)

        await movie.save()
            .then(r => res.status(201).json({ _r: r, resStatus: "success", message: "Se han guardado los datos de la película" }))
            .catch(e => res.json({ _e: e, resStatus: "error", message: e.message || "Ha ocurrido un error al guardar los datos" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.post('/tv', async (req, res) => {
    try {
        const clear_title = clearTitle(req.body.title)

        if (!clear_title) {
            return res.status(409).json({ resStatus: "error", message: "El titulo es un campo requerido" })
        }

        const exist = await Serie.findOne({ clear_title })

        if (exist) {
            return res.status(409).json({ resStatus: "warning", message: "Esta serie ya fue guardada" })
        }

        const data = { ...req.body, tmdb_id: req.body.id, seasons: [], clear_title }
        delete data.id

        const serie = new Serie(data)

        await serie.save()
            .then(r => res.status(201).json({ _r: r, resStatus: "success", message: "Se han guardado los datos de la serie" }))
            .catch(e => res.json({ _e: e, resStatus: "error", message: e.message || "Ha ocurrido un error al guardar los datos" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.post('/tv/season/:serie_id', async (req, res) => {
    try {
        const serie = await Serie.findById(req.params.serie_id)

        if (!serie) {
            return res.status(404).json({ resStatus: "error", message: "Serie no encontrada, debes guardarla primero" })
        }

        const exist = serie.seasons.filter(s => s.season === req.body.season_number * 1)

        if (exist.length > 0) {
            return res.status(409).json({ resStatus: "warning", message: "Esta temporada ya fue creada" })
        }

        const data = { ...req.body, tmdb_id: req.body.id, tmdb_serie_id: serie.tmdb_id, serie_id: serie._id, episodes: [] }
        delete data.id

        const season = new Season(data)

        await season.save()
            .then(async (r) => {
                serie.seasons.push({ season: r.season_number, id: r._id })

                await serie.save()
                    .then(() => res.json({ _r: r, resStatus: "success", message: "Temporada agregada a la serie" }))
                    .catch(e => res.json({ _e: e, resStatus: "error", message: e.message || "Ha ocurrido un error al guardar los datos en la serie" }))
            })
            .catch(e => res.json({ _e: e, resStatus: "error", message: e.message || "Ha ocurrido un error al guardar los datos en la temporada" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.post('/tv/episode/:season_id', async (req, res) => {
    try {
        const season = await Season.findById(req.params.season_id)

        if (!season) {
            return res.status(404).json({ resStatus: "error", message: "Temporada no encontrada, debes crearla primero" })
        }

        const exist = season.episodes.filter(e => e.episode === req.body.episode_number * 1)

        if (exist.length > 0) {
            return res.status(409).json({ resStatus: "warning", message: "Este episodio ya fue creado" })
        }

        const data = { ...req.body, tmdb_id: req.body.show_id, season_id: req.params.season_id, serie_id: season.serie_id }
        delete data.id

        const episode = new Episode(data)

        await episode.save()
            .then(r => {
                season.episodes.push({ episode: r.episode_number, id: r._id })

                season.save()
                    .then(() => res.json({ _r: r, resStatus: "success", message: "Episodio agregado a la temporada" }))
                    .catch(e => res.status(502).json({ _e: e, resStatus: "error", message: e.message || "Ha ocurrido un error al guardar los datos" }))
            })
            .catch(e => res.status(502).json({ _e: e, resStatus: "error", message: e.message || "Ha ocurrido un error al guardar los datos" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
//////////-----  PUT  -----\\\\\\\\\\
router.put('/movie/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)

        if (!movie) {
            return res.json({ resStatus: "error", message: "Película no encontrada" })
        }

        await Movie.findByIdAndUpdate(req.params.id, { "$set": req.body })
            .then(() => res.json({ resStatus: "success", message: "La película ha sido actualizada" }))
            .catch(e => res.json({ _e: e, resStatus: "error", message: "Error al intentar actualizar la película" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "La slicitud no se ha procesado" })
    }
})
router.put('/tv/:id', async (req, res) => {
    try {
        const serie = await Serie.findById(req.params.id)

        if (!serie) {
            return res.json({ resStatus: "error", message: "Serie no encontrada" })
        }

        await Serie.findByIdAndUpdate(req.params.id, { "$set": req.body })
            .then(() => res.json({ resStatus: "success", message: "La serie ha sido actualizada" }))
            .catch(e => res.json({ _e: e, resStatus: "error", message: "Error al intentar actualizar la serie" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "La slicitud no se ha procesado" })
    }
})
router.put('/tv/season/:id', async (req, res) => {
    try {
        const season = await Season.findById(req.params.id)

        if (!season) {
            return res.json({ resStatus: "error", message: "Temporada no encontrada" })
        }

        await Season.findByIdAndUpdate(req.params.id, { "$set": req.body })
            .then(() => res.json({ resStatus: "success", message: "La temporada ha sido actualizada" }))
            .catch(e => res.json({ _e: e, resStatus: "error", message: "Error al intentar actualizar la temporada" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "La slicitud no se ha procesado" })
    }
})
router.put('/tv/episode/:id', async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.id)

        if (!episode) {
            return res.json({ resStatus: "error", message: "Temporada no encontrada" })
        }

        await Episode.findByIdAndUpdate(req.params.id, { "$set": req.body })
            .then(() => res.json({ resStatus: "success", message: "El episodio ha sido actualizada" }))
            .catch(e => res.json({ _e: e, resStatus: "error", message: "Error al intentar actualizar el episodio" }))
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "La slicitud no se ha procesado" })
    }
})

//////////-----  GET  -----\\\\\\\\\\
// GET ELEMENT DATA BY NAME
router.get('/tv/t/:title', async (req, res) => {
    try {
        const clear_title = clearTitle(req.params.title)

        const serie = await Serie.findOne({ clear_title })

        if (!serie) {
            return res.status(404).json({ resStatus: "error", message: "Serie no encontrada, debes guardarla primero" })
        }

        res.json({ _r: serie, resStatus: "success", message: "Serie encontrada" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.get('/movie/t/:title', async (req, res) => {
    try {
        const clear_title = clearTitle(req.params.title)

        const movie = await Movie.findOne({ clear_title })

        if (!movie) {
            return res.status(404).json({ resStatus: "error", message: "Película no encontrada" })
        }

        res.json({ _r: movie, resStatus: "success", message: "Película encontrada" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
// GET ELEMENT DATA BY ID
router.get('/movie/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)

        if (!movie) {
            return res.status(404).json({ resStatus: "error", message: "Película no encontrada" })
        }

        res.json({ _r: movie, resStatus: "success", message: "Película encontrada" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.get('/tv/:id', async (req, res) => {
    try {
        const serie = await Serie.findById(req.params.id)

        if (!serie) {
            return res.status(404).json({ resStatus: "error", message: "Serie no encontrada" })
        }

        res.json({ _r: serie, resStatus: "success", message: "Serie encontrada" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.get('/tv/season/:serie_id', async (req, res) => {
    try {
        const season = await Season.findById(req.params.serie_id)

        if (!season) {
            return res.status(404).json({ resStatus: "error", message: "Temporada no encontrada" })
        }

        res.json({ _r: season, resStatus: "success", message: "Temporada encontrada" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})
router.get('/tv/episode/:season_id', async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.season_id)

        if (!episode) {
            return res.status(404).json({ resStatus: "error", message: "Episodio no encontrado" })
        }

        res.json({ _r: episode, resStatus: "success", message: "Episodio encontrado" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ _e: error, resStatus: "error", message: "Error al ejecutar la acción" })
    }
})

//////////-----  DELETE  -----\\\\\\\\\\
router.delete('/movie/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
        if (!movie) {
            return res.status(404).json({ resStatus: 'error', message: "Película no encontrada" })
        }

        Movie.findByIdAndDelete(req.params.id)
            .then(r => {
                res.json({ resStatus: 'success', message: "Se ha eliminado la película: " + r.title })
            })
            .catch(err => {
                res.json({ _e: err, resStatus: 'error', message: "Se ha producido un error al eliminar la película" })
                console.error(err)
            })
    } catch (err) {
        console.error(err)
        res.json({ _e: err, resStatus: 'error', message: "Error al procesar la solicitud" })
    }
})
router.delete('/db/movie/:id', (req, res) => {
    File.findByIdAndDelete(req.params.id)
        .then(r => {
            res.json({ _res: r, resStatus: "success", message: "El elemento fue eliminado" })
        })
        .catch(err => res.json({ _error: err, resStatus: "error", message: "Error al procesar la solicitud" }))
})

// GET ALL DATA
router.get('/db/all/movies', async (req, res) => {
    const movies = await Movie.find({})
    res.json(movies)
})
router.get('/db/all/series', async (req, res) => {
    const series = await Serie.find({})
    res.json(series)
})
router.get('/db/all/seasons', async (req, res) => {
    const seasons = await Season.find({})
    res.json(seasons)
})
router.get('/db/all/episodes', async (req, res) => {
    const episodes = await Episode.find({})
    res.json(episodes)
})

module.exports = router;