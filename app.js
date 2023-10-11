const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const dotenv = require('dotenv');
const https = require('https');
const _ = require('lodash');
const port = process.env.PORT || 3000;
const app=express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const home='I am Yuvraj Jaiswal, student@galgotiaCollegeOfEngineeringAndTechnology pursuing B.Tech In ComputerScienceAndEngineering(Artificial Intelligence) Email: quicksilver92571331@gmail.com Mobile No. : (+91)7838379576';
const about='I am a motivated computer science engineering student pursuing a B.Tech/B.E. degree in Computer Science & Engineering from Galgotias College of Engineering and Technology. With a strong academic background and proficiency in FrontEnd Web Development, I have developed projects such as an e-commerce website, a Weather Forecasting App using OpenWeatherMap API, a Landing Page similar to Netflix Streaming App Service, Portfolio Website, and a quiz app. I have completed certifications in Machine Learning, Java Data Structures and Algorithms, Artificial Intelligence Foundation, and Cloud Computing Foundation. I have done Internships at CodSoft, InternPe, BharatIntern, and CodeClause.Eager to gain practical experience, I am actively seeking job opportunities to contribute my technical skills and expand my knowledge.';
const contact='Email: quicksilver92571331@gmail.com Mobile No. : (+91)7838379576';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'));

let posts=[];
let userIsAuthenticated = false;

app.get('/', function(req, res){
    res.render('home', { content: home, posts: posts, userIsAuthenticated: userIsAuthenticated });
});

app.get('/compose', function(req, res){
    res.render("compose", { posts: posts });
})

app.get('/about', function(req, res){
    res.render('about', { content: about, userIsAuthenticated: userIsAuthenticated });
});

app.get('/contact', function(req, res){
    res.render('contact', { content: contact });
});

app.get('/search', function (req, res) {
    const searchQuery = req.query.search.toLowerCase();
    const searchResults = posts.filter(post => _.toLower(post.title).includes(searchQuery));
    res.render('search', { searchResults: searchResults, posts: posts});
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

app.post("/compose", function(req, res){
    const post={
        title:req.body.postTitle,
        entry:req.body.postEntry
    };
    posts.push(post);
    res.redirect("/");
});

app.post('/login', function (req, res) {
    const password = req.body.password;

    if (password === process.env.PASSWORD) {
        userIsAuthenticated = true;
    }

    res.redirect('/');
});

app.listen(port, function () {
    console.log(`Server started on port ${port}!`);
});
