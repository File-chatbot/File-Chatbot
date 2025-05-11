import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    }
}, { _id: false });

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
        file: {
            type: fileSchema,
            required: false
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

// Add validation for messages
chatSchema.path('messages').validate(function(messages) {
    if (!Array.isArray(messages)) {
        console.log('Messages is not an array');
        return false;
    }

    return messages.every((message, index) => {
        // Log validation details for debugging
        console.log(`Validating message ${index}:`, JSON.stringify(message, null, 2));

        // Check role
        if (!message.role || !['user', 'assistant'].includes(message.role)) {
            console.log(`Invalid role in message ${index}:`, message.role);
            return false;
        }

        // Check content
        if (typeof message.content !== 'string') {
            console.log(`Invalid content in message ${index}:`, message.content);
            return false;
        }

        // Check file if present
        if (message.file) {
            console.log(`Validating file in message ${index}:`, JSON.stringify(message.file, null, 2));
            
            // File validation is now more lenient
            // Only check if the file object has the required properties
            const hasRequiredProps = message.file.name && message.file.type && message.file.size;
            if (!hasRequiredProps) {
                console.log(`Missing required file properties in message ${index}:`, message.file);
                return false;
            }
        }

        return true;
    });
}, 'Invalid message format');

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel;

// Add a virtual field for `id` that maps to `