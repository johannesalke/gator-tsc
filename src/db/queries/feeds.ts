import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db
        .insert(feeds)
        .values({ name: name, url: url, user_id: user_id })
        .returning();
    return result;
}

export async function getFeedByUrl(url: string) {
    const result = await db.select().from(feeds).where(eq(feeds.url, url));
    return result[0]

}

export async function getFeeds() {
    const results = await db.select().from(feeds);
    return results

}