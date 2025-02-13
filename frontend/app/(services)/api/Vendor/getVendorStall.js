import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';

const getVendorStall = async (userId) => {
    const response = await axios.get(`${baseURL}/vendor/${userId}`);
    return response.data;
};

export { getVendorStall };

