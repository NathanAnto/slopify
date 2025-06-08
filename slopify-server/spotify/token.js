import axios from "axios"

export const getSpotifyAccessToken = async () => {
    const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
            grant_type: "client_credentials"
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
            }
        }
    );

    if (response.status !== 200) {
        throw new Error("Failed to fetch Spotify access token");
    }

    return response.data.access_token;
}