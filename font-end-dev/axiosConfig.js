// First we need to import axios.js
import axios from 'axios';
// Next we make an 'instance' of it
const instance = axios.create({
// .. where we make our configurations
    baseURL: import.meta.env.VITE_ROOT_API
});

export default instance;
