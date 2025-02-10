import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'

const addUserAddress = async ({ _id, lotNum, street, baranggay, city }) => {
    try {

        const response = await axios.put(`${baseURL}/add-address`, {
            _id, lotNum, street, baranggay, city
        },
        );

        return response.data;
    } catch (error) {
        console.error("Add User Address Frontend API error:", error.response?.data || error.message);
        throw error;
    }
};

export { addUserAddress };
