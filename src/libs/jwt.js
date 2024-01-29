import jwt from "jsonwebtoken";

/**
 * Generate a new JWT token
 * @param {Object} payload
 * @returns {Promise<String>}
 */
export function generateToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.JWT_KEY,
            { expiresIn: "1d" },
            (err, token) => {
                if (err) reject(err);

                resolve(token);
            }
        );
    });
}