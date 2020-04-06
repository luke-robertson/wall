const images = require('images')
const fs = require('fs-extra')
const gm = require('gm')

// brew install imagemagick
// brew install graphicsmagick

// a1 - 20
// a2 - 12
// a4 - 10

const templateList = [
	{ url: 'bg-1.png', x: 329, y: 110, width: 303 },
	{ url: 'bg-2.png', x: 1475, y: 185, width: 521 },
	{ url: 'bg-3.png', x: 969, y: 152, width: 318 },
	{ url: 'bg-4.png', x: 874, y: 281, width: 355 },
	{ url: 'bg-5.png', x: 320, y: 601, width: 289 },
	{ url: 'bg-6.png', x: 1003, y: 473, width: 187 }
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
