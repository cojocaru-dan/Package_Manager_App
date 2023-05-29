const fsPromises = require('fs/promises');

async function fileWriterAsync(path, content) {
  try {
    await fsPromises.writeFile(path, JSON.stringify(content));
  } catch (err) {
    console.log(err);
  }
}

module.exports = fileWriterAsync;