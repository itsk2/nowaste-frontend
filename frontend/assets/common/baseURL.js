import { Platform } from 'react-native'



let baseURL = '';

{Platform.OS == 'android'

// ? baseURL = 'http://192.168.137.187:8080/api/v1'
// : baseURL = 'http://192.168.137.187:8080/api/v1'


// ? baseURL = 'http://192.168.100.4:8080/api/v1'
// : baseURL = 'http://192.168.100.4:8080/api/v1'


? baseURL = 'http://192.168.169.104:8080/api/v1'
: baseURL = 'http://192.168.169.104:8080/api/v1'

// ? baseURL = 'https://nw-mobile-backend.onrender.com/api/v1'
// : baseURL = 'https://nw-mobile-backend.onrender.com/api/v1'
}
export default baseURL;