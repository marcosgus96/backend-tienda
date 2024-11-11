// src/config/multer.config.ts
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // Carpeta donde se guardarán las imágenes
    filename: (req, file, cb) => {
      // Generar un nombre de archivo único
      const randomName = uuidv4();
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Validar el tipo de archivo
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      // Aceptar sólo imágenes
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado'), false);
    }
  },
};
