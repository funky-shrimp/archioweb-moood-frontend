
function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT');
    }
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
}

// Usage

export { decodeJWT };