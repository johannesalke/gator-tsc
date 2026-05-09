import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    let response = await fetch(feedURL, {
        method: "GET",
        mode: "cors",
        headers: {
            "User-Agent": "gator"
        },
    });
    const parser = new XMLParser({ processEntities: false })
    let feed = parser.parse(await response.text()).rss
    if (!feed.channel) {
        console.log(feed)
        throw new Error("No channel field in feed object, if that object even exists :<")
    }
    const title: string = feed.channel.title
    const link: string = feed.channel.link
    const description = feed.channel.description
    let items: RSSItem[] = []
    let newFeed: RSSFeed
    if (Array.isArray(feed.channel.item)) {
        newFeed = feed
    } else {
        feed.channel.item = [feed.channel.item]
        newFeed = feed
    }
    return newFeed

}

