import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'

const inputRecordTrack = async ({ notice, kilo, userId, image, pigName, feed }) => {
    try {
        const formData = new FormData();
        formData.append('notice', notice);
        formData.append('kilo', kilo);
        formData.append('pigName', pigName);
        formData.append('feed', feed);
        formData.append('userId', userId);

        if (image) {
            const fileName = image.split('/').pop();
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: fileName,
            });
        }

        // console.log(formData)

        const response = await axios.post(`${baseURL}/track/input-track`, formData,
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


export { inputRecordTrack };