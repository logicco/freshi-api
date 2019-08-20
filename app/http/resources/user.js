exports.single = function (user) {
    return {
        username: user.username,
        email: user.email,
        joinedSince: user.joinedSince
    }

}
