import os from "os";
import fs from "fs";
import path from "path";




export function setUser(user: string) {
    let config = readConfig()
    config.currentUserName = user

    const cfg = { current_user_name: user, db_url: config.dbUrl }
    const config_json = JSON.stringify(cfg, null, 2)
    fs.writeFileSync(getConfigPath(), config_json, { encoding: "utf-8" })
    return config
}

export function readConfig(): Config {
    let data = fs.readFileSync(getConfigPath(), "utf-8")

    //console.log(JSON.parse(data))
    return validateConfig(JSON.parse(data.toString()))
}



function getConfigPath() {
    return path.join(os.homedir(), ".gatorconfig.json")
}

function validateConfig(cfg: any): Config {
    let config: Config = { currentUserName: cfg.current_user_name, dbUrl: cfg.db_url }
    return config
}

export type Config = {
    dbUrl: string
    currentUserName: string
}