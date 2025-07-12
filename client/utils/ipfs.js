import toast from 'react-hot-toast';

/**
 * Upload image file to IPFS via Pinata
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, ipfsHash?: string, url?: string, error?: string}>}
 */
export const uploadImageToIPFS = async (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error("File must be an image");
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size must be less than 50MB");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to upload image");
    }

    return {
      success: true,
      ipfsHash: result.ipfsHash,
      url: result.url
    };
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload metadata JSON to IPFS via Pinata
 * @param {Object} metadata - The metadata object to upload
 * @returns {Promise<{success: boolean, ipfsHash?: string, url?: string, error?: string}>}
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    if (!metadata) {
      throw new Error("No metadata provided");
    }

    const response = await fetch("/api/metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to upload metadata");
    }

    return {
      success: true,
      ipfsHash: result.ipfsHash,
      url: result.url
    };
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create NFT metadata object following ERC-721 standard
 * @param {Object} params - Parameters for metadata creation
 * @param {string} params.name - NFT name
 * @param {string} params.description - NFT description
 * @param {string} params.imageUrl - IPFS URL of the image
 * @param {string} params.collection - Collection name
 * @param {Object} params.attributes - Additional attributes (optional)
 * @returns {Object} ERC-721 compliant metadata object
 */
export const createNFTMetadata = ({
  name,
  description,
  imageUrl,
  collection,
  attributes = []
}) => {
  const metadata = {
    name,
    description,
    image: imageUrl,
    external_url: "",
    collection,
    attributes: [
      {
        trait_type: "Collection",
        value: collection
      },
      ...attributes
    ]
  };

  return metadata;
};

/**
 * Complete NFT creation process: upload image, create metadata, upload metadata
 * @param {Object} params - Parameters for NFT creation
 * @param {File} params.imageFile - The image file
 * @param {string} params.name - NFT name
 * @param {string} params.description - NFT description
 * @param {string} params.collection - Collection name
 * @param {Array} params.attributes - Additional attributes (optional)
 * @returns {Promise<{success: boolean, metadataUrl?: string, imageUrl?: string, error?: string}>}
 */
export const createNFTOnIPFS = async ({
  imageFile,
  name,
  description,
  collection,
  attributes = []
}) => {
  try {
    // Step 1: Upload image to IPFS
    toast.loading("Uploading image to IPFS...", { id: "ipfs-upload" });
    
    const imageResult = await uploadImageToIPFS(imageFile);
    if (!imageResult.success) {
      throw new Error(imageResult.error);
    }

    toast.loading("Creating metadata...", { id: "ipfs-upload" });

    // Step 2: Create metadata object
    const metadata = createNFTMetadata({
      name,
      description,
      imageUrl: imageResult.url,
      collection,
      attributes
    });

    // Step 3: Upload metadata to IPFS
    toast.loading("Uploading metadata to IPFS...", { id: "ipfs-upload" });
    
    const metadataResult = await uploadMetadataToIPFS(metadata);
    if (!metadataResult.success) {
      throw new Error(metadataResult.error);
    }

    toast.success("Successfully uploaded to IPFS!", { id: "ipfs-upload" });

    return {
      success: true,
      metadataUrl: metadataResult.url,
      imageUrl: imageResult.url,
      metadataHash: metadataResult.ipfsHash,
      imageHash: imageResult.ipfsHash
    };
  } catch (error) {
    toast.error(`IPFS Upload Error: ${error.message}`, { id: "ipfs-upload" });
    return {
      success: false,
      error: error.message
    };
  }
}; 