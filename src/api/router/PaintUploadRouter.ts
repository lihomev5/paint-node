import express, { Request, Response } from "express"
import multer from "multer"
import path from "path"
import axios from "axios";
import fs from 'fs'

// 约定XxApi 必须export routePath 和 router
export const routePath = "/"
export const router = express.Router()

const UPLOAD_DIR = process.env.UPLOAD_DIR
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR
const DOWNLOAD_BASE_URL = process.env.DOWNLOAD_BASE_URL
const CONVERT_BASE_URL = process.env.CONVERT_BASE_URL

// 配置 Multer 中间件，指定上传文件的目录和文件名生成规则
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // 指定上传文件的目录
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // 生成唯一的文件名
    },
});
const upload = multer({ storage });

// 设置路由处理文件上传
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
    // res.send("File uploaded successfully.");
    const uploadedFileName = req.file.filename;
    console.log('uploadedFileName', uploadedFileName)


    const srcFile = UPLOAD_DIR + uploadedFileName
    const dstFile = DOWNLOAD_DIR + uploadedFileName
    await axios.post(CONVERT_BASE_URL + '/convert', {
        srcFile,
        dstFile,
    }).catch((err) => {
        console.log('err:', err)
    })
    
    if (!fs.existsSync(dstFile)) {
        res.status(404).send("File not found.");
        return
    }
   

    res.json({
        success: true,
        data: {
            url: DOWNLOAD_BASE_URL + uploadedFileName
        },
    })

});

// 设置路由处理文件下载
router.get("/static/:fileName", (req: Request, res: Response) => {
    const fileName = req.params.fileName;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    const ext = path.extname(fileName);
    console.log('filePath', filePath)
    
    const ext2contextType = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
    } as Record<string, string>
    const contextType = ext2contextType[ext]
    if (!contextType) {
        res.status(404).send("File extension invalid.");
        return
    }

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", contextType);

        // 创建可读流并将文件流式传输到响应
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send("File not found.");
    }
});