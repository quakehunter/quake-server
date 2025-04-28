const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Kandilli verisini çekme
app.get('/kandilli', async (req, res) => {
  try {
    const response = await axios.get('http://www.koeri.boun.edu.tr/scripts/lst7.asp', {
      responseType: 'arraybuffer',
      reponseEncoding: 'binary'
    });
    const html = response.data.toString('latin1'); // Türkçe karakter desteği
    const $ = cheerio.load(html);

    let earthquakes = [];

    $('pre').each((index, element) => {
      const text = $(element).text();
      const lines = text.split('\n').slice(6); // İlk 6 satırı atla (başlıklar)

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 7) {
          let magnitude = parts[5];
          if (magnitude.includes('-.-')) magnitude = 'Bilinmiyor'; // Magnitude yoksa

          earthquakes.push({
            date: parts[0],
            time: parts[1],
            latitude: parts[2],
            longitude: parts[3],
            depth: parts[4],
            magnitude: magnitude,
            location: parts.slice(6).join(' ').replace(/İ̇/g, 'İ') // Bozuk harf düzeltmesi
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

// Sağlık kontrolü
app.get('/', (req, res) => {
  res.send('Deprem Scraper Sunucusu çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`🌍 Scraper Server çalışıyor: http://localhost:${PORT}`);
});
