import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
    // Extract token from the Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
        return response.status(401).send("You are not authenticated!");
    }

    // The token should be prefixed with "Bearer", so split to get the token
    const token = authHeader.split(" ")[1]; 

    // If token is not present
    if (!token) {
        return response.status(401).send("Token not found, you are not authenticated!");
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {return response.status(403).send("Token is not valid!");}

        // Set the user ID from the payload to request object
        request.userId = payload.id; // Assuming 'id' is in the payload
        next();
    });
};

export default verifyToken;

