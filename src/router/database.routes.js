const router = require('express').Router()
const Movie = require('../models/MovieModel')
const Serie = require('../models/SerieModel')
const Season = require('../models/SeasonModel')
const Episode = require('../models/EpisodeModel')
const File = require('../models/FileModel')

const ModelList = {
    'file': File,
    'movie': Movie,
    'serie': Serie,
    'season': Season,
    'episode': Episode
}
const textModel = {
    'serie': 'La serie',
    'movie': 'La película',
    'season': 'La temporada',
    'episode': 'El episodio'
}

const catchError = (res, error) => {
    console.error(error)
    res.status(500).json({ resStatus: 'error', message: 'Error al procesar la solicitud', _error: error })
}

//////////-----  POST  -----\\\\\\\\\\
router.post('/db/new/:Model', async (req, res) => {
    const Model = req.params.Model;
    const data = req.body;

    try {
        const element = await ModelList[Model].findOne({ unique_title: data.unique_title })

        if (element) {
            return res.status(409).json({ resStatus: 'warning', message: `${textModel[Model]} ya existe.` })
        }

        const newElement = new ModelList[Model](data)

        await newElement.save()
            .then(response => {
                res.status(201).json({ resStatus: 'success', message: `${textModel[Model]} se guardo correctamente.`, _res: response })
            })
            .catch(err => {
                if (err.message) {
                    return res.status(409).json({ resStatus: 'error', message: err.message, _consult_error: err })
                }

                res.status(500).json({ resStatus: 'error', message: 'Error al intentar guardar el elemento.', _save_error: err })
            })

    } catch (error) {
        catchError(res, error)
    }
})

//////////-----  GET  -----\\\\\\\\\\
// get all data
router.get('/db/all/:model', async (req, res) => {
    const Model = req.params.model

    const Models = {
        'files': File,
        'movies': Movie,
        'series': Serie,
        'seasons': Season,
        'episodes': Episode
    }

    try {
        await Models[Model].find({})
            .then(response => res.json(response))
            .catch(err => res.json(err))

    } catch (error) {
        catchError(res, error)
    }
})
// get element by unique_title
router.get('/db/:Model/t/:unique_title', async (req, res) => {
    const Model = req.params.Model
    const unique_title = req.params.unique_title

    try {
        await ModelList[Model].findOne({ unique_title })
            .then(response => {
                if (!response) {
                    return res.status(404).json({ resStatus: 'error', message: `${textModel[Model]} no existe` })
                }
                res.json({ resStatus: 'success', message: `${textModel[Model]} se encontro`, element: response })
            })
            .catch(err => res.status(409).json({ resStatus: 'error', message: `${textModel[Model]} no se pudo encontrar`, _find_error: err }))

    } catch (error) {
        catchError(res, error)
    }
})
// get element by id
router.get('/db/:model/:id', async (req, res) => {
    const Model = req.params.model
    const element_id = req.params.id

    try {
        await ModelList[Model].findById(element_id)
            .then(response => {
                if (!response) {
                    return res.status(404).json({ resStatus: 'error', message: `${textModel[Model]} no existe` })
                }
                res.json({ resStatus: 'success', message: `${textModel[Model]} se encontro`, element: response })
            })
            .catch(err => res.status(409).json({ resStatus: 'error', message: `${textModel[Model]} no se pudo encontrar`, _find_error: err }))

    } catch (error) {
        catchError(res, error)
    }
})

//////////-----  PUT  -----\\\\\\\\\\
router.put('/db/:model/:id', async (req, res) => {
    const Model = req.params.model
    const element_id = req.params.id
    const newData = req.body

    try {
        await ModelList[Model].findByIdAndUpdate(element_id, { "$set": newData })
            .then(response => {
                if (!response) {
                    return res.status(404).json({ resStatus: 'error', message: `${textModel[Model]} no existe` })
                }
                res.json({ resStatus: 'success', message: `${textModel[Model]} se actualizo` })
            })
            .catch(err => res.status(409).json({ resStatus: 'error', message: `${textModel[Model]} no se pudo actualizar`, _update_error: err }))

    } catch (error) {
        catchError(res, error)
    }
})

//////////-----  DELETE  -----\\\\\\\\\\
router.delete('/db/:model/:id', async (req, res) => {
    const Model = req.params.model
    const element_id = req.params.id

    try {
        await ModelList[Model].findByIdAndDelete(element_id)
            .then(response => {
                if (!response) {
                    return res.status(404).json({ resStatus: 'error', message: `${textModel[Model]} no existe` })
                }
                res.json({ resStatus: 'success', message: `${textModel[Model]} se elimino` })
            })
            .catch(err => res.status(409).json({ resStatus: 'error', message: `${textModel[Model]} no se pudo eliminar`, _delete_error: err }))

    } catch (error) {
        catchError(res, error)
    }
})

module.exports = router;