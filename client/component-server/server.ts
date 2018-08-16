import {
  UniversalComponentServer,
} from 'universal-component-server'

import * as express from 'express'
import ucsConfig from './config'


const ucsServer = new UniversalComponentServer(
  ucsConfig,
  {
    scripts: ['/WWAComponents.client.js'],
    stylesheets: ['/app.css'],
  }
)

ucsServer.configApp((app) => {
  app.use('/', express.static(__dirname))
})
ucsServer.runServer()
