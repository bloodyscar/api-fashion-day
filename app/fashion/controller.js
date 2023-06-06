const { google } = require('googleapis');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

async function loadModel() {
    // Get the absolute path to the model directory
    const modelDirectory = path.resolve(__dirname, '../../model');

    // Construct the absolute path to the model file
    const modelPath = path.join(modelDirectory, 'model_fashion.json');
    console.log(modelPath)


    const model = await tf.loadLayersModel(`file://${modelPath}`);
    return model;
}

module.exports = {
    homeFashion: async function (req, res, next) {
        let model;
        // Load the model
        model = await loadModel();


        console.log('Model loaded successfully.');

        res.status(200).json({
            status: 'success',
            message: 'Successfully get home fashion',
        })

    },
    getBestToday: async function (req, res, next) {
        // Set up the API client
        const customSearch = google.customsearch('v1');
        var links = [];
        const API_KEY = 'AIzaSyAhTDe5rG09vVdYhfOxw88-_Zdkzk_UwEc';

        // Define search parameters
        const params = {
            q: 'ootd', // The query string
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
            items.forEach((item) => {
                console.log('  Link:', item.link);
                links.push(item.link);
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Successfully get best today',
            data: {
                photo: links
            }
        })

    }
}