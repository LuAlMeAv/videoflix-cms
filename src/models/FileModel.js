const { Schema, model } = require('mongoose')

const fileSchema = new Schema({
    // fieldname: 'video',
    originalname: { type: String }, // 'GrabaciÃ³n de pantalla desde 05-11-23 14:32:54.webm' 
    // encoding: '7bit',
    mimetype: { type: String }, //'video/webm'
    // destination: '/media/alberto/Sources/Developer/upload-files-backed/src/uploads/video/movie',
    filename: { type: String }, // 'juego_de_gemelas_5-1998-movie'
    // path: { type: String }, // '/media/alberto/Sources/Developer/upload-files-backed/src/uploads/video/movie/juego_de_gemelas_5-1998-movie'
    relative_path: { type: String }, // '../../uploads/video/movie/juego_de_gemelas_5-1998-movie'
    size: { type: Number }// 1139564
}, { timestamps: {} })

module.exports = model('File', fileSchema);
