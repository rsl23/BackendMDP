import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // <--- ADD THIS IMPORT

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // <--- ADD THESE TWO LINES

// Simpan file di folder sementara
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the absolute path for the uploads directory
    // Now __dirname is defined
    const uploadDir = path.resolve(__dirname, '..', 'uploads'); // Adjusted path based on your common setup

    // Check if the directory exists, and create it if it doesn't
    if (!fs.existsSync(uploadDir)) {
      console.log(`Creating upload directory: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir); // Set the destination folder to the absolute path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;