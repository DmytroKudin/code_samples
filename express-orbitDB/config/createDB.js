import { createHelia } from 'helia'
import {createOrbitDB, Documents, OrbitDBAccessController} from '@orbitdb/core'
import { createLibp2p } from 'libp2p'
import { identify } from '@libp2p/identify'
import { mdns } from '@libp2p/mdns'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { LevelBlockstore } from 'blockstore-level'

const libp2pOptions = {
    peerDiscovery: [
        mdns()
    ],
    addresses: {
        listen: [
            '/ip4/0.0.0.0/tcp/0'
        ]
    },
    transports: [
        tcp()
    ],
    connectionEncryption: [
        noise()
    ],
    streamMuxers: [
        yamux()
    ],
    services: {
        identify: identify(),
        pubsub: gossipsub({ emitSelf: true })
    }
}

const id = process.argv.length > 2 ? 2 : 1

const blockstore = new LevelBlockstore(`./ipfs/${id}`)

const libp2p = await createLibp2p(libp2pOptions)

const ipfs = await createHelia({ libp2p, blockstore })

export const orbitdb = await createOrbitDB({ ipfs, id: `nodejs-${id}`, directory: `./orbitdb/${id}` })

let db

if (process.argv.length > 2) {
    const remoteDBAddress = process.argv.pop()
    db = await orbitdb.open(remoteDBAddress)
    await db.add(`hello world from peer ${id}`)

    for await (const res of db.iterator()) {
        console.log(res)
    }
} else {
    const name = process.env.ORBIT_DB_NAME
    const type="documents"
    db = await orbitdb.open(name, { Database: Documents({ indexBy: 'id'} )}, type)
    await db.put({ id: 'test', name: 'test1' })
    db.events.on('update', event => {
        console.log('update_', event)
    })
}
process.on('SIGINT', async () => {
    // print the final state of the db.
    console.log((await db.all()).map(e => e.value),'sign')
    // Close your db and stop OrbitDB and IPFS.
    await db.close()
    await orbitdb.stop()
    await ipfs.stop()

    process.exit()
})
