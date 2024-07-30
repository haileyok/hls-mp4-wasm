import React from 'react'
import './App.css'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

function App() {
  const [isError, setIsError] = React.useState<boolean>(false)
  const [mp4, setMp4] = React.useState()

  const ffmpegRef = React.useRef(new FFmpeg())

  const [message, setMessage] = React.useState('')

  const load = React.useCallback(async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    const ffmpeg = ffmpegRef.current

    ffmpeg.on('log', ({ message }) => {
      console.log(message)
      setMessage(message)
    })

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
  }, [])

  const convert = React.useCallback(async (videoUrl: string) => {
    const ffmpeg = ffmpegRef.current

    ffmpeg.exec(['-i', `"${videoUrl}"`, '-codec', 'copy', 'output.mp4'])

    const mp4Data = await ffmpeg.readFile('output.mp4')

    console.log(mp4Data)

    setMessage('done')
  }, [])

  React.useEffect(() => {
    const url = new URL(window.location.href)
    const videoUrl = url.searchParams.get('videoUrl')
    
    if (!videoUrl) {
      setIsError(true)
    } else {
      ;(async () => {
        await load()
        const mp4Res = await convert(videoUrl)
        console.log(mp4Res)
        setMp4(mp4Res)
      })()
    }
  }, [load])

  return (
    <div>
      <p>message: {message}</p>
      {isError ? <p>Error!</p> : null}
    </div>
  )
}

export default App
