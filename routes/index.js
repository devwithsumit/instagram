const express = require('express');
const router = express.Router();
const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const passport = require('passport');
const localStrategy = require("passport-local");
const isLoggedIn = require("../middlewares/isLoggedIn");
const upload = require("../config/multer");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  let success = req.flash("success")
  let error = req.flash("error")
  res.render('login', { footer: false });
})

router.post('/register', function (req, res) {
  try {
    let { username, email, password, name } = req.body;
    let user = new userModel({
      username,
      email,
      name,
    })
    userModel.register(user, password)
      .then(() => {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/login");
        })
      }).catch((error) => {
        req.flash("error", error.message)
        res.redirect("/")
      });
  } catch (error) {
    res.send(error.message)
  }
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
  successFlash: true,
}))

router.get('/feed', isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user })
  let posts = await postModel.find().populate("user");
  res.render("feed", {footer: true, user, posts});
})

router.get('/profile', isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  // console.log(user.posts);
  res.render('profile', { user, footer: true });
})

router.get('/edit', isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render('edit', { user, footer: false, header: false });
})

router.post("/update", isLoggedIn, async function (req, res) {
  let { username, name, bio } = req.body;
  let user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username, name, bio },
  );
  res.redirect("/profile");
})

router.get("/upload", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user })
  res.render("upload", { user, footer: true })
});

router.get("/search", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user })
  res.render("search", { user, footer: true })
})

router.post("/post", isLoggedIn, upload.single("image"), async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  let post = await postModel.create({
    user: user._id,
    image: req.file.filename,
    caption: req.body.caption,
  })
  user.posts.push(post._id)
  await user.save();
  res.redirect("/profile");
})

router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
  await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { profilePicture: req.file.filename },
  )
  res.redirect("/edit")
})

router.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  })
  res.clearCookie("token")
  req.flash('success', 'You have logged out successfully.');
  res.redirect('/login');
})

module.exports = router;
