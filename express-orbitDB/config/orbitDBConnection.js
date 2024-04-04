import {LevelBlockstore} from "blockstore-level";
import {createLibp2p} from "libp2p";
import {createHelia} from "helia";
import {createOrbitDB} from "@orbitdb/core";
import {Libp2pOptions} from "./libp2p.js";
import 'dotenv/config';

class OrbitDBSingleton {
    constructor() {
        if (!OrbitDBSingleton.instance) {
            this.generateInstance().then(() => {
                OrbitDBSingleton.instance = this;
            });

        }
        return OrbitDBSingleton.instance;
    }

    async generateInstance() {
        const blockstore = new LevelBlockstore('./ipfs')
        const libp2p = await createLibp2p(Libp2pOptions)

        const ipfs = await createHelia({ libp2p, blockstore })
        this.orbitdb = await createOrbitDB({ ipfs })
    }

    async getDB(name=process.env.ORBIT_DB_NAME, type="documents") {
        const db = await this.orbitdb.open(name, {type});
        return db;
    }
}

export const orbitDB = new OrbitDBSingleton();
