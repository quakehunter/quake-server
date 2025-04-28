const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite'); // Ekstra paket

const app = express();
const PORT = 3000;

app.get('/kandilli', async (req, res) => {
  try {
    const response = await axios.get('http://www.koeri.boun.edu.tr/scripts/lst7.asp', {
      responseType: 'arraybuffer'
    });

    const html = iconv.decode(response.data, 'windows-1254'); // Türkçe karakterleri çöz
    const $ = cheerio.load(html);

    let earthquakes = [];

    $('pre').each((index, element) => {
      const text = $(element).text();
      const lines = text.split('\n').slice(6);

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 7) {
          const magnitude = parseFloat(parts[5]);
          earthquakes.push({
            date: parts[0],
            time: parts[1],
            latitude: parts[2],
            longitude: parts[3],
            depth: parts[4],
            magnitude: isNaN(magnitude) ? 'Bilinmiyor' : magnitude.toString(),
            location: parts.slice(6).join(' ')
          });
        }
      });
    });

    res.json(earthquakes);
  } catch (error) {
    console.error('Kandilli verisi çekilemedi:', error.message);
    res.status(500).json({ error: 'Veri çekilemedi' });
  }
});

app.get('/', (req, res) => {
  res.send('Deprem Scraper Sunucusu çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`🌍 Scraper Server çalışıyor: http://localhost:${PORT}`);
});
