// ==========================================
// 5. SERVERİ BAŞLAT (ONLAYN MONGODB ATLAS BAĞLANTISI)
// ==========================================

// Sənin MongoDB Atlas bağlantı linkin:
const mongoURI = "mongodb+srv://elnursukurlu703_db_user:Elnur5050@elnur.vp5veyx.mongodb.net/elnur_pro_site?retryWrites=true&w=majority&appName=Elnur";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Bulud Verilənlər Bazasına (MongoDB Atlas) uğurla qoşuldu!');
    
    // Server portu real serverlər üçün avtomatik tənzimlənir
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server ${PORT} portunda işə düşdü. Elnur - Developer yetkisi aktivdir.`);
    });
}).catch(err => console.log('DB Qoşulma xətası:', err));