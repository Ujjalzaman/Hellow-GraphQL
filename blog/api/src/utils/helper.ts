import jwt from 'jsonwebtoken';
import config from '../config';

const generateToken = async (payload: { userId: number }) => {
    const token = jwt.sign(payload, config.jwt.secret as string, { expiresIn: '1d' });
    return token;
}
export const jwtHelper = {
    generateToken
}