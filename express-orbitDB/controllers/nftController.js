import {StatusCodes} from "http-status-codes";
import {orbitDB} from "../config/orbitDBConnection.js";
import {orbitdb} from "../config/createDB.js";
import {OrbitDBAccessController} from "@orbitdb/core";


export const getNFTInfo = async (req, res)=> {
    try {
        const address = req.params.address
        const db = await orbitDB.getDB(`/orbitdb/${address}`);
        res.status(StatusCodes.OK).json(await db.all())
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e })
    }
}
export const getNFTInfoByKey = async (req, res)=> {
    try {
        const address = req.params.address
        const key = req.params.key
        const db = await orbitDB.getDB(`/orbitdb/${address}`);
        res.status(StatusCodes.OK).json(await db.get(key))
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e })
    }
}

export const setNFTInfo = async (req, res)=> {
    const {nftMetadata} = req.body
    try {
        const db = await orbitdb.open('/orbitdb/zdpuAvVJjv9sC2yQNeBnXcqDhBphR4Gn2N3Fz31vDznAeq8YW')
        await db.put(nftMetadata);
        res.status(StatusCodes.OK).json(await db.all())
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: e })
    }
}
