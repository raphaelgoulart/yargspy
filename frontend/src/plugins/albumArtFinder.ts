import axios from 'axios'

export async function albumArtFinder(artist: string, album?: string) {
  if (!artist || !album) return
  return await axios.get('https://ws.audioscrobbler.com/2.0/', {
    params: {
      method: 'album.getInfo',
      format: 'json',
      artist: artist,
      album: album,
      api_key: import.meta.env.VITE_LAST_FM_API_KEY,
    },
  })
}
