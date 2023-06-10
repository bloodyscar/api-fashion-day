const { google } = require('googleapis');
const tf = require('@tensorflow/tfjs-node');
const paths = require('path');
const { file } = require('googleapis/build/src/apis/file');
var fs = require("fs")

const API_KEY = 'AIzaSyAhTDe5rG09vVdYhfOxw88-_Zdkzk_UwEc';

async function loadModel() {
    // Get the absolute path to the model directory
    const modelDirectory = paths.resolve(__dirname, '../../model');

    // Construct the absolute path to the model file
    const modelPath = paths.join(modelDirectory, 'model_fashion.json');


    const model = await tf.loadLayersModel(`file://${modelPath}`);
    return model;
}

async function processFile(filePath) {
    let model;
    // Load the model
    model = await loadModel();
    console.log('Model loaded successfully.');

    // Load the image file using TensorFlow.js
    const image = fs.readFileSync(filePath);
    const decodedImage = tf.node.decodeImage(image);

    const resizedImage = tf.image.resizeBilinear(decodedImage, [96, 96]); // Resize image to match expected input shape
    const reshapedImage = tf.expandDims(resizedImage, 0); // Add batch dimension

    // Make predictions using the model
    const predictions = model.predict(reshapedImage);

    // Cleanup the temporary file
    fs.unlinkSync(filePath);
    return predictions;
}

module.exports = {
    uploadFile: async function (req, res, next) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        // Setelah file berhasil di-upload, dapatkan path file
        const filePath = req.file.path;

        let result = await processFile(filePath);
        // const val = result.arraySync()[0];
        // // Find the indices of the two highest values
        // const sortedIndices = val.map((value, index) => [value, index])
        //     .sort((a, b) => b[0] - a[0])
        //     .slice(0, 2)
        //     .map(entry => entry[1]);
        // console.log('Predicted class index:', sortedIndices);

        let { values, indices } = tf.topk(result, 2, true)



        values = values.arraySync()[0]
        indices = indices.arraySync()[0]
        console.log(values)
        console.log(indices)


        const text = fs.readFileSync('uploads/fashion.txt', 'utf8');
        let fashion = text.split("\n")
        let predictions = []
        for (i = 0; i < 2; i++) {
            if (values[i] > 0.01) {
                predictions.push(
                    fashion[indices[i]],
                )
            }
        }
        let gender = req.body.gender

        let query = `${predictions.join(" ")} outfit women`

        // Set up the API client
        var links = [];
        const customSearch = google.customsearch('v1');
        // Define search parameters
        const params = {
            q: query, // The query string
            cx: '31ec515b6a0d04171', // The search engine ID (CX ID)
            searchType: 'image', // The search type,
            num: 10,
            aspectRatio: 'tall',
        };

        const searchResult = await customSearch.cse.list({ auth: API_KEY, cx: params.cx, q: params.q, searchType: params.searchType, num: params.num, aspectRatio: params.aspectRatio });
        // Process the search results
        const items = searchResult.data.items;
        if (items.length === 0) {
            console.log('No results found.');
        } else {
            console.log('=== Search results:');
            console.log(items)

            items.forEach((item, i) => {

                links.push({ photo: item.link });
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Successfully get fashion prediction',
            predictions: query,
            data: links
        })

    },
    getBestToday: async function (req, res, next) {
        // Set up the API client
        var links = [];
        const customSearch = google.customsearch('v1');
        // Define search parameters
        const params = {
            q: 'korean outfit of the day', // The query string
            cx: '31ec515b6a0d04171', // The search engine ID (CX ID)
            searchType: 'image', // The search type,
            num: 10,
            aspectRatio: 'tall',
        };

        const searchResult = await customSearch.cse.list({ auth: API_KEY, cx: params.cx, q: params.q, searchType: params.searchType, num: params.num, aspectRatio: params.aspectRatio });

        // Process the search results
        const items = searchResult.data.items;
        if (items.length === 0) {
            console.log('No results found.');
        } else {
            console.log('=== Search results:');
            console.log(items)

            items.forEach((item, i) => {
                console.log('  Link:', item.link);
                // Create an object
                var object = {
                    nama: `Testing ${i}`,
                    photo: item.link
                };
                links.push(object);
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Successfully get best today',
            data: links
        })

    }
}