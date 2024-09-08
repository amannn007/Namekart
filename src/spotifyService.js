// src/spotifyService.js
import axios from 'axios';

const CLIENT_ID = 'f1078df003f741108ce5984899d0100a'; // Replace with your actual Spotify client ID
const CLIENT_SECRET = '9f89182560824a3c8b0c330bedb29fe1'; // Replace with your actual Spotify client secret
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Get access token from Spotify
const getAccessToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const headers = {
        headers: {
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        const response = await axios.post(SPOTIFY_TOKEN_URL, params, headers);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token', error);
    }
};

// Fetch albums or tracks from Spotify
export const fetchSpotifyData = async (type, query) => {
    const token = await getAccessToken();
    const url = `${SPOTIFY_API_URL}/search?q=${query}&type=${type}&limit=10`;

    const headers = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    try {
        const response = await axios.get(url, headers);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from Spotify', error);
    }
};
