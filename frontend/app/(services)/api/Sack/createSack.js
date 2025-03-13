import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'

const createSack = async ({ description, kilo, dbSpoil, userId, stallNumber, images }) => {
    try {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('kilo', kilo);
        formData.append('dbSpoil', dbSpoil);
        formData.append('seller', userId);
        formData.append('stallNumber', stallNumber);

        if (images) {
            const fileName = images.split('/').pop();
            formData.append('image', {
                uri: images,
                type: 'image/jpeg',
                name: fileName,
            });
        }

        // console.log(formData)

        const response = await axios.post(`${baseURL}/sack/create-sack`, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Create Product error: at Create Product API", error.response?.data || error.message);
        throw error;
    }
};


export { createSack };