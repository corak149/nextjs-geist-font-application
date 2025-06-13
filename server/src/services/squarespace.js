const axios = require('axios');

class SquarespaceService {
  constructor() {
    this.apiKey = process.env.SQUARESPACE_API_KEY;
    this.websiteId = process.env.SQUARESPACE_WEBSITE_ID;
    this.baseURL = 'https://api.squarespace.com/1.0/';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'Rueda Verde Integration',
        'Content-Type': 'application/json'
      }
    });
  }

  // Get website information
  async getWebsiteInfo() {
    try {
      const response = await this.client.get(`/websites/${this.websiteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching website info:', error);
      throw error;
    }
  }

  // Create a new page
  async createPage(pageData) {
    try {
      const response = await this.client.post(`/websites/${this.websiteId}/pages`, pageData);
      return response.data;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  // Update page content
  async updatePage(pageId, pageData) {
    try {
      const response = await this.client.put(`/websites/${this.websiteId}/pages/${pageId}`, pageData);
      return response.data;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  // Get all pages
  async getPages() {
    try {
      const response = await this.client.get(`/websites/${this.websiteId}/pages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  // Create or update navigation menu
  async updateNavigation(navigationData) {
    try {
      const response = await this.client.put(`/websites/${this.websiteId}/navigation`, navigationData);
      return response.data;
    } catch (error) {
      console.error('Error updating navigation:', error);
      throw error;
    }
  }

  // Upload an image
  async uploadImage(imageData) {
    try {
      const formData = new FormData();
      formData.append('file', imageData);
      
      const response = await this.client.post(`/websites/${this.websiteId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Sync content between Squarespace and our application
  async syncContent(content) {
    try {
      // First, store content in our Google Cloud Storage
      const storageService = require('../config/storage');
      const storagePath = `content/${Date.now()}-${content.id}`;
      await storageService.uploadFile(content.file, storagePath);

      // Then, update Squarespace page
      const pageData = {
        type: 'page',
        title: content.title,
        body: content.body,
        fullUrl: `/content/${content.slug}`,
        urlSlug: content.slug
      };

      // Create or update the page in Squarespace
      let page;
      if (content.squarespacePageId) {
        page = await this.updatePage(content.squarespacePageId, pageData);
      } else {
        page = await this.createPage(pageData);
      }

      return {
        squarespacePageId: page.id,
        squarespaceUrl: page.fullUrl,
        storageUrl: `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${storagePath}`
      };
    } catch (error) {
      console.error('Error syncing content:', error);
      throw error;
    }
  }
}

module.exports = new SquarespaceService();
