import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
    public_id: string;
    url: string;
    secure_url: string;
}

export class CloudinaryService {
    static configure(
        cloudName?: string,
        apiKey?: string,
        apiSecret?: string,
    ) {
        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
        }
    }

    static async uploadImage(
        filePath: string,
        folder: string = 'food-delivery',
    ): Promise<CloudinaryUploadResult> {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder,
                resource_type: 'auto',
            });

            return {
                public_id: result.public_id,
                url: result.url,
                secure_url: result.secure_url,
            };
        } catch (error) {
            throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async deleteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new Error(`Cloudinary delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
