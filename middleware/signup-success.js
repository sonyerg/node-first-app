module.exports = (req, res, next) => {
  if (!req.session.signupSuccess) {
    return res.redirect("/");
  }

  delete req.session.signupSuccess;
  next();
};
