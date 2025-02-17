import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'

const addVendorStall = async ({ _id, stallDescription, stallAddress, stallNumber, avatar }) => {
    try {
        const formData = new FormData();
        formData.append("stallDescription", stallDescription);
        formData.append("stallAddress", stallAddress);
        formData.append("stallNumber", stallNumber);

        if (avatar) {
            const fileName = avatar.split("/").pop();
            formData.append("avatar", {
                uri: avatar,
                type: "image/jpeg",
                name: fileName,
            });
        }

        const response = await axios.put(`${baseURL}/vendor/add-stall/${_id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Add User Address Frontend API error:", error.response?.data || error.message);
        throw error;
    }
};

export { addVendorStall };