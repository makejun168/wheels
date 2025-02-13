const express = require('express')
const bodyParse = require('body-parser')
const mulitiparty = require('multiparty')
const fse = require('fs-extra')
const path = require("path");
const fs = require('fs')

const app = express();

app.use(express.static(__dirname + '/public'))

app.use(bodyParse.urlencoded({extended: true}))
app.use(bodyParse.json())

const UPLOAD_DIR = path.resolve(__dirname, 'public/upload')

// 上传分片处理
app.post('/upload', function (req, res) {
    const form = new mulitiparty.Form({uploadDir: 'temp'}); // 定义form

    form.parse(req);

    form.on('file', async (name, chunk) => {
        try {
            // 存放切片目录
            let chunkDir = `${UPLOAD_DIR}/${chunk.originalFilename.split('.')[0]}`;

            if (!fse.pathExistsSync(chunkDir)) {
                await fse.mkdirs(chunkDir);
            }

            // 原文件名称.index.ext
            const dPath = path.join(chunkDir, chunk.originalFilename.split('.')[1]);

            await fse.move(chunk.path, dPath, {overwrite: true});

            res.send('文件上传成功');
        } catch (error) {
            console.error('文件上传出错:', error);
            res.status(500).send('文件上传失败');
        }
    })

    form.on('error', (err) => {
        console.error('表单解析出错:', err);
        res.status(500).send('表单解析失败');
    });
})

// 上传以后合并 merge
app.post('/merge', async function (req, res) {
    try {
        let name = req.body.name;
        let fname = name.split('.')[0];
        let chunkDir = path.join(UPLOAD_DIR, fname);
        let chunks = await fse.readdir(chunkDir);
        chunks.sort((a, b) => a - b).forEach(chunkPath => {
            fs.appendFileSync(
                path.join(UPLOAD_DIR, name),
                fs.readFileSync(`${chunkDir}/${chunkPath}`)
            );
        });
        await fse.remove(chunkDir); // 删除分片
        res.send({ msg: 'Success', url: `http://localhost:3000/upload/${name}` });
    } catch (error) {
        console.error('文件合并出错:', error);
        res.status(500).send('文件合并失败');
    }
})

app.listen(3000)

console.log('listen: 3000')