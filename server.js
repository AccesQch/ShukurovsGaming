const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cron = require('cron');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

// --- MODELLƏR ---
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Member', 'VIP', 'Helper', 'Admin', 'Developer'], default: 'Member' },
    profilePhoto: { type: String, default: 'default-avatar.png' },
    bio: { type: String, default: 'Mən bu saytın yeni üzvüyəm.' },
    vipExpiry: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
}));

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['General', 'NameChange', 'Support'], default: 'General' },
    content: { type: String, required: true },
    status: { type: String, enum: ['Open', 'InProgress', 'Closed'], default: 'Open' },
    createdAt: { type: Date, default: Date.now }
}));

// --- CRON JOB (VIP Yoxlama) ---
const checkVipStatus = new cron.CronJob('0 * * * *', async () => {
    const now = new Date();
    await User.updateMany({ role: 'VIP', vipExpiry: { $lte: now } }, { $set: { role: 'Member', vipExpiry: null } });
});
checkVipStatus.start();

// --- API-LƏR ---
app.get('/', (req, res) => { res.send('Elnur Pro Server Aktivdir!'); });

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        let userRole = username.toLowerCase() === 'elnur' ? 'Developer' : 'Member';
        const newUser = new User({ username, password: hashedPassword, role: userRole });
        await newUser.save();
        res.status(201).json({ message: 'Uğurlu', role: userRole });
    } catch (err) { res.status(400).json({ error: 'Xəta' }); }
});

app.put('/api/profile/update', async (req, res) => {
    const { userId, newPassword, profilePhoto, bio } = req.body;
    try {
        let updateData = { profilePhoto, bio };
        if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, updateData);
        res.json({ message: 'Yeniləndi' });
    } catch (err) { res.status(500).json({ error: 'Xəta' }); }
});

app.post('/api/tickets/create', async (req, res) => {
    const { userId, type, content } = req.body;
    try {
        const newTicket = new Ticket({ authorId: userId, type, content });
        await newTicket.save();
        io.to('staff-room').emit('new-ticket', newTicket);
        res.json({ message: 'Bilet yaradıldı' });
    } catch (err) { res.status(500).json({ error: 'Xəta' }); }
});

app.post('/api/buy-vip', async (req, res) => {
    const { userId, paymentAmount } = req.body;
    if (paymentAmount < 5) return res.status(400).json({ error: 'Qiymət 5 AZN-dir' });
    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await User.findByIdAndUpdate(userId, { role: 'VIP', vipExpiry: expiryDate });
        res.json({ message: 'VIP olundu', expiryDate });
    } catch (err) { res.status(500).json({ error: 'Xəta' }); }
});

// --- CHAT (SOCKET.IO) ---
io.on('connection', (socket) => {
    socket.on('join-server', async ({ userId }) => {
        try {
            const user = await User.findById(userId);
            if (!user) return;
            socket.user = user;
            if (['Admin', 'Helper', 'Developer'].includes(user.role)) socket.join('staff-room');
            if (['VIP', 'Admin', 'Helper', 'Developer'].includes(user.role)) socket.join('vip-chat');
            socket.join('general-chat');
        } catch (e) {}
    });

    socket.on('send-general-message', (content) => {
        if (!socket.user) return;
        io.to('general-chat').emit('receive-general-message', {
            username: socket.user.username,
            roleTag: `[${socket.user.role}]`,
            text: content,
            timestamp: new Date()
        });
    });

    socket.on('send-vip-message', (content) => {
        if (!socket.user || !['VIP', 'Admin', 'Helper', 'Developer'].includes(socket.user.role)) return;
        io.to('vip-chat').emit('receive-vip-message', {
            username: socket.user.username,
            roleTag: `[${socket.user.role}]`,
            text: content,
            timestamp: new Date()
        });
    });
});

// --- MONGOOSE BAĞLANTISI ---
const mongoURI = "mongodb+srv://elnursukurlu703_db_user:Elnur5050@elnur.vp5veyx.mongodb.net/elnur_pro_site?retryWrites=true&w=majority&appName=Elnur";

mongoose.connect(mongoURI)
.then(() => {
    console.log('MongoDB Uğurlu');
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log('Server işləyir'));
})
.catch(err => {
    console.log(err);
    process.exit(1);
});