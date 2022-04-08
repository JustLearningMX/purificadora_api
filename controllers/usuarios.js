/**
 * Controlador con las funciones que se implementan
 * en el endpoint /usuarios
 */

function login(req, res) {
    res.json({
        error: null,
        message: 'Login'
    });
};

function signup(req, res) {
    res.json({
        error: null,
        message: 'SignUp'
    });
};

module.exports = {
    login,
    signup
};