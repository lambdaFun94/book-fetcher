import axios from "axios";
import fs from "fs";
import "colors";

// User parameters
const baseURL = "http://pages.cs.wisc.edu/~remzi/OSTEP/";
const DIRECTORY_NAME = "OSTEP_BOOK";

// Get directory webpage, i.e. page that contains all links
const fetchAndParseWebPage = async (URL) => {
  try {
    const { data } = await axios.get(URL);

    let re = /href=.+?(?=[>\s])/g;
    const hrefs = data.match(re);

    const endPoints = hrefs
      .map((href) => href.split("=")[1])
      .filter((href) => href.endsWith(".pdf"));

    return endPoints;
  } catch (err) {
    console.log(`Error retrieving directory page: ${err}`.red);
    process.exit();
  }
};

// Axios object for get request to pdf endpoints
const fetchPdfObject = axios.create({
  responseType: "arraybuffer",
  baseURL,
});

// Format filename for saving
const formatFileName = (str) =>
  str.split("-").reduce((prev, curr) => prev + "_" + curr);

// Retrieve individual webpages and write them to user-specified directory
const fetchAndWriteChapters = async (url) => {
  try {
    // Retrieve pdf endpoints
    const urlEndpoints = await fetchAndParseWebPage(url);

    fs.mkdirSync(`./${DIRECTORY_NAME}`);

    urlEndpoints.forEach(async (elem) => {
      let { data } = await fetchPdfObject.get(`/${elem}`);

      let fileName = formatFileName(elem);
      let path = `./${DIRECTORY_NAME}/${fileName}`;
      fs.writeFileSync(path, data);
    });
  } catch (err) {
    console.log(`Error fetching or writing pages: ${err}`.red.inverse);
  }
};

fetchAndWriteChapters(baseURL);
