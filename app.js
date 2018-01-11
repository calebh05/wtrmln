var express = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    request             = require("request"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    mongo               = require("mongodb"),
    mongoose            = require("mongoose"),
    Services            = require("./models/services"),
    User                = require("./models/user"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    seedDb              = require("./seeds");
    http                = require("http");
    ejs                 = require("ejs");


var userRoutes = require("./routes/users");
    serviceRoutes = require("./routes/services");
    authRoutes = require("./routes/index");


  // server =  http.createServer(function (req, res) {
  //       res.writeHead(200, {'Content-Type': 'text/plain'});
  //       res.end('Hello World\n');
  //   }).listen(8080, 'localhost');

    server              = app.listen(8080);
    if(server) {
        /*console.log(server);*/
        console.log("Server Started, buckle yo britches, bitches.");
    }

// seedDb();
mongoose.connect("mongodb://localhost/wtrmln");


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.enable('trust proxy');

app.use(require("express-session")({
    secret: "Secret message iz here!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use(authRoutes);
app.use(userRoutes);
app.use(serviceRoutes);


app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
    // Kill it with fire
var gracefulShutdown = function() {
    console.log("The arsonist has arrived.");
    server.close(function() {
        console.log("Burned the remains.");
        process.exit()
    });

    // if after
    setTimeout(function() {
        console.error("Could not close connections in time, forcefully shutting down");
        process.exit()
    }, 10*1000);
};

// listen for TERM signal .e.g. kill
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);