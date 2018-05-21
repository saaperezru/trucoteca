const IPFS = require('ipfs-api')
const OrbitDB = require('orbit-db')
const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'})
const orbitdb = new OrbitDB(ipfs)
const Cache = require('orbit-db-cache')
const orbitDbDefaultConfig = {
    replicate: false,
    write: ['*']
}
async function createRoom(name, offer){
    const store = await orbitdb.keyvalue(name, orbitDbDefaultConfig)
    await store.put('name', name)
    await store.put('offer', offer)
    const snapshot = await store.saveSnapshot() 
    console.log(snapshot[0])
    return snapshot[0]
}
async function read(snapshot){
    const store = await orbitdb.open(snapshot.path, orbitDbDefaultConfig)
    store._cache.set('snapshot', snapshot)
    store.loadFromSnapshot()
    store.events.on('ready', async () => {
        const name = await store.get('name')
        const offer = await store.get('offer')
        console.log(name, offer)
    })
}


createRoom('trucoteca.room1', 'mySdpOffer').then((addr)=> read(addr))
