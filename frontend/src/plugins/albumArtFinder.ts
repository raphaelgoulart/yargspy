import axios from 'axios'

export async function albumArtFinder(
  name: string,
  artist: string,
  charter?: string,
  album?: string,
) {
  const regex = /(<color="?#?\w+"?>)|(<\/color>)/g
  name = name.replace(regex, '')
  artist = artist.replace(regex, '')
  if (charter) charter = charter.replace(regex, '')
  if (album) album = album.replace(regex, '')
  if (name && artist && charter) {
    try {
      const result = await axios.post('https://api.enchor.us/album-art', {
        name,
        artist,
        charter,
      })
      return result.data
    } catch {}
  }
  if (!artist || !album) return
  const result = await axios.get('https://ws.audioscrobbler.com/2.0/', {
    params: {
      method: 'album.getInfo',
      format: 'json',
      artist: artist,
      album: album,
      api_key: import.meta.env.VITE_LAST_FM_API_KEY,
    },
  })
  if (result && result.data) {
    if (result.data.album.image[2]['#text']) return result.data.album.image[2]['#text']
  }
}
