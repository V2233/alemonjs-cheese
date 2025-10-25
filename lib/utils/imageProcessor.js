import { readdirSync, statSync, mkdirSync, copyFileSync, createReadStream, writeFile } from 'fs';
import { join, relative, extname } from 'path';
import sharp from 'sharp';
import sizeOf from 'image-size';
import textToSvg from 'text-to-svg';
import Cfg from './config.js';

// 目标压缩大小（以字节为单位）
// const targetSize = 500 * 1024 // 500 KB
// 递归处理文件夹
function processFolder(inputFolder, outputFolder) {
    const files = readdirSync(inputFolder);
    files.forEach(file => {
        const filePath = join(inputFolder, file);
        if (statSync(filePath).isDirectory()) {
            // 如果是文件夹，则递归处理
            const subFolderOutput = join(outputFolder, relative(inputFolder, filePath));
            mkdirSync(subFolderOutput, { recursive: true });
            processFolder(filePath, outputFolder);
        }
        else if (isImageFile(filePath)) {
            // 如果是图片文件，则进行压缩
            const outputFilePath = join(outputFolder, relative(inputFolder, filePath));
            compressImage(filePath, outputFilePath);
        }
    });
}
// 检查是否为支持的图片文件类型
function isImageFile(filePath) {
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']; // 可以根据需要扩展
    const ext = extname(filePath).toLowerCase();
    return supportedExtensions.includes(ext);
}
// 压缩图片
function compressImage(inputFilePath, outputFilePath, targetSize = 0) {
    const theme = Cfg.getConfig('theme');
    if (!targetSize)
        targetSize = theme?.compress || 0;
    if (targetSize === 0) {
        copyFileSync(inputFilePath, outputFilePath);
        return Promise.resolve(true);
    }
    // 使用 image-size 获取图片尺寸
    const dimensions = sizeOf(inputFilePath);
    const originalSize = statSync(inputFilePath).size;
    // 计算压缩比例
    const scaleFactor = Math.sqrt(targetSize * 1024 / originalSize);
    const size = (dimensions.width && dimensions.height) ? [Math.round(dimensions.width * scaleFactor), Math.round(dimensions.height * scaleFactor)] : [null, null];
    return new Promise((resolve, reject) => {
        // 使用 sharp 进行图片压缩
        if (theme.quality == 100) {
            sharp(inputFilePath)
                .resize(...size)
                .toFile(outputFilePath, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        }
        else {
            sharp(inputFilePath)
                .resize(...size)
                .jpeg({ quality: theme.quality })
                .toFile(outputFilePath, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        }
    });
}
/**
 * 压缩图片
 * @param buffer 图片buffer
 * @param targetSize 目标大小，默认100kB
 * @returns
 */
function compressImageFromBuffer(buffer, targetSize = 0) {
    const theme = Cfg.getConfig('theme');
    if (!targetSize)
        targetSize = theme?.compress || 0;
    if (targetSize === 0) {
        return Promise.resolve(buffer);
    }
    // 使用 image-size 获取图片尺寸
    const dimensions = sizeOf(buffer);
    const originalSize = buffer.length;
    // 计算压缩比例
    const scaleFactor = Math.sqrt(targetSize * 1024 / originalSize);
    const size = (dimensions.width && dimensions.height) ? [Math.round(dimensions.width * scaleFactor), Math.round(dimensions.height * scaleFactor)] : [null, null];
    return new Promise((resolve, reject) => {
        // 使用 sharp 进行图片压缩
        if (theme.quality == 100) {
            sharp(buffer)
                .resize(...size)
                .toBuffer()
                .then(data => {
                resolve(data);
            })
                .catch(err => {
                if (err) {
                    reject(err);
                }
            });
        }
        else {
            sharp(buffer)
                .resize(...size)
                .jpeg({ quality: theme.quality })
                .toBuffer()
                .then(data => {
                resolve(data);
            })
                .catch(err => {
                if (err) {
                    reject(err);
                }
            });
        }
    });
}
//转化Buffer流对象，并将buffer流合并成一个，并期约返回
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const bufferList = [];
        //图片流数据
        stream.on('data', (data) => {
            bufferList.push(data);
        });
        stream.on('error', err => {
            reject(err);
        });
        //end为追加数据
        stream.on('end', () => {
            //这里是合并buffer对象
            resolve(Buffer.concat(bufferList));
        });
    });
}
//生成新图片，并追加新图片的格式大小覆盖区域等
function dealWithStream(basePicture) {
    const readableStream = createReadStream(basePicture);
    const transformer = sharp().resize({
        width: 100,
        height: 100,
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
    });
    //console.log(transformer);
    //将transformer流数据追加进行处理
    readableStream.pipe(transformer);
    streamToBuffer(transformer).then(function (newPicBuffer) {
        //写入新图片中
        writeFile(`${__dirname}/img/water.png`, newPicBuffer, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('done');
        });
    });
}
//dealWithStream(basePicture);
//将图片转为jpeg,并对jpeg文件进行处理
function dealWithBuffer(basePicture) {
    sharp(basePicture)
        .resize(800, 600, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
    })
        .toFormat('webp')
        .toBuffer()
        .then(function (outputBuffer) {
        writeFile(`${__dirname}/img/3.webp`, outputBuffer, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('done');
        });
    });
}
//dealWithBuffer(basePicture);
//添加文字水印
function addText(basePicture, font, newFilePath) {
    const { fontSize, text, color, left, top } = font;
    const textToSvgSync = textToSvg.loadSync();
    const attributes = {
        fill: color
    };
    const options = {
        fontSize,
        anchor: 'top',
        attributes
    };
    const svgTextBuffer = Buffer.from(textToSvgSync.getSVG(text, options));
    //添加文字
    sharp(basePicture)
        .composite([{
            input: svgTextBuffer,
            top,
            left
        }])
        .withMetadata() // 在输出图像中包含来自输入图像的所有元数据(EXIF、XMP、IPTC)。
        .toFormat('webp') //生成新的图片格式为webp
        .toFile(newFilePath)
        .then(info => {
        if (!!info) {
            console.log('水印已经生成');
        }
    })
        .catch(err => {
        console.log(err);
    });
}
/*
addText(basePicture,{
    fontSize:24,
    text:'喜气洋洋',
    color:'white',
    left:200,
    top:200
},`${__dirname}/img/6.webp`);
*/
//添加图片水印,水印图片一定要小于原图
function addWatermark(basePicture, watermarkPicture, newFilePath) {
    sharp(basePicture)
        //.rotate(180) //旋转180度
        .composite([{
            input: watermarkPicture,
            blend: 'overlay',
            // globalAlpha:0.5,
            left: 50,
            top: 50
        }]) //在左上坐标(10,10)位置添加水印图片,composite为合成图片
        .withMetadata()
        .webp({ quality: 90 })
        .toFile(newFilePath)
        .then(result => {
        if (result) {
            console.log('水印已经添加');
        }
    })
        .catch(err => {
        console.log(err);
    });
    sharp.cache(false);
}
//dealWithStream('./img/300.jfif');
// let waterPic=`${__dirname}/img/water.png`
// addWatermark(basePicture,waterPic,'./img/7.webp');

export { addText, addWatermark, compressImage, compressImageFromBuffer, dealWithBuffer, dealWithStream, isImageFile, processFolder, streamToBuffer };
