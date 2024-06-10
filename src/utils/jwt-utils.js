import { jwtDecode } from "jwt-decode";

function parseActorToken(token) {
    if (token !== null) {
        // gotta be a better way to do this...
        return JSON.parse(JSON.stringify(jwtDecode(token)));
    }
    return null;
}


export default {
    parseActorToken,
};