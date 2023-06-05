const { google } = require('googleapis');

module.exports = {
    homeFashion: function (req, res, next) {
        res.status(200).json({
            status: 'success',
            message: 'Successfully get home fashion',
        })

    },
    getBestToday: async function (req, res, next) {
        // Set up the API client
        const customSearch = google.customsearch('v1');
        var links = [];

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