import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'

const getAllStalls = async () => {
    const response = await axios.get(`${baseURL}/get-all-stalls`);
    return response.data;
};


export { getAllStalls};