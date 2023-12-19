const router = require('express').Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const File = require('../models/FileModel')
const Movie = require('../models/MovieModel')
const Serie = require('../models/SerieModel')
const Season = require('../models/SeasonModel')
const Episode = require('../models/EpisodeModel')
const { API_URL } = process.env

const uploadFile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            // video/image
            const fileType = file.mimetype.split('/')[0]
            // movie/tv
            const typeElement = req.params.type_element
            // poster/backdrop
            const imageType = req.params.image_type

            // ../../uploads/images/movie/backdrop
            const relativePath = `../../uploads/${fileType}s/${typeElement}${imageType !== undefined ? '/' + imageType : ''}`

            cb(null, path.join(__dirname + relativePath))

            req.relative_path = relativePath
        },
        filename: (req, file, cb) => cb(null, req.params.filename)
    })
}).single('file')

// UPLOAD VIDEO
// Example url: /upload/video/movie/juegodegemelas1998/a1b2c3d4e5f6g7h8i9
router.post('/upload/video/:type_element/:filename/:id', async (req, res) => {
    try {
        const e_t = req.params.type_element;

        const Model = e_t === 'movie' ? Movie : Episode;

        const element = await Model.findById(req.params.id)

        if (!element) {
            return res.status(404).json({ resStatus: "error", message: e_t === 'movie' ? 'Película no encontrada' : 'Episodio no encontrado' })
        }

        uploadFile(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                res.json({ _em: err, resStatus: "error", message: "A Multer error occurred when uploading." })
            } else if (err) {
                res.json({ _e: err, resStatus: "error", message: "An unknown error occurred when uploading." })
            }

            const file = new File({ ...req.file, relative_path: req.relative_path })

            file.save()
                // If the file object is created
                .then(r => {
                    // Update the video path in the element
                    element.video_path = `${API_URL}/file/${r._id}`
                    // Update the object with the new video path
                    element.save()
                        // If the video path in the object is updated correctly
                        .then(() => res.status(201).json({ _r_video: r, resStatus: "success", message: "Video Guardado" }))
                        // If an error occurred while updating 'video_path' in the object
                        .catch(err => {
                            console.error(err)
                            res.json({ _e_video: err, resStatus: "error", message: "Error al actualizar: video_path." })
                        })
                })
                // If an error occurred while creating the 'file' object
                .catch(error => {
                    console.error(error)
                    res.json({ _e_video: err, resStatus: "error", message: "Error al guardar los datos del video" })
                })

        })
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al procesar la solicitud" })
    }
})
// UPLOAD IMAGE
// Example url: /upload/image/tv/juegodegemelas1998/poster/a1b2c3d4e5f6g7h8i9/season
router.post('/upload/image/:type_element/:filename/:image_type/:id/:model', async (req, res) => {
    try {
        const modelList = {
            'tv': Serie,
            'movie': Movie,
            'season': Season,
            'episode': Episode,
        }

        const Model = modelList[req.params.model];

        const element = await Model.findById(req.params.id)

        if (!element) {
            return res.status(404).json({ resStatus: "error", message: `No se encontro el elemento: ${modelList[req.params.model]}` })
        }

        uploadFile(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                res.json({ _em: err, resStatus: "error", message: "A Multer error occurred when uploading." })
            } else if (err) {
                res.json({ _e: err, resStatus: "error", message: "An unknown error occurred when uploading." })
            }

            const file = new File({ ...req.file, relative_path: req.relative_path })

            file.save()
                .then(r => {
                    if (req.params.image_type === 'poster') {
                        element.poster_path = `${API_URL}/file/${r._id}`
                    } else {
                        element.backdrop_path = `${API_URL}/file/${r._id}`
                    }

                    element.save()
                        .then(() => res.status(201).json({ _r_video: r, resStatus: "success", message: "Imagen Guardada" }))
                        .catch(err => {
                            console.error(err)
                            res.json({ _e_video: err, resStatus: "error", message: `Error al actualizar: ${req.params.image_type}_path en ${modelList[req.params.model]}.` })
                        })
                })
                .catch(error => {
                    console.error(error)
                    res.json({ _e_image: err, resStatus: "error", message: "Error al guardar los datos de la imagen" })
                })

        })
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al procesar la solicitud" })
    }
})

// DELETE Files
router.delete('/file/:id', async (req, res) => {
    try {
        const id = req.params.id

        const exist = await File.findById(id)

        if (!exist) {
            return res.status(404).json({ resStatus: "error", message: "Archivo no encontrado" })
        }

        const filePath = path.join(__dirname + exist.relative_path + '/' + exist.filename)

        fs.stat(filePath, (err, stats) => {
            if (err) {
                return res.status(404).json({ _error: err, resStatus: "error", message: "El archivo no esta almacenado" })
            }

            fs.unlink(filePath, (err) => {
                if (err) throw err
                
                // delete file object on database
                exist.deleteOne()

                res.json({ resStatus: "success", message: "El elemento fue eliminado" })
            })
        })
    }
    catch (e) {
        res.status(500).json({ resStatus: "error", message: "Error al procesar la solicitud" })
    }
})

router.get('/file/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id)

        if (!file) {
            res.status(404).json({ resStatus: "error", message: "Archivo no encontrado" })
        }

        const filePath = path.join(__dirname + file.relative_path + '/' + file.filename)

        res.type(file.mimetype.split('/')[1]).sendFile(filePath)

    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al procesar la solicitud" })
    }
})
router.get('/files/all', async (req, res) => {
    try {
        const files = await File.find({})
        res.json(files)
    } catch (error) {
        console.error(error)
        res.json({ _e: error, resStatus: "error", message: "Error al procesar la solicitud" })
    }
})

router.get('/online/file/:id', async (req, res) => {
    try {
        const fileData = await File.findById(req.params.id)

        if (!fileData) {
            return res.status(404).json({ resStatus: "error", message: "Objeto no encontrado" })
        }

        fs.stat(path.join(__dirname + fileData.relative_path + '/' + fileData.filename), (err, stats) => {
            if (err) {
                return res.status(404).json({ resStatus: "error", message: "Archivo no encontrado" })
            }

            res.json({ resStatus: "success", message: "Archivo en linea" })
        })
    } catch (e) {
        res.status(500).json({ resStatus: "error", message: "Error al procesar la solicitud" })
    }
})

module.exports = router;

// rsync -av -e ssh --exclude='node_modules/' upload-files-backed/ lmed@192.168.1.222:/home/lmed/backend_server