const
 createError = require('http-errors'),
 express = require('express'),
 path = require('path'),
 cookieParser = require('cookie-parser'),
 logger = require('morgan'),
 classesController = require('./controllers/classesController'),
 skillsController = require('./controllers/skillsController'),
 evidenceController = require('./controllers/evidenceController'),
 studentsController = require('./controllers/studentsController'),
 usersController = require('./controllers/usersController'),
 session = require("express-session"),
 bodyParser = require("body-parser"),
 User = require( './models/User' ),
 flash = require('connect-flash')

const Skill = require( './models/Skill' );


 var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  // here we set up authentication with passport
  const passport = require('passport')
  const configPassport = require('./config/passport')
  configPassport(passport)


var app = express();

app.locals._ = require("underscore");
//app.locals._.uniq = require("underscore.unique");
console.log("\nunderscore = "+app.locals._)
console.log("uniq = "+app.locals._.uniq)

var taList = [
      "csjbs2018@gmail.com", // usual password!
          "vanio@brandeis.edu",
       "tjhickey@brandeis.edu",
   "katherinezyb@brandeis.edu",
      "yaeleiger@brandeis.edu",
       "rlederer@brandeis.edu",
          "aramk@brandeis.edu",
  "venusyixinsun@brandeis.edu",
            "lxt@brandeis.edu",
        "zqhuang@brandeis.edu",
        "mdodell@brandeis.edu",
  "luisandinojr1@brandeis.edu",
   "jerrypeng666@brandeis.edu",
    "irvingperez@brandeis.edu",
        "chungek@brandeis.edu",
       "zepenghu@brandeis.edu"
]

// skillsRouter = require('./routes/skills'),
const mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/skillmastery' );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!")
});

var app = express();

// here is where we connect to the database!


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//middleware to process the req object and make it more useful!
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'zzbbyanana' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

// this handles all static routes ...
// so don't name your routes so they conflict with the public folders
app.use(express.static(path.join(__dirname, 'public')));

const approvedLogins = ["tjhickey724@gmail.com","csjbs2018@gmail.com"];

// here is where we check on their logged in status
app.use((req,res,next) => {
  res.locals.loggedIn = false
  if (req.isAuthenticated()){
    if (req.user.googleemail.endsWith("@brandeis.edu") ||
          approvedLogins.includes(req.user.googleemail))
          {
            console.log("user has been Authenticated")
            res.locals.user = req.user
            res.locals.loggedIn = true
          }
    else {
      res.locals.loggedIn = false
    }
    if (req.session.classV){
      res.locals.classV=req.session.classV
      res.locals.classId = req.session.classV._id
    } else {
      res.locals.classV = ""
    }
    if (req.user){
      if (req.user.googleemail=='tjhickey@brandeis.edu'){
        console.log("Owner has logged in")
        res.locals.status = 'teacher'
      } else if (taList.includes(req.user.googleemail)){
        console.log("A TA has logged in")
        res.locals.status = 'ta'
      }else {
        console.log('student has logged in')
        res.locals.status = 'student'
      }
    }
  }
  next()
})



// here are the authentication routes

app.get('/loginerror', function(req,res){
  res.render('loginerror',{})
})

app.get('/login', function(req,res){
  res.render('login',{})
})



// route for logging out
app.get('/logout', function(req, res) {
        req.session.destroy((error)=>{console.log("Error in destroying session: "+error)});
        console.log("session has been destroyed")
        req.logout();
        res.redirect('/');
    });


// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));


app.get('/login/authorized',
        passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/loginerror'
        })
      );


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    console.log("checking to see if they are authenticated!")
    // if user is authenticated in the session, carry on
    res.locals.loggedIn = false
    if (req.isAuthenticated()){
      console.log("user has been Authenticated")
      res.locals.loggedIn = true
      return next();
    } else {
      console.log("user has not been authenticated...")
      res.redirect('/login');
    }
}

// we require them to be logged in to see their profile
app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile')/*, {
            user : req.user // get the user out of session and pass to template
        });*/
    });

app.post('/enroll',classesController.lookupClass,classesController.addClass);
app.get('/class/:pin',classesController.selectClass);


app.get('/classes', classesController.getAllClasses );
app.post('/saveClass',
          classesController.checkUnique,
          classesController.saveClass );
app.post('/deleteClass', classesController.deleteClass );
// here are our regular app routes ...
// we require them to be logged in to access the skills page
app.get('/skills', skillsController.getAllSkills );
app.post('/saveSkill', isLoggedIn, skillsController.saveSkill );
app.post('/deleteSkill', isLoggedIn, skillsController.deleteSkill );
app.post('/skill', (req,res)=> {
  console.log('in /skill')
  console.dir(req.body.skill)
  Skill.findOne({name:req.body.skill})
    .exec()
    .then((skill) =>{
      console.log("in Skill finder")
      console.dir(skill)
      res.json("Cut/Paste code which demonstrates the following skill(s):<br><br>"+skill.description)
    })
})
//app.get('/evidenceItem/:id',evidenceController.getEvidenceItem );
app.get('/evidenceItem/:id',
          skillsController.attachSkills,
          evidenceController.getEvidenceItem );

app.get('/evidence',
         skillsController.attachSkills,
         evidenceController.attachTAData,
         evidenceController.getAllUngradedEvidence );

app.post('/saveEvidence', isLoggedIn, evidenceController.saveEvidence );
app.post('/deleteEvidence', isLoggedIn, evidenceController.deleteEvidence );
app.post('/taReview',  evidenceController.updateEvidence );

app.get('/users',usersController.getAllUsers)
app.get('/users/:id',
        usersController.attachUser,
        evidenceController.attachEvidence,
        usersController.getUser)
app.get('/usersByEmail/:id',
        usersController.attachUserByEmail,
        evidenceController.attachEvidence,
        (req,res)=>{res.render("user")}
       )
app.post('/updateTA',usersController.updateTA)

app.get('/dashboard',usersController.getDashboard)
app.get('/dashboard2',
            evidenceController.attachTAData,
            usersController.getDashboard2)


app.use('/', classesController.attachClasses,function(req, res, next) {
  console.log("in / controller")
  res.render('index', { title: 'Skills Mastery App' });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log("\n\nin arity/4 app.use!\n\n")
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
