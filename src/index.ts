
import * as config from "./config.js";
import fs from "fs";
import os from "os";
import path from "path";
import { exit } from "process";
import { createUser, deleteAllUsers, getUserById, getUserByName, getUsers } from "./db/queries/users.js";
import { fetchFeed } from "./rss.js";
import { createFeed, getFeedByUrl, getFeeds } from "./db/queries/feeds.js";
import { Feed, User } from "./db/schema.js";
import { createFeedFollow, getFeedFollowsForUser } from "./db/queries/feed_follows.js";









async function main() {

    let registry: CommandsRegistry = {}
    registerCommand(registry, "login", handlerLogin)
    registerCommand(registry, "register", handlerRegister)
    registerCommand(registry, "reset", handlerReset)
    registerCommand(registry, "users", handlerUsers)
    registerCommand(registry, "agg", handlerAggregate)
    registerCommand(registry, "addfeed", handlerAddFeed)
    registerCommand(registry, "feeds", handlerFeeds)
    registerCommand(registry, "follow", handlerFollow)
    registerCommand(registry, "following", handlerFollowing)

    let args = process.argv.slice(2,)
    if (args.length == 0) {
        console.log("Requires at least 1 argument to specify the command to execute")
        exit(1)
    } else if (args.length == 1) {
        await runCommand(registry, args[0])
    } else {
        await runCommand(registry, args[0], ...args.slice(1,))
    }

    process.exit(0)

}

await main();



type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {

    registry[cmdName] = handler

}
async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    let cmd = registry[cmdName]
    if (!cmd) {
        throw Error("Oops, no command!")
    }
    await cmd(cmdName, ...args)
}



async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length == 0) {
        console.log("Login requires username")
        exit(1)
    }
    const name = args[0]
    const user = await getUserByName(name)
    if (!user) {
        throw new Error("User " + name + " does not exist")
    }

    config.setUser(args[0])

}

async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length == 0) {
        console.log("Registration requires username")
        exit(1)
    }
    const name = args[0]
    const usr = await getUserByName(name)
    if (usr) {
        throw new Error(`User ${name} already exists`)
    }

    const user = await createUser(name)
    if (!user) {
        throw new Error(`Failed to create user`)
    }
    config.setUser(name)
    console.log("User successfully created!")
    console.log(user)

}

async function handlerReset(cmdName: string, ...args: string[]) {
    await deleteAllUsers()

}

async function handlerUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers()
    const currentUser = await config.readConfig().currentUserName
    for (let user of users) {
        if (user.name == currentUser) {
            console.log(`* ${user.name} (current)`)
            continue
        }
        console.log(`* ${user.name}`)
    }
}

async function handlerAggregate(cmdName: string, ...args: string[]) {

    let feed = await fetchFeed("https://www.wagslane.dev/index.xml")
    console.log(JSON.stringify(feed, null, 2))


}

async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length != 2) {
        console.log("This command takes exactly 2 arguments: name and url")
        exit(1)
    }
    const name = args[0]
    const url = args[1]
    const usr = await getUserByName(config.readConfig().currentUserName)
    const feedEntry = await createFeed(name, url, usr.id)
    console.log(feedEntry)
    await handlerFollow("follow", url)


}

async function handlerFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds()
    for (const feed of feeds) {
        let user = await getUserById(feed.user_id)
        console.log(feed, user)

    }



}

async function handlerFollow(cmdName: string, ...args: string[]) {
    if (args.length != 1) {
        console.log("This command takes exactly 1 argument: url of the feed to be followed")
        exit(1)
    }
    const feed = await getFeedByUrl(args[0])
    const user = await getUserByName(await config.readConfig().currentUserName)
    const feed_follow = await createFeedFollow(user.id, feed.id)
    console.log(`Username: ${feed_follow.users.name}, Feed name: ${feed_follow.feeds.name}`)

}

async function handlerFollowing(cmdName: string, ...args: string[]) {
    /*if (args.length != 1) {
        console.log("This command takes exactly 1 argument: username whose follows should be inspected")
        exit(1)
    }*/
    const user = await getUserByName(config.readConfig().currentUserName)
    const feed_follows = await getFeedFollowsForUser(user.id)
    for (let ff of feed_follows) {
        console.log(`Username: ${ff.users.name}, Feed name: ${ff.feeds.name}`)
    }
}


function printFeed(feed: Feed, user: User) {
    console.log(feed, user)
}

