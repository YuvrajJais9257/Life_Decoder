//necessary imports
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');//to retain a memory of user-session
const bcrypt = require('bcrypt');
const _ = require('lodash');//to handle cases
//Design user and their posts according to schema
const Post = require('./models/post');
const User = require('./models/user');

const posts = [];

const port = process.env.PORT || 3000;
const app = express();
//Owner Info
const home = `
${'Yuvraj Jaiswal,'}
${'Student: @GalgotiasCollegeOfEngineeringAndTechnology'}
${'B-Tech: ComputerScienceAndEngineering(Artificial Intelligence)'}
`;

const about = `
About Me: A motivated computer science engineering student 
pursuing a B.Tech/B.E. degree in Computer Science & Engineering 
from Galgotias College of Engineering and Technology.

Aspiring FrontEnd Web Developer.
`;
const contact = `
Email: <i class="fas fa-envelope"></i> quicksilver92571331@gmail.com
Mobile No. : <i class="fas fa-phone"></i> (+91)7838379576
`;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogtDB';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//to render .ejs files:
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));

//create a user-session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

//authentication purposes
function checkAuthentication(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

function checkNotAuthentication(req, res, next) {
    if (!req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
}

// to show posts only if they enter right password
app.get('/', checkAuthentication, async function (req, res) {
    try {
        const posts = await Post.find();
        res.render('home', { posts: posts, home:home });
    } catch (error) {
        console.error(error);
        res.render('home', { posts: [], home:home });
    }
});

app.get('/login', checkNotAuthentication, function (req, res) {
    res.render('login', { message: '' });
});

app.get('/compose', checkAuthentication, function (req, res) {
    res.render('compose');
});

//to render posts
app.post("/compose", checkAuthentication, async function (req, res) {
    const post = new Post({
        title: req.body.postTitle,
        entry: req.body.postEntry
    });

    try {
        await post.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('compose', { message: 'An error occurred. Please try again.' });
    }
});

app.get('/about', function (req, res) {
    res.render('about', { content: about });
});

app.get('/contact', function (req, res) {
    res.render('contact', { content: contact });
});

app.get('/search', function (req, res) {
    const searchQuery = req.query.search.toLowerCase();
    const searchResults = posts.filter(post => _.toLower(post.title).includes(searchQuery));
    res.render('search', { searchResults: searchResults, posts: posts });
});

app.get('/post/:index', function (req, res) {
    const index = req.params.index;
    if (index >= 0 && index < posts.length) {
        const post = posts[index];
        res.render('post', { post: post });
    } else {
        res.redirect('/');
    }
});

app.post('/login', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await User.findOne({ username: username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.isAuthenticated = true;
            req.session.username = username;
            res.redirect('/');
        } else {
            res.render('login', { message: 'Unable to access content. Invalid username or password' })
        }
    }
    catch (error) {
        console.error(error);
        res.render('login', { message: 'An error occurred. Please try again.' });
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/login');
    });
});

app.get('/create-user', checkNotAuthentication, function (req, res) {
    res.render('create-user', { message: '' });
});

app.post('/create-user', checkNotAuthentication, async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            res.render('create-user', { message: 'Username already exists. Please choose a different one.' });
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username: username,
                password: hashedPassword,
            });

            await newUser.save();
            req.session.isAuthenticated = true;
            req.session.username = username;
            res.redirect('/');
        }
    }
    catch (error) {
        console.error(error);
        res.render('create-user', { message: 'An error occurred. Please try again.' });
    }
});

app.listen(port, function () {
    console.log(`Server started on port ${port}!`);
});
