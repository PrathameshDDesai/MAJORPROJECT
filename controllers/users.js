const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, fullname, role, phoneNumber, address } = req.body;
        const newUser = new User({ email, username, fullname, role, phoneNumber, address });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to UniRooms, ${registeredUser.fullname}!`);
            return res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", `Welcome back, ${req.user.fullname}!`);
    const redirectUrl = res.locals.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have been logged out successfully!");
        res.redirect("/listings");
    });
};
