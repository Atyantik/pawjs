import Http from "http";
import Fs from "fs";

export function getDataFromUrl(url) {
  return new Promise ((resolve, reject) => {
    Http.get(url, (res) => {
      const {statusCode} = res;
      let error;
      if (statusCode !== 200) {
        error = new Error("Request Failed.\n" +
          `Status Code: ${statusCode}`);
      }
      if (error) {
        //eslint-disable-next-line
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
        return;
      }

      res.setEncoding("utf8");
      let rawData = "";
      res.on("data", (chunk) => {
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          resolve(rawData);
        } catch (e) {
          //eslint-disable-next-line
          console.error(e.message);
          reject(e.message);
        }
      });
    }).on("error", (e) => {
      //eslint-disable-next-line
      console.error(`Got error: ${e.message}`);
      reject(e.message);
    });
  });
}

export function saveDataToFile(rawData, fileUrl) {
  return new Promise ((resolve, reject) => {
    try{
      Fs.writeFileSync(fileUrl, rawData, "utf-8");
      resolve();
    }
    catch (err) {
      reject(err);
    }
  });
}

export function rmFilesInDir (dirPath) {
  let files = [];
  try {
    files = Fs.readdirSync(dirPath);
  }
  catch(e) {
    return;
  }
  if (files.length > 0)
    for (let i = 0; i < files.length; i++) {
      const filePath = dirPath + "/" + files[i];
      if (Fs.statSync(filePath).isFile())
        Fs.unlinkSync(filePath);
    }
}