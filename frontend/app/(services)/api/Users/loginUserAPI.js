import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'
// Login
const loginUser = async ({ email, password }) => {
    const response = await axios.post(`${baseURL}/login`,
        { email, password }
    );
    console.log(response,'Data')
    return response.data;
};

export { loginUser };