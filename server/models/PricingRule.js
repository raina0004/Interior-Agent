const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      enum: ['Basic', 'Premium', 'Luxury'],
      required: true,
      unique: true,
    },
    costPerSqFt: {
      type: Number,
      required: true,
    },
    budgetMin: {
      type: Number,
      required: true,
    },
    budgetMax: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    features: {
      type: [String],
      default: [],
    },
    warranty: {
      type: String,
      default: '10 years',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
