import express from 'express';
import axios from 'axios';
import { formatGeniusQuery } from '../utils/textCleaner.js';

const router = express.Router();

router.get('/search', async (req, res) => {
    try {
        const { title, artist } = req.query;

        if (!title || !artist) {
            return res.status(400).json({ status: 'error', mensaje: 'Faltan parámetros' });
        }

        const searchQuery = formatGeniusQuery(title, artist);

        const response = await axios.get(`https://api.genius.com/search`, {
            params: { q: searchQuery },
            headers: {
                Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
            }
        });

        const hits = response.data.response.hits;

        if (hits.length === 0) {
            return res.status(404).json({ status: 'error', mensaje: 'Letra no encontrada' });
        }

        const bestMatch = hits[0].result;

        res.status(200).json({
            status: 'ok',
            data: {
                id: bestMatch.id,
                title: bestMatch.title,
                artist: bestMatch.primary_artist.name,
                url: bestMatch.url,
                image: bestMatch.song_art_image_thumbnail_url
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', mensaje: 'Error interno conectando con Genius' });
    }
});

export default router;