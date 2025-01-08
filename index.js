import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import pg from 'pg';

const app = express();
const PORT = 3000;

// Postgres
const db = new pg.Client({
  user: 'postgres',
  password: 'adminpass',
  host: 'localhost',
  database: "world",
  port: 5432,
})
db.connect();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

// Custom function
async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach(country => {
    countries.push(country.country_code);
  });

  return countries;
}

// Routes

// GET
app.get('/', async (req, res) => {
  const countries = await checkVisited();
  res.render('index.ejs', { countries: countries, total: countries.length });
});

// POST
app.post('/add', async (req, res) => {
  // User input
  const countryInput = req.body.country;

  try {
    const result = await db.query(
      "SELECT country_code from countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';", [countryInput.toLowerCase()]);
      
      const data = result.rows[0];
      const countryCode = data.country_code;

      try {
        // Inserting the new value to the visited_countries table
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
        res.redirect('/');

      } catch (error) {
        console.log(error);
        const countries = await checkVisited();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length, 
          error: "Country has already been added, try again.",
        })
      }
    
  } catch (error) {
    console.log(error)
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    })
  }

});

app.listen(PORT, () => {
  console.log(`The server is running in port ${PORT}`);
});