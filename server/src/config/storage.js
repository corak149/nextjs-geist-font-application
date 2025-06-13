const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

module.exports = {
  storage,
  bucket,
  uploadFile: async (file, destination) => {
    try {
      const blob = bucket.file(destination);
      await blob.save(file.buffer);
      return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${destination}`;
    } catch (error) {
      console.error('Error uploading to Google Cloud Storage:', error);
      throw error;
    }
  }
};
