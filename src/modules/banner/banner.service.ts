import { config } from "../../config/environment";
import prisma from "../../config/prisma";
import { CloudinaryService } from "../../utils/cloudinary";
import { ForbiddenError, NotFoundError } from "../../utils/errors";

type AuthUser = { id: string; role: string };

export interface CreateBannerPayload {
    restaurantId?: string;
    title: string;
    subtitle?: string;
    imageBase64?: string;
    imagePath?: string;
    actionUrl?: string;
    priority?: number;
    isActive?: boolean;
}

export interface UpdateBannerPayload {
    restaurantId?: string | null;
    title?: string;
    subtitle?: string | null;
    imageBase64?: string;
    imagePath?: string;
    actionUrl?: string | null;
    priority?: number;
    isActive?: boolean;
}

const bannerInclude = {
    restaurant: {
        select: {
            id: true,
            name: true,
            ownerId: true,
        },
    },
};

export class BannerService {
    static async createBanner(user: AuthUser, payload: CreateBannerPayload) {
        await this.assertManageAccess(user, payload.restaurantId);

        const uploadedImage = await this.uploadBannerImage(payload);

        try {
            return await prisma.banner.create({
                data: {
                    restaurantId: payload.restaurantId,
                    title: payload.title,
                    subtitle: payload.subtitle,
                    imageUrl: uploadedImage.secure_url,
                    imagePublicId: uploadedImage.public_id,
                    actionUrl: payload.actionUrl,
                    priority: payload.priority ?? 0,
                    isActive: payload.isActive ?? true,
                },
                include: bannerInclude,
            });
        } catch (error) {
            await CloudinaryService.deleteImage(uploadedImage.public_id);
            throw error;
        }
    }

    static async updateBanner(user: AuthUser, bannerId: string, payload: UpdateBannerPayload) {
        const banner = await prisma.banner.findUnique({
            where: { id: bannerId },
            include: {
                restaurant: true,
            },
        });

        if (!banner || banner.deletedAt) {
            throw new NotFoundError('Banner not found');
        }

        await this.assertManageAccess(user, banner.restaurantId, banner.restaurant?.ownerId);

        if (payload.restaurantId !== undefined) {
            await this.assertManageAccess(user, payload.restaurantId ?? undefined);
        }

        const uploadedImage = this.hasImageSource(payload) ? await this.uploadBannerImage(payload) : undefined;

        try {
            const updatedBanner = await prisma.banner.update({
                where: { id: bannerId },
                data: {
                    restaurantId: payload.restaurantId === undefined ? undefined : payload.restaurantId,
                    title: payload.title,
                    subtitle: payload.subtitle === undefined ? undefined : payload.subtitle,
                    imageUrl: uploadedImage?.secure_url,
                    imagePublicId: uploadedImage?.public_id,
                    actionUrl: payload.actionUrl === undefined ? undefined : payload.actionUrl,
                    priority: payload.priority,
                    isActive: payload.isActive,
                },
                include: bannerInclude,
            });

            if (uploadedImage && banner.imagePublicId) {
                await CloudinaryService.deleteImage(banner.imagePublicId);
            }

            return updatedBanner;
        } catch (error) {
            if (uploadedImage) {
                await CloudinaryService.deleteImage(uploadedImage.public_id);
            }
            throw error;
        }
    }

    static async deleteBanner(user: AuthUser, bannerId: string) {
        const banner = await prisma.banner.findUnique({
            where: { id: bannerId },
            include: {
                restaurant: true,
            },
        });

        if (!banner || banner.deletedAt) {
            throw new NotFoundError('Banner not found');
        }

        await this.assertManageAccess(user, banner.restaurantId, banner.restaurant?.ownerId);

        const deletedBanner = await prisma.banner.delete({
            where: { id: bannerId },
        });

        if (banner.imagePublicId) {
            await CloudinaryService.deleteImage(banner.imagePublicId);
        }

        return deletedBanner;
    }

    private static async assertManageAccess(user: AuthUser, restaurantId?: string | null, ownerId?: string) {
        if (user.role === 'ADMIN') {
            return;
        }

        if (!restaurantId) {
            throw new ForbiddenError('Only admins can manage global banners');
        }

        if (ownerId) {
            if (ownerId !== user.id) {
                throw new ForbiddenError('You do not have permission to manage this banner');
            }
            return;
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundError('Restaurant not found');
        }

        if (restaurant.ownerId !== user.id) {
            throw new ForbiddenError('You do not have permission to manage banners for this restaurant');
        }
    }

    private static async uploadBannerImage(payload: { imageBase64?: string; imagePath?: string }) {
        CloudinaryService.configure(
            config.CLOUDINARY_CLOUD_NAME,
            config.CLOUDINARY_API_KEY,
            config.CLOUDINARY_API_SECRET,
        );

        const imageSource = payload.imageBase64 ?? payload.imagePath;

        if (!imageSource) {
            throw new NotFoundError('Banner image source not found');
        }

        return CloudinaryService.uploadImage(imageSource, 'food-delivery/banners');
    }

    private static hasImageSource(payload: { imageBase64?: string; imagePath?: string }) {
        return Boolean(payload.imageBase64 || payload.imagePath);
    }
}
