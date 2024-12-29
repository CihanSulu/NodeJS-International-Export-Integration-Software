const axios = require('axios');
const fs = require('fs');
const path = require('path');

const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

const downloadImage = async (url, index, groupID) => {
    try {
      const response = await axios.get(url, { responseType: 'stream' })
      const uploadsDirectory = path.resolve(__dirname, '../public/uploads')
      createDirectoryIfNotExists(uploadsDirectory); 
      const groupDirectory = path.join(uploadsDirectory, groupID);
      createDirectoryIfNotExists(groupDirectory); 
      const filePath = path.join(groupDirectory, `image_${index}.jpg`);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error("Image Upload Error:", error);
      throw error;
    }
};

const downloadAllImages = async (urls, groupID) => {
  const imagePaths = [];
  for (let i = 0; i < urls.length; i++) {
    let image_full = "https://cdn.dsmcdn.com"+urls[i]
    try {
      const imagePath = await downloadImage(image_full, i + 1, groupID);
      const relativePath = path.relative(__dirname, imagePath)
      imagePaths.push("https://panel.entegio.com/" + relativePath.replace("public\\","").replace("..\\","").replaceAll("\\","/").replace("../public/",""))
      //imagePaths.push("https://panel.entegio.com/" + relativePath.replace(/..\public\\/g, "").replace(/\\/g, "/").replace('./',''))
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }
  return imagePaths;
};

module.exports = downloadAllImages;
