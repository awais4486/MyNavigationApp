const axios = require('axios');

const DUMMY_URL = 'https://dummyjson.com/products';

const fetchDummyProducts = async () => {
    try {
        const response = await axios.get(DUMMY_URL);

        console.log('Total DummyJSON products:', response.data.products.length);

        console.log('First product:');
        console.log(response.data.products[0]);

    } catch (error) {
        console.error('Error fetching DummyJSON:', error.message);
    }
};

fetchDummyProducts();