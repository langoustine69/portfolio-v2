import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Subscriber {
  email: string;
  subscribedAt: string;
  source: string;
}

interface SubscribersData {
  subscribers: Subscriber[];
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'newsletter-subscribers.json');

async function getSubscribers(): Promise<SubscribersData> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { subscribers: [] };
  }
}

async function saveSubscribers(data: SubscribersData): Promise<void> {
  const dir = path.dirname(SUBSCRIBERS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(data, null, 2));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get existing subscribers
    const data = await getSubscribers();

    // Check if already subscribed
    if (data.subscribers.some(s => s.email === normalizedEmail)) {
      return NextResponse.json(
        { message: 'Already subscribed', alreadySubscribed: true },
        { status: 200 }
      );
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      source: 'website',
    };

    data.subscribers.push(newSubscriber);
    await saveSubscribers(data);

    console.log(`📬 New newsletter subscriber: ${normalizedEmail}`);

    return NextResponse.json(
      { message: 'Successfully subscribed', email: normalizedEmail },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await getSubscribers();
    return NextResponse.json({
      count: data.subscribers.length,
      message: 'Newsletter stats',
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
