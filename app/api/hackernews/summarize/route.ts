import { checkBearerAuth } from '@/lib/auth';
import { fetchContent } from '@/lib/hackernews/fetchContent';
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import { summarize } from '@/lib/openai/summarize';
import { sendWebhookNotification } from '@/lib/webhook';
import { NextResponse } from 'next/server';

type FetchContentRequestBody = {
  id: string;
  webhookUrl: string;
};

export async function POST(req: Request) {
  const authResult = checkBearerAuth(req, 'HACKERNEWS_API_KEY');
  if (authResult !== true) {
    return authResult;
  }

  const body: FetchContentRequestBody = await req.json();
  const { id, webhookUrl } = body;

  if (!id) {
    return NextResponse.json({ ok: false, error: 'There is no id' });
  }

  const foundItem = await getHackernewsItemById(id);

  if (!foundItem || !foundItem.url) {
    return NextResponse.json({ ok: false, error: 'Item or URL not found' });
  }

  let content: string | null | undefined = null;

  try {
    content = await fetchContent(foundItem.url);
    console.log(`🌐 General content fetched for ${foundItem.url}`);
  } catch (error) {
    console.error('❌ Error fetching content:', error);
    return NextResponse.json({ ok: false, error: 'Error fetching content' });
  }

  if (content) {
    summarize(content)
      .then((summary) => {
        sendWebhookNotification(webhookUrl, { id, summary });
        console.log('📬 Sent summary to webhook');
      })
      .catch((error) => {
        console.error('❌ Error summarizing content:', error);
        sendWebhookNotification(webhookUrl, { id, error: 'Failed to summarize the content' });
      });
  }

  return NextResponse.json({ ok: true, message: 'Summary request received, processing in background' });
}
