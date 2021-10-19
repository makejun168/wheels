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
        // 存放切片目录
        let chunkDir = `${UPLOAD_DIR}/${chunk.originalFilename.split('.')[0]}`;

        if (!fse.pathExistsSync(chunkDir)) {
            await fse.mkdirs(chunkDir);
        }

        // 原文件名称.index.ext
        const dPath = path.join(chunkDir, chunk.originalFilename.split('.')[1]);

        await fse.move(chunk.path, dPath, {overwrite: true});

        res.send('文件上传成功');
    })
})

// 上传以后合并 merge
app.post('/merge', async function (req, res) {
    let name = req.body.name;
    let fname = name.split('.')[0];

    let chunkDir = path.join(UPLOAD_DIR, fname);
    let chunks = await fse.readdir(chunkDir);

    // 分片排序 然后进行 append
    chunks.sort((a,b) => a-b).map(chunkPath => {
        fs.appendFileSync(
            path.join(UPLOAD_DIR, name),
            fs.readFileSync(`${chunkDir}/${chunkPath}`)
        )
        // 保存文件
    })

    fse.remove(chunkDir); // 删除分片
    res.send({msg: 'Success', url: `http://localhost:3000/upload/${name}`}); // 返回地址
})

app.listen(3000)

console.log('listen: 3000')