const router = require('express').Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const File = require('../models/FileModel')

// MULTER upload function
const uploadFile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            // video/image
            const fileType = file.mimetype.split('/')[0]
            // video/poster/backdrop
            const file_type = req.params.file_type

            // ../../uploads/images/backdrops/ || ../../uploads/videos/
            const relativePath = `../../uploads/${fileType}s/${file_type === 'video' ? '' : file_type + 's/'}`

            cb(null, path.join(__dirname + relativePath))

            req.relative_path = relativePath
        },
        filename: (req, file, cb) => cb(null, req.params.filename)
    })
}).single('file')

const catchError = (res, error) => {
    console.error(error)
    res.status(500).json({ resStatus: 'error', message: 'Error al procesar la solicitud', _error: error })
}

//////////-----  POST  -----\\\\\\\\\\
router.post('/file/upload/:file_type/:filename', async (req, res) => {
    if (req.params.filename === 'undefined') {
        return res.json({ resStatus: "error", message: "El nombre del archivo no es válido" })
    }

    uploadFile(req, res, (err) => {
        if (req.file === undefined) {
            return res.json({ resStatus: "warning", message: "No hay ningun archivo por almacenar" })
        } else if (err instanceof multer.MulterError) {
            return res.json({ _em: err, resStatus: "error", message: "A Multer error occurred when uploading." })
        } else if (err) {
            return res.json({ _e: err, resStatus: "error", message: "An unknown error occurred when uploading." })
        }

        const file = new File({ ...req.file, relative_path: req.relative_path })

        // Save to Database
        file.save()
            .then(response => {
                res.status(201).json({ resStatus: 'success', message: 'El archivo fue guardado', _res: response })
            })
            .catch(err => {
                console.error(res, err)
                res.status(201).json({ resStatus: 'error', message: 'El al guardar el archivo', _file_save_db_error: err })
            })
    })
})

//////////-----  GET  -----\\\\\\\\\\
// GET Element by ID
router.get('/file/:id', async (req, res) => {
    try {
        const file_obj = await File.findById(req.params.id)

        if (!file_obj) {
            return res.status(404).json({ resStatus: "error", message: "Archivo no encontrado" })
        }

        const filePath = path.join(__dirname + file_obj.relative_path + file_obj.filename)

        fs.stat(filePath, (err, stat) => {
            if (stat) {
                return res.type(file_obj.mimetype.split('/')[1]).sendFile(filePath)
            }
        })


    } catch (error) {
        catchError(res, error)
    }
})
// GET if an file is on system
router.get('/file/online/:id', async (req, res) => {
    try {
        const fileData = await File.findById(req.params.id)

        if (!fileData) {
            return res.status(404).json({ resStatus: "error", message: "Elemento no encontrado", online: false })
        }

        fs.stat(path.join(__dirname + fileData.relative_path + '/' + fileData.filename), async (err, stats) => {
            if (err) {
                return fileData.deleteOne()
            }

            res.json({ resStatus: "success", message: "Archivo en linea" })
        })
    } catch (error) {
        catchError(res, error)
    }
})

//////////-----  PUT  -----\\\\\\\\\\
router.put('/file/:id', async (req, res) => {
    const file_id = req.params.id
    const new_name = req.body.unique_title

    if (!new_name) {
        return res.json({ resStatus: 'error', message: 'El nombre del archivo no es valido' })
    }

    try {
        const file_obj = await File.findById(file_id)

        if (!file_obj) {
            return res.json({ resStatus: 'error', message: 'El elemento no fue encontrado' })
        }

        if (file_obj.filename === new_name) {
            return res.json({ resStatus: 'success', message: 'No se efectuaron cambios en el nombre del archivo' })
        }

        const old_path = path.join(__dirname + file_obj.relative_path + file_obj.filename)
        const new_path = path.join(__dirname + file_obj.relative_path + new_name)

        fs.rename(old_path, new_path, (err) => {
            if (err) {
                return res.json({ resStatus: 'error', message: 'El archivo no existe en la ruta proporcionada', _update_file_error: err })
            }

            file_obj.filename = new_name

            file_obj.save()
                .then(element => {
                    res.json({ resStatus: 'success', message: 'Se actualizo el nombre del archivo' })
                })
                .catch(err => res.json({ resStatus: 'error', message: 'No fue posible actualizar los datos', _update_obj_error: err }))
        })
    } catch (error) {
        catchError(res, error)
    }
})

//////////-----  DELETE  -----\\\\\\\\\\
router.delete('/file/:id', async (req, res) => {
    const element_id = req.params.id

    try {
        const file_obj = await File.findById(element_id)

        if (!file_obj) {
            return res.status(404).json({ resStatus: "error", message: "Elemento no encontrado" })
        }

        const file_path = path.join(__dirname + file_obj.relative_path + file_obj.filename)

        fs.rm(file_path, {}, (err) => {
            file_obj.deleteOne()

            if (err) {
                return res.json({ resStatus: 'error', message: 'El archivo no existe en la ruta proporcionada', _delete_file_error: err })
            }
        })

        res.json({ resStatus: 'success', message: 'El archivo fue eliminado' })
    } catch (error) {
        catchError(res, error)
    }
})

module.exports = router;

// rsync -av -e ssh --exclude='node_modules/' upload-files-backed/ lmed@192.168.1.222:/home/lmed/backend_server