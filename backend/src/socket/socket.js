import { sendMessageService } from "../services/chatService.js";

const onlineUsers = new Map();

export const getReceiverSocketId = (userId) => {
    return onlineUsers.get(userId);
};

export const initSocket = (io) => {

    io.on("connection", (socket) => {

        console.log("User connected:", socket.id);

        socket.on("register", (userId) => {

            onlineUsers.set(userId, socket.id);
            socket.userId = userId;

            console.log("User registered:", userId);
        });

        socket.on("sendMessage", async ({ receiverId, content }) => {

            const senderId = socket.userId;

            try {

                const result = await sendMessageService({
                    sender: senderId,
                    receiverId,
                    content
                });

                const receiverSocketId = getReceiverSocketId(receiverId);

                socket.emit("newMessage", result.message);

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", result.message);
                }

            } catch (error) {
                console.error("Message error:", error.message);
            }
        });

        socket.on("disconnect", () => {

            if (socket.userId) {
                onlineUsers.delete(socket.userId);
            }

            console.log("User disconnected:", socket.id);
        });

    });

};
