import { Platform } from 'react-native'

let baseURL = '';
{
    Platform.OS == 'android'
        ? baseURL = 'https://nw-mobile-backend-1.onrender.com/api/v1'
        : baseURL = 'https://nw-mobile-backend-1.onrender.com/api/v1'
        
        // ? baseURL = 'http://192.168.20.180:8080/api/v1'
        // : baseURL = 'http://192.168.20.180:8080/api/v1'
}
export default baseURL;