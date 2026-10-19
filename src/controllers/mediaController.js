const cloudinary = require("../config/cloudinary");
const MediaAsset = require("../models/MediaAsset");

/**
 * Upload a buffer stream to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * @desc    Upload media (Image or PDF) and enforce max 3 items retention per category
 * @route   POST /api/media/upload
 * @access  Private (Logged-in admin/user)
 */
const uploadMedia = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("[Upload Error] Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET in backend .env");
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials missing on server. Please ensure CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set in your backend .env file.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided for upload.",
      });
    }

    const userId = req.user._id.toString();
    const section = (req.body.section || "general").toLowerCase().trim();
    const category = (req.body.category || "default").toLowerCase().trim();

    // Folder structure: user_<userId>/<section>/<category>
    const folderPath = `user_${userId}/${section}/${category}`;

    const isPdf = req.file.mimetype === "application/pdf" || (req.file.originalname && req.file.originalname.toLowerCase().endsWith(".pdf"));
    const resourceType = isPdf ? "image" : "image"; // Cloudinary treats PDF as image resource type for thumbnail/browser preview and page rendering

    // 1. Upload new file to Cloudinary in the specific organized folder
    const uploadOptions = {
      folder: folderPath,
      resource_type: "auto", // Automatically detects image or pdf/raw
      use_filename: true,
      unique_filename: true,
    };

    if (isPdf) {
      uploadOptions.format = "pdf";
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, uploadOptions);

    // Extract short path for frontend convenience (relative identifier after /upload/)
    // e.g., if secure_url is "https://res.cloudinary.com/dtgn3hnzh/image/upload/v1234/folder/file.png"
    // shortPath will be "v1234/folder/file.png"
    const uploadRegex = /\/upload\/(?:[a-zA-Z0-9_,]+\/)?(.*)$/;
    const match = uploadResult.secure_url.match(uploadRegex);
    const shortPath = match ? match[1] : uploadResult.public_id;

    // 2. Save new asset to MongoDB
    const newAsset = await MediaAsset.create({
      userId: req.user._id,
      section,
      category,
      publicId: uploadResult.public_id,
      shortPath,
      secureUrl: uploadResult.secure_url,
      originalName: req.file.originalname,
      format: uploadResult.format || (isPdf ? "pdf" : "png"),
      resourceType,
      sizeBytes: uploadResult.bytes || req.file.size,
    });

    // 3. ENFORCE MAX 3 IMAGES/FILES RULE:
    // Fetch all existing assets for this user + section + category sorted newest first
    const existingAssets = await MediaAsset.find({
      userId: req.user._id,
      section,
      category,
    }).sort({ createdAt: -1 });

    // If there are more than 3 assets, delete the oldest ones from Cloudinary and DB
    if (existingAssets.length > 3) {
      const surplusAssets = existingAssets.slice(3); // items from index 3 onward

      for (const oldAsset of surplusAssets) {
        try {
          await cloudinary.uploader.destroy(oldAsset.publicId, {
            resource_type: oldAsset.resourceType || "image",
          });
          await MediaAsset.findByIdAndDelete(oldAsset._id);
          console.log(`[Cloudinary Cleanup] Removed surplus asset ${oldAsset.publicId}`);
        } catch (delErr) {
          console.error(`Failed to delete surplus asset ${oldAsset.publicId}:`, delErr.message);
        }
      }
    }

    // 4. Return current active list of up to 3 assets for UI preview
    const activeAssets = await MediaAsset.find({
      userId: req.user._id,
      section,
      category,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      asset: {
        id: newAsset._id,
        publicId: newAsset.publicId,
        shortPath: newAsset.shortPath,
        url: newAsset.secureUrl,
        originalName: newAsset.originalName,
        format: newAsset.format,
      },
      recentAssets: activeAssets.map((a) => ({
        id: a._id,
        publicId: a.publicId,
        shortPath: a.shortPath,
        url: a.secureUrl,
        originalName: a.originalName,
        format: a.format,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    let userFriendlyMessage = error.message || "Failed to upload file to Cloudinary.";
    
    // Detect Cloudinary 403 permission or unverified account errors
    if (error.http_code === 403 || (error.message && error.message.includes("403"))) {
      userFriendlyMessage = "Cloudinary 403 Forbidden: Your Cloudinary API Key or account lacks upload/write permissions. Please verify your Cloudinary account email or ensure you are using the Master API Key & Secret from Settings -> Access Keys.";
    }

    return res.status(error.http_code && error.http_code !== 403 ? error.http_code : 500).json({
      success: false,
      message: userFriendlyMessage,
    });
  }
};

/**
 * @desc    Get recent uploaded assets for a section & category (max 3)
 * @route   GET /api/media?section=navbar&category=logo
 * @access  Private (Logged-in admin/user)
 */
const getRecentAssets = async (req, res) => {
  try {
    const { section, category } = req.query;
    const filter = { userId: req.user._id };
    if (section) filter.section = section.toLowerCase().trim();
    if (category) filter.category = category.toLowerCase().trim();

    const assets = await MediaAsset.find(filter)
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      assets: assets.map((a) => ({
        id: a._id,
        publicId: a.publicId,
        shortPath: a.shortPath,
        url: a.secureUrl,
        originalName: a.originalName,
        format: a.format,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("getRecentAssets error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch media assets.",
    });
  }
};

/**
 * @desc    Delete a specific media asset from Cloudinary and DB
 * @route   DELETE /api/media/:id
 * @access  Private (Logged-in admin/user)
 */
const deleteMediaAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findOne({ _id: id, userId: req.user._id });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found or unauthorized.",
      });
    }

    // Remove from Cloudinary
    try {
      await cloudinary.uploader.destroy(asset.publicId, {
        resource_type: asset.resourceType || "image",
      });
    } catch (cErr) {
      console.warn("Cloudinary delete warning:", cErr.message);
    }

    // Remove from database
    await MediaAsset.findByIdAndDelete(asset._id);

    // Return remaining assets for this section and category
    const remaining = await MediaAsset.find({
      userId: req.user._id,
      section: asset.section,
      category: asset.category,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      message: "Media asset deleted successfully.",
      recentAssets: remaining.map((a) => ({
        id: a._id,
        publicId: a.publicId,
        shortPath: a.shortPath,
        url: a.secureUrl,
        originalName: a.originalName,
        format: a.format,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("deleteMediaAsset error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete media asset.",
    });
  }
};

module.exports = {
  uploadMedia,
  getRecentAssets,
  deleteMediaAsset,
};
