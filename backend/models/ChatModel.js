import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function(next) {
    console.log('Saving chat document:', {
        _id: this._id,
        messageCount: this.messages.length,
        lastUpdated: this.updatedAt
    });
    this.updatedAt = Date.now();
    next();
});

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel;

// Add a virtual field for `id` that maps to `