const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Config
const destinationPath = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({ destination: destinationPath, filename: (req, file, cb) => cb(null, `${uuidv4()}.${file.mimetype.split('/')[1]}`) });
const middleware = multer({ storage: storage });

// Functions
const deleteFile = async (file) => {
    try {
        await fs.unlinkSync(path.join(destinationPath, file));
        return true;
    } catch (error) {
        console.error('❌', error);
        return false;
    }
};

const deleteFiles = async (files) => {
    try {
        for (let file of files) {
            await deleteFile(file);
        }
        return true;
    } catch (error) {
        console.error('❌', error);
        return false;
    }
};

const deleteFilesFromRequest = async (files) => {
    try {
        for (let file of files) {
            await deleteFile(file.filename);
        }
        return true;
    } catch (error) {
        console.error('❌', error);
        return false;
    }
};

const verifyFile = (filename, options = { allowedExtensions: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'], maxSize: 1024 * 1024 * 5 }) => {
    try {
        const extension = filename.split('.')[1];
        if (!options.allowedExtensions.includes(extension)) return false;

        const stats = fs.statSync(path.join(destinationPath, filename));
        const fileSizeInBytes = stats.size;
        if (fileSizeInBytes > options.maxSize) return false;

        return true;
    } catch (error) {
        console.error('❌', error);
        return false;
    }
};

module.exports = {
    deleteFile,
    deleteFiles,
    deleteFilesFromRequest,
    middleware,
    verifyFile
};
