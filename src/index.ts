import { createApp } from './app'

createApp()
    .then((app) => {
        app.listen(8080, () => {
            console.log('Listening on http://localhost:8080')
        })
    })
    .catch((err) => {
        console.error(`Error: ${err}`)
    })
