const socketIO = require("socket.io");
const { verifyAccessToken } = require("../shared/utils/tokens");

const initializeSocketIO = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS || "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    //Auth middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                socket.handshake.headers.authorization?.split("")[1]

            if (!token) {
                return next(new Error("Auth Error: token not provided"))
            }

            const decoded = verifyAccessToken(token)
            socket.userId = decoded.userId
            next()
        } catch (error) {
            next(new Error("Auth error: Invalid token"))
        }
    })

    io.on("connection", (socket) => {
        console.log(`User connected ${socket.userId}`)
        socket.join(socket.userId.toString())

        socket.on("disconnect", () => {
            console.log(`User disconnected ${socket.userId}`)
        })
        socket.on("error", (error) => {
            console.log(`Socket error: ${error}`)
        })
    })

    return io
}

module.exports = initializeSocketIO