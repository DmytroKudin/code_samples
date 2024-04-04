import express from "express";
import {getNFTInfo, setNFTInfo, getNFTInfoByKey} from "../controllers/nftController.js";


const router = express.Router()

router.route('/nft/:address').get(getNFTInfo)
router.route('/nft/:address/:key').get(getNFTInfoByKey)
router.route('/nft').post(setNFTInfo)

export default router
