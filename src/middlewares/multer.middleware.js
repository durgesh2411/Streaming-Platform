import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp on Vercel, ./public/temp locally
    const dest = "./public/temp";
    cb(null, dest);
  },
  filename: function (req, file, cb){
     // intially use original name, can be changed later
    // cb(null, Date.now() + '-' + file.originalname);
    // or use a better way if user multiple file with same name timestamp to avoid conflicts
    cb(null, file.originalname);
  },
});

export const upload = multer({storage,});
