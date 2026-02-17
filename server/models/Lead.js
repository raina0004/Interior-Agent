const { v4: uuidv4 } = require('uuid');

const leads = [];

class Lead {
  constructor(data) {
    this._id = uuidv4();
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.propertyType = data.propertyType || '';
    this.carpetArea = data.carpetArea || 0;
    this.city = data.city || '';
    this.budget = data.budget || 0;
    this.timeline = data.timeline || '';
    this.rooms = data.rooms || [];
    this.style = data.style || '';
    this.possessionStatus = data.possessionStatus || 'Ready to move';
    this.packageType = data.packageType || '';
    this.costPerSqFt = data.costPerSqFt || 0;
    this.estimatedCost = data.estimatedCost || 0;
    this.costBreakdown = data.costBreakdown || {};
    this.leadScore = data.leadScore || 0;
    this.leadCategory = data.leadCategory || 'Low';
    this.aiRecommendation = data.aiRecommendation || '';
    this.pdfUrl = data.pdfUrl || '';
    this.status = data.status || 'new';
    this.createdAt = new Date();
  }

  save() {
    const idx = leads.findIndex((l) => l._id === this._id);
    if (idx >= 0) {
      leads[idx] = { ...this };
    } else {
      leads.push({ ...this });
    }
    return this;
  }

  toObject() {
    return { ...this };
  }

  static findAll({ filter = {}, sort = 'desc', skip = 0, limit = 20 } = {}) {
    let result = [...leads];

    if (filter.leadCategory) {
      result = result.filter((l) => l.leadCategory === filter.leadCategory);
    }

    result.sort((a, b) =>
      sort === 'desc'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    const total = result.length;
    result = result.slice(skip, skip + limit);

    return { leads: result, total };
  }

  static findById(id) {
    return leads.find((l) => l._id === id) || null;
  }

  static count(filter = {}) {
    if (filter.leadCategory) {
      return leads.filter((l) => l.leadCategory === filter.leadCategory).length;
    }
    return leads.length;
  }
}

module.exports = Lead;
