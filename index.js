const spawn = require('child_process').spawn
const AgonesSDK = require('@google-cloud/agones-sdk')

const SIDECAR_PREFIX = 'AGONES | '
const CSGO_PREFIX    = 'SERVER | '

const READY_LOG_MESSAGE = 'Host_NewGame on map'

let isReady = false
let agonesSDK = new AgonesSDK()

main()

async function main() {

    // Initialiser la connexion à Agones
    console.log(SIDECAR_PREFIX + 'Connecting to Agones...')
    await agonesSDK.connect()
    console.log(SIDECAR_PREFIX + '...connected to Agones')

    // Synchroniser les infos Agones avec la config du serveur
    console.log(SIDECAR_PREFIX + 'Configuring Agones environment...')

    // Récupération des infos de l'instance
    const gameServerInfos = await agonesSDK.getGameServer()
    const ip = gameServerInfos.status.address
    const port = gameServerInfos.status.portsList.find((p) => (p.name === 'game')).port
    const portTv = gameServerInfos.status.portsList.find((p) => (p.name === 'gotv')).port
    // process.env.IP = ip
    process.env.PORT = port
    process.env.TV_PORT = portTv

    console.log(SIDECAR_PREFIX + '...Agones environment configured')

    // Démarrer le serveur CSGO
    console.log(SIDECAR_PREFIX + 'Starting CSGO server on ' + ip + ':' + port + '...')
    const child = spawn(process.env.STEAM_DIR + '/start.sh')

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', function(data) {
        console.log(CSGO_PREFIX + data)

        const logs = data.toString()

        if(logs.includes(READY_LOG_MESSAGE)) {
            // Indiquer à agones que le serveur est prêt à recevoir des joueurs
            isReady = true
            agonesSDK.ready()
            console.log(CSGO_PREFIX + 'CSGO SERVER IS READY')
        }
    })

    child.stderr.setEncoding('utf8')
    child.stderr.on('data', function(data) {
        console.log(CSGO_PREFIX + 'ERROR | ' + data)
    })

    child.on('close', function(code) {
        console.log(CSGO_PREFIX + 'EXIT CODE | ' + code)
    })

    // Faire des health checks en boucle
    setInterval(doHealthChecks, 3000)
}

function doHealthChecks() {
    if(isReady) {
        agonesSDK.health()
    }
}
