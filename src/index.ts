import { createApp } from './app'
import config from '@/config'

createApp()
    .then((app) => {
        app.listen(config.port, () => {
            console.log(`Listening on http://localhost:${config.port}`)
        })
    })
    .catch((err) => {
        console.error(`Error: ${err}`)
    })
