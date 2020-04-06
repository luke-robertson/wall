const images = require('images')
const fs = require('fs-extra')
const gm = require('gm')

// brew install imagemagick
// brew install graphicsmagick

// a1 - 20
// a2 - 12
// a4 - 10

const templateList = [
	{ url: 'bg-1.png', x: 328, y: 108, width: 305 },
	{ url: 'bg-2.png', x: 1400, y: 115, width: 628 },
	{ url: 'bg-3.png', x: 967, y: 149, width: 321 },
	{ url: 'bg-4.png', x: 839, y: 267, width: 424 },
	{ url: 'bg-5.png', x: 320, y: 596, width: 297 },
	{ url: 'bg-6.png', x: 1000, y: 468, width: 190 }
]

const inputPath = './input'
const outputPath = './output'

const cropImages = async imagePath =>
	new Promise(resolve =>
		gm('./source_images/' + imagePath)
			.resize(595, 881, '^')
			.gravity('Center')
			.crop(595, 881)
			.write(inputPath + '/' + imagePath, e => resolve())
	)

// const makeHighRes = async (imagePath, folder) =>
// 	new Promise(resolve =>
// 		gm('./source_images/' + imagePath)
// 			.resize(7016, 9933, '^')
// 			.density(7016, 9933)
// 			.units('PixelsPerInch')
// 			.gravity('Center')
// 			.crop(7016, 9933)
// 			.write(outputPath + '/' + folder + '/' + 'highRes.png', () =>
// 				resolve()
// 			)
// 	)

const makeDefault = async (imagePath, folder) =>
	new Promise(resolve =>
		gm('./source_images/' + imagePath)
			.resize(1240, 1748, '^')
			.gravity('Center')
			.crop(1240, 1748)
			.write(outputPath + '/' + folder + '/' + 'default.png', () => resolve())
	)

const cleanupFolders = async () => {
	const inputFolder = await fs.existsSync(inputPath)

	if (inputFolder) {
		await fs.removeSync(inputPath)
	}

	await fs.mkdirSync(inputPath)

	const outputFolder = await fs.existsSync(outputPath)

	if (outputFolder) {
		await fs.removeSync(outputPath)
	}

	await fs.mkdirSync(outputPath)
}

const generateWebImages = async () => {
	const imageList = await fs.readdirSync('./source_images/').filter(item => item !== '.DS_Store')

	for (const image of imageList) {
		console.log('Proccess: ', image)
		await cropImages(image)

		const folderName = image.substring(0, image.lastIndexOf('.'))
		const folderExists = await fs.existsSync(outputPath + '/' + folderName)

		if (!folderExists) {
			await fs.mkdirSync(outputPath + '/' + folderName)
		}

		await makeDefault(image, folderName)

		for (const { url, x, y, width } of templateList) {
			images('templates/' + url)
				.draw(images(inputPath + '/' + image).resize(width), x, y)
				.save(outputPath + '/' + folderName + '/' + url, {
					quality: 50
				})
		}
	}
}

const main = async () => {
	await cleanupFolders()
	await generateWebImages()
}

main()
