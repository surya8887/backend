import { Request } from "express";
import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, file.originalname); 
  }
});

export const upload = multer({ storage });
