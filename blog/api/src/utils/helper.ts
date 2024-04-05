import jwt from 'jsonwebtoken';
import config from '../config';

const generateToken = async (payload: { userId: number }) => {
    const token = await jwt.sign(payload, config.jwt.secret as string, { expiresIn: '1d' });
    return token;
}

const verifyToken = async(token: string) =>{
    try {
        const userData = await jwt.verify(token, config.jwt.secret as string) as { userId : number};
        return userData;
    } catch (error) {
        return null
    }
}
export const jwtHelper = {
    generateToken,
    verifyToken
}