const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use('/amwali', express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const server = app.listen(3000, async () => {
  console.log('Server running on 3000');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000/amwali/', { waitUntil: 'networkidle0' });
  
  await browser.close();
  server.close();
});
