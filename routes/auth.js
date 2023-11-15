const express = require('express');
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



router.post('/login', (req, res) => {
    console.log(req.session)
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'please provide a mail or password'
            });
        }

        db.query('SELECT * FROM users WHERE mail =?', [email], async(error, results) => {


            console.log(results);
            if (!results || !(password == results[0].password)) {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                })
            } else {

                if (results[0].role == 'Admin') {
                    req.session.isAuth = results[0].id;
                    req.session.isRole = results[0].role;
                    req.session.isName = results[0].name;
                    req.session.email = results[0].email
                    return res.render('dashboard', {
                        results,
                        message: 'welcome to dashboard',
                        Role: req.session.isRole,

                    })
                } else {
                    req.session.isAuth = results[0].id;
                    req.session.isRole = results[0].role;
                    req.session.isName = results[0].name;
                    req.session.email = results[0].email
                    return res.render('index', {
                        results,
                        message: 'welcome to ...',
                        Role: req.session.isRole,

                    })
                }
            }
        })
    } catch (error) {
        console.log(error)
    }

})

router.post('/addArticle', (req, res) => {
    console.log(req.body);

    const { title, about, body, } = req.body;

    db.query('SELECt title FROM articles WHERE title = ?', [title], (error, results) => {

        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.render('addArticle', {
                message: 'Title is already in use'
            });
        }

        db.query('INSERT INTO articles SET ?', { authorName: req.session.isName, authorId: req.session.isAuth, about: about, title: title, body: body }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results)
                return res.render('addArticle', {
                    message: 'Article Posted'
                })
            }
        })
    })


})

router.post('/addUser', (req, res) => {
    console.log(req.body);

    const { name, lastName, otherName, mail, password, role, schoolId } = req.body;

    db.query('SELECt mail FROM users WHERE mail = ?', [mail], (error, results) => {

        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.render('addUser', {
                message: 'email is already in use'
            });
        }

        db.query('INSERT INTO users SET ?', { name: name, lastName: lastName, otherName: otherName, mail: mail, password: password, role: role, schoolId: schoolId}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results)
                return res.render('addUser', {
                    message: 'User Created'
                })
            }
        })
    })


})


router.post('/bookRoom', (req, res) => {
    console.log(req.body);

    const { roomId, purpose, bookingDate, bookingTimeFrom, bookingTimeTo } = req.body;

    db.query('SELECt * FROM rooms WHERE id = ?', [roomId], (error, results) => {

        if (error) {
            console.log(error);
        }

        db.query('INSERT INTO bookings SET ?', { room: results[0].room, roomId: roomId, purpose: purpose, requestedBy: req.session.email, bookingDate: bookingDate, bookingTimeFrom: bookingTimeFrom, bookingTimeTo: bookingTimeTo }, (error, rows) => {
            if (error) {
                console.log(error);
            } else {
                console.log(rows)
                return res.render('bookRoom', {
                    message: 'Booked Succesfully'
                })
            }
        })
    })


})





module.exports = router;