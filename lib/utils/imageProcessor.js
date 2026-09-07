import config_default from "./config.js";
import { copyFileSync, createReadStream, mkdirSync, readdirSync, statSync, writeFile } from "fs";
import { extname, join, relative } from "path";
import sharp from "sharp";
import sizeOf from "image-size";
import textToSvg from "text-to-svg";

//#region src/utils/imageProcessor.ts
function processFolder(inputFolder, outputFolder) {
	readdirSync(inputFolder).forEach((file) => {
		const filePath = join(inputFolder, file);
		if (statSync(filePath).isDirectory()) {
			const subFolderOutput = join(outputFolder, relative(inputFolder, filePath));
			mkdirSync(subFolderOutput, { recursive: true });
			processFolder(filePath, outputFolder);
		} else if (isImageFile(filePath)) compressImage(filePath, join(outputFolder, relative(inputFolder, filePath)));
	});
}
function isImageFile(filePath) {
	const supportedExtensions = [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".bmp",
		".webp"
	];
	const ext = extname(filePath).toLowerCase();
	return supportedExtensions.includes(ext);
}
function compressImage(inputFilePath, outputFilePath, targetSize = 0) {
	const theme = config_default.getConfig("theme");
	if (!targetSize) targetSize = theme?.compress || 0;
	if (targetSize === 0) {
		copyFileSync(inputFilePath, outputFilePath);
		return Promise.resolve(true);
	}
	const dimensions = sizeOf(inputFilePath);
	const originalSize = statSync(inputFilePath).size;
	const scaleFactor = Math.sqrt(targetSize * 1024 / originalSize);
	const size = dimensions.width && dimensions.height ? [Math.round(dimensions.width * scaleFactor), Math.round(dimensions.height * scaleFactor)] : [null, null];
	return new Promise((resolve, reject) => {
		if (theme.quality == 100) sharp(inputFilePath).resize(...size).toFile(outputFilePath, (err) => {
			if (err) reject(err);
			else resolve(true);
		});
		else sharp(inputFilePath).resize(...size).jpeg({ quality: theme.quality }).toFile(outputFilePath, (err) => {
			if (err) reject(err);
			else resolve(true);
		});
	});
}
/**
* 压缩图片
* @param buffer 图片buffer
* @param targetSize 目标大小，默认100kB
* @returns 
*/
function compressImageFromBuffer(buffer, targetSize = 0) {
	const theme = config_default.getConfig("theme");
	if (!targetSize) targetSize = theme?.compress || 0;
	if (targetSize === 0) return Promise.resolve(buffer);
	const dimensions = sizeOf(buffer);
	const originalSize = buffer.length;
	const scaleFactor = Math.sqrt(targetSize * 1024 / originalSize);
	const size = dimensions.width && dimensions.height ? [Math.round(dimensions.width * scaleFactor), Math.round(dimensions.height * scaleFactor)] : [null, null];
	return new Promise((resolve, reject) => {
		if (theme.quality == 100) sharp(buffer).resize(...size).toBuffer().then((data) => {
			resolve(data);
		}).catch((err) => {
			if (err) reject(err);
		});
		else sharp(buffer).resize(...size).jpeg({ quality: theme.quality }).toBuffer().then((data) => {
			resolve(data);
		}).catch((err) => {
			if (err) reject(err);
		});
	});
}
function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		const bufferList = [];
		stream.on("data", (data) => {
			bufferList.push(data);
		});
		stream.on("error", (err) => {
			reject(err);
		});
		stream.on("end", () => {
			resolve(Buffer.concat(bufferList));
		});
	});
}
function dealWithStream(basePicture) {
	const readableStream = createReadStream(basePicture);
	const transformer = sharp().resize({
		width: 100,
		height: 100,
		fit: sharp.fit.cover,
		position: sharp.strategy.entropy
	});
	readableStream.pipe(transformer);
	streamToBuffer(transformer).then(function(newPicBuffer) {
		writeFile(`${__dirname}/img/water.png`, newPicBuffer, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log("done");
		});
	});
}
function dealWithBuffer(basePicture) {
	sharp(basePicture).resize(800, 600, {
		fit: sharp.fit.inside,
		withoutEnlargement: true
	}).toFormat("webp").toBuffer().then(function(outputBuffer) {
		writeFile(`${__dirname}/img/3.webp`, outputBuffer, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log("done");
		});
	});
}
function addText(basePicture, font, newFilePath) {
	const { fontSize, text, color, left, top } = font;
	const textToSvgSync = textToSvg.loadSync();
	const options = {
		fontSize,
		anchor: "top",
		attributes: { fill: color }
	};
	const svgTextBuffer = Buffer.from(textToSvgSync.getSVG(text, options));
	sharp(basePicture).composite([{
		input: svgTextBuffer,
		top,
		left
	}]).withMetadata().toFormat("webp").toFile(newFilePath).then((info) => {
		if (!!info) console.log("水印已经生成");
	}).catch((err) => {
		console.log(err);
	});
}
function addWatermark(basePicture, watermarkPicture, newFilePath) {
	sharp(basePicture).composite([{
		input: watermarkPicture,
		blend: "overlay",
		left: 50,
		top: 50
	}]).withMetadata().webp({ quality: 90 }).toFile(newFilePath).then((result) => {
		if (result) console.log("水印已经添加");
	}).catch((err) => {
		console.log(err);
	});
	sharp.cache(false);
}

//#endregion
export { addText, addWatermark, compressImage, compressImageFromBuffer, dealWithBuffer, dealWithStream, isImageFile, processFolder, streamToBuffer };