import { Platform } from 'react-native'

let baseURL = '';
{
    Platform.OS == 'android'

        ? baseURL = 'http://172.34.18.179:8080/api/v1'
        : baseURL = 'http://172.34.18.179:8080/api/v1'

        // ? baseURL = 'https://nw-mobile-backend-1.onrender.com/api/v1'
        // : baseURL = 'https://nw-mobile-backend-1.onrender.com/api/v1'
}
export default baseURL;