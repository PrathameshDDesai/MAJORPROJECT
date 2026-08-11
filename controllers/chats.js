const Message = require("../models/message");
const User = require("../models/user");

// Render Chat Inbox
module.exports.renderInbox = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        
        // Find all messages involving current user
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
        .populate("sender")
        .populate("receiver")
        .sort({ createdAt: -1 });
        
        // Group messages by contact
        const chatUsersMap = new Map();
        messages.forEach(msg => {
            const contact = msg.sender._id.equals(currentUserId) ? msg.receiver : msg.sender;
            if (!contact) return; // safeguard if user deleted
            
            const contactId = contact._id.toString();
            if (!chatUsersMap.has(contactId)) {
                chatUsersMap.set(contactId, {
                    user: contact,
                    lastMessage: msg.text,
                    timestamp: msg.createdAt,
                    unread: !msg.read && msg.receiver._id.equals(currentUserId)
                });
            }
        });
        
        const conversations = Array.from(chatUsersMap.values());
        
        // Handle pre-selected user from query string (e.g. /chat?userId=...)
        let activeContact = null;
        const { userId } = req.query;
        if (userId && userId !== currentUserId.toString()) {
            activeContact = await User.findById(userId);
            
            // If this is a brand new conversation, prepend it to active list
            if (activeContact && !chatUsersMap.has(userId)) {
                conversations.unshift({
                    user: activeContact,
                    lastMessage: "Start a conversation...",
                    timestamp: new Date(),
                    unread: false
                });
            }
        }
        
        res.render("users/chat", { conversations, activeContact });
    } catch (e) {
        req.flash("error", "Error loading inbox: " + e.message);
        res.redirect("/listings");
    }
};

// Retrieve history JSON between current user and target user
module.exports.getHistory = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { contactId } = req.params;
        
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: contactId },
                { sender: contactId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });
        
        // Mark received messages as read
        await Message.updateMany(
            { sender: contactId, receiver: currentUserId, read: false },
            { $set: { read: true } }
        );
        
        res.json({ success: true, messages });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};
