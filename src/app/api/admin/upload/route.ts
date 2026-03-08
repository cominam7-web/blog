import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';
import crypto from 'crypto';

const BUCKET = 'blog-images';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Magic bytes 검증 (MIME type 스푸핑 방지)
        const isValidImage = (
            (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) || // JPEG
            (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) || // PNG
            (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
             buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) || // WebP
            (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) // GIF
        );
        if (!isValidImage) {
            return NextResponse.json({ error: 'File content does not match an allowed image format.' }, { status: 400 });
        }
        const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const fileName = `${Date.now()}-${hash}.${ext}`;
        const filePath = `uploads/${fileName}`;

        const supabase = getServiceSupabase();

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            // If bucket doesn't exist, try to create it
            if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
                const { error: createError } = await supabase.storage.createBucket(BUCKET, {
                    public: true,
                    fileSizeLimit: MAX_SIZE,
                });
                if (createError && !createError.message?.includes('already exists')) {
                    return NextResponse.json({ error: `Bucket creation failed: ${createError.message}` }, { status: 500 });
                }

                // Retry upload
                const { error: retryError } = await supabase.storage
                    .from(BUCKET)
                    .upload(filePath, buffer, {
                        contentType: file.type,
                        upsert: false,
                    });
                if (retryError) {
                    return NextResponse.json({ error: retryError.message }, { status: 500 });
                }
            } else {
                return NextResponse.json({ error: uploadError.message }, { status: 500 });
            }
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

        return NextResponse.json({
            url: urlData.publicUrl,
            fileName,
        });
    } catch (err) {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
