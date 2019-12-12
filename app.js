var express = require('express'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer')
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    app = express();

//Database connection established
mongoose.connect("mongodb+srv://Mthreeuser:Mthree123@cluster0-vuvjc.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true })
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Database Schema establised
var BlogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", BlogSchema)

app.get("/", function(req, res){
    res.redirect("/blogs")
})

app.get("/blogs",function(req, res){
    Blog.find({}, function(err, blogsData){
        if(err){
            console.log("Error")
        }else{
            res.render("index", {blogs:blogsData})
        }
    })
})

//New Route
app.get("/blogs/new", function(req, res){
    res.render("new");
})

//Create Route
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err,blogData){
        if(err){
            res.render("/blogs/new");
        }else{
            res.redirect("/blogs");
        }
    })
})

//Show route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundID){
        if(err){
            res.redirect("/blogs")
        }else{
            res.render("show", {blog: foundID})
        }
    })
})

//Edit route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.render("/blogs")
        }else{
            res.render("edit", {blog:foundBlog});
        }
    })
})

//Update route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, update){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

//Delete route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs")
        }
    })
})

app.listen("3000", function(){
    console.log("server has started!")
});



/* google auth code */
var authConfig = require('./config/auth'),
passport = require('passport'),
GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;



// Passport session setup.
//
//   For persistent logins with sessions, Passport needs to serialize users into
//   and deserialize users out of the session. Typically, this is as simple as
//   storing the user ID when serializing, and finding the user by ID when
//   deserializing.
passport.serializeUser(function(user, done) {
    // done(null, user.id);
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    // Users.findById(obj, done);
    done(null, obj);
  });

  let User = require('./config/user');
  let configAuth = require('./config/auth');
  
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
//   See http://passportjs.org/docs/configure#verify-callback
passport.use(new GoogleStrategy(

    // Use the API access settings stored in ./config/auth.json. You must create
    // an OAuth 2 client ID and secret at: https://console.developers.google.com

    // authConfig.google,
    {
        clientID: configAuth.google.clientID,
        clientSecret: configAuth.google.clientSecret,
        callbackURL: configAuth.google.callbackURL
    },  
    function(accessToken, refreshToken, profile, done) {
  
      // Typically you would query the database to find the user record
      // associated with this Google profile, then pass that object to the `done`
      // callback.
      process.nextTick(function(){
        User.findOne({'google.id': profile.id}, function(err, user){
            if(err)
                return done(err);
            if(user)
                return done(null, user);
            else {
                var newUser = new userschema();
                newUser.google.id = profile.id;
                newUser.google.token = accessToken;
                newUser.google.name = profile.displayName;
                newUser.google.email = profile.emails[0].value;
                newUser.save(function(err){
                    if(err)
                        throw err;
                    return done(null, newUser);
                })
                console.log(profile);
            }
        });
    });


      return done(null, profile);
    }
  ));


  
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var session = require('express-session');

  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));  

  app.get('/login', function(req, res) {
    res.render('login', {
      user: req.user
    });
  });


  
// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email' ] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Authenticated successfully
    res.redirect('/');
  });

app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', {
    user: req.user
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
}); 


// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }