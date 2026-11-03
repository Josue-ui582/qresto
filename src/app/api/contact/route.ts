import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { emailService } from '@/lib/email/email-service';

const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(150),
  contact: z.string().trim().min(3).max(255),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'contact-submit', {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseJson(request, contactMessageSchema);
  if (!parsed.success) return parsed.response;
  if (parsed.data.website?.trim()) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const { name, contact, message } = parsed.data;
    await prisma.contactMessage.create({
      data: { name, contact, message },
    });

    let deliveryStatus: 'sent' | 'not_configured' | 'failed';
    try {
      deliveryStatus = await emailService.sendContactMessage({ name, contact, message });
    } catch (error: unknown) {
      console.error('Échec de la livraison e-mail du message de contact.', error);
      deliveryStatus = 'failed';
    }

    return NextResponse.json(
      { success: true, deliveryStatus },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible d’enregistrer votre message pour le moment.');
  }
}
