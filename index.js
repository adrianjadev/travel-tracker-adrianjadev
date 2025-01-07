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

// Routes
app.get('/', async (req, res) => {

  let countries = []

  const result = await db.query("SELECT country_code FROM visited_countries");
  result.rows.forEach(country => {
    countries.push(country.country_code);
  });
  
  console.log(result.rows);
  res.render("index.ejs", { countries: countries, total: countries.length });
  // db.end();
});

app.listen(PORT, () => {
  console.log(`The server is running in port ${PORT}`);
});