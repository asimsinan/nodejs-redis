const express = require('express');
const app = express() 

const fetch = require("node-fetch");
const redis = require('redis');
 
 //Redis istemcisine bağlan
const redisClient = redis.createClient(6379); 
 
// hataları konsola yaz
redisClient.on('error', (err) => {
    console.log("Hata: " + err)
});
 
// kullanıcı listesini getir
app.get('/dersler', (req, res) => {
    const derslerRedisKey = 'dersler:ogrenciler';
    // Try fetching the result from Redis first in case we have it cached
    return redisClient.get(derslerRedisKey, (err, dersler) => {
 
        // anahtar rediste varsa
        if (dersler) {
            console.log('veriler önbellekten getiriliyor...');
            return res.json({ kaynak: 'önbellek', veri: JSON.parse(dersler)})
 
        } else { // anahtar rediste yoksa
            console.log('veriler apiden getiriliyor...');
            // Fetch directly from remote api
            fetch('https://my-json-server.typicode.com/asimsinan/demo/db')
                .then(response => response.json())
                .then(dersler => {
                    // API cevabını Rediste tut, verinin son kullanım süresini 5 saniye olarak ayarla
                    redisClient.setex(derslerRedisKey, 5, JSON.stringify(dersler))
 
                    // Send JSON response to redisClient
                    return res.json({ kaynak: 'api', veri: dersler })
 
                })
                .catch(error => {
                    // hatayı yaz
                    console.log(error)
                    // hatayı istemciye gönder
                    return res.json(error.toString())
                })
        }
    });
});
app.listen(3000, () => {
    console.log('Sunucu dinliyor. Port:', 3000)
});