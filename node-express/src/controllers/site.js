const express = require('express');
const { Profile, Access, ObjectUnit} = require('../models');
const logger = require('../utilities/logger.js');
const path = require('path');
const fs = require('fs');

async function getSitesData(req, res) {
  const clientName = req.query.client;

  if (!clientName) {
    logger.warn('Client parameter is missing');
    return res.status(400).send("Parameter 'client' is required.");
  }

  try {
    const profile = await Profile.findOne({ where: { profilename: clientName } });
    if (!profile) {
      return res.status(404).send("Profile not found.");
    }

    const sites = await ObjectUnit.findAll({
      where: {
        profile_id: profile.id_profile,
        level: 'Site'
      },
      attributes: [
        'name'
      ],
    })

    return res.json(sites.map(site => site.name));
  } catch (error) {
    logger.error('Error getting client data', { clientName, error });
    return res.status(500).send('Internal server error.');
  }
};

module.exports = { getSitesData };
