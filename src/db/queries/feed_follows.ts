import { eq } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";

export async function createFeedFollow(user_id: string, feed_id: string) {
    const [new_feed_follow] = await db
        .insert(feed_follows)
        .values({ user_id: user_id, feed_id })
        .returning();

    const [result] = await db
        .select()
        .from(feed_follows)
        .innerJoin(users, eq(feed_follows.user_id, users.id))
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
        .where(eq(feed_follows.id, new_feed_follow.id));



    return result;
}

export async function getFeedFollowsForUser(user_id: string) {
    const result = await db
        .select()
        .from(feed_follows)
        .innerJoin(users, eq(feed_follows.user_id, users.id))
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
        .where(eq(feed_follows.user_id, user_id));



    return result;
}



