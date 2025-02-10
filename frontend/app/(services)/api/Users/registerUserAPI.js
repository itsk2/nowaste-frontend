import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL'

const registerUser = async ({ email, password, name, avatar, role }) => {
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('role', role);


        if (avatar) {
            const fileName = avatar.split('/').pop();
            formData.append('avatar', {
                uri: avatar,
                type: 'image/jpeg',
                name: fileName,
            });
        }

        const response = await axios.post(`${baseURL}/register`,formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
            
        );

        return response.data;
    } catch (error) {
        console.error("Registration error: at registerAPI", error.response?.data || error.message);
        throw error;
    }
};


export { registerUser };