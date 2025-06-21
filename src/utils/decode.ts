
import { jwtDecode } from "jwt-decode"; // ✅ Dùng named import
import { SercuseService } from "../helpers/secureStorage";

export const decodeToken = async () => {
    const token = await SercuseService.get("accessToken");

    try {
        if(!token){
            throw new Error("Token is null or undefined")
        }
        const decoded = jwtDecode<any>(token);
        return decoded;
    } catch (error) {
        console.error("Error when decoding token: ", error);       
    }
};  