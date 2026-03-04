import axios from 'axios'
import fs from 'fs'

async function baixarAudio() {
  const urlApi = 'https://hyperaemic-teodora-televisional.ngrok-free.dev/download'
  const mp3Url = 'https://www.youtube.com/watch?v=qqK1FrO3BdM'

  try {
    const response = await axios.post(
      urlApi,
      { url: mp3Url },
      { responseType: 'arraybuffer' } // importante pra receber o arquivo
    )

    // salva localmente
    fs.writeFileSync('audio.mp3', response.data)
    console.log('Arquivo salvo com sucesso!')
  } catch (err) {
    console.error('Erro ao baixar o áudio:', err)
  }
}

baixarAudio()