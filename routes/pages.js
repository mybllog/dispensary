const express = require("express");
const authC = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const sessionStore = new MySQLStore({}, db);
router.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'itsasecret',
    store: sessionStore,
    cookie: {
        maxAge: 2880000,
        sameSite: true,

    }
}))

router.get('/', (req, res) => {
    res.render("index")
});

router.get("/order", (req, res) => {
    res.render("order")
});


router.get("/login", authC.redirectHome, (req, res) => {
    res.render("login")
});

router.get('/signup', (req, res) => {
    res.render('signup')
});

router.get('/register', (req, res) => {
    res.render('register')
});

router.get('/orders', authC.redirectLogin, (req, res) => {
    res.render('orders')
});

router.get('/addUser', (req, res) => {
    res.render('addUser')
});

router.get('/users', authC.redirectLogin, authC.authRole('Admin'), authC.users, (req, res) => {
    res.render('users')
});

router.get('/myOrder', authC.redirectLogin, authC.rooms, (req, res) => {
    res.render('')
});


router.get('/dashboard', authC.redirectLogin, authC.authRole('Admin'), (req, res, ) => {

    db.query('SELECT * FROM users WHERE id =? ', [req.session.isAuth], (error, results) => {
        if (error) {
            console.log(error);

        } else {
            return res.render('dashboard', {
                results
            })
        }

    })


});

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.redirect('/')
        }
        res.clearCookie()
        res.redirect('/login')
    })

})



module.exports = router;