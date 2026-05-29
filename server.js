// ==========================================
// 5. SERVERİ BAŞLAT (YENİLƏNMİŞ VƏ SƏHV SIZ VARIANT)
// ==========================================
const mongoURI = "mongodb+srv://elnursukurlu703_db_user:Elnur5050@elnur.vp5veyx.mongodb.net/elnur_pro_site?retryWrites=true&w=majority&appName=Elnur";

mongoose.connect(mongoURI)
.then(() => {
    console.log('Bulud Verilənlər Bazasına (MongoDB Atlas) uğurla qoşuldu!');
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server ${PORT} portunda işə düşdü.`);
    });
}).catch(err => {
    console.error('DB Qoşulma xətası:', err);
    process.exit(1); // Xətanın nə olduğunu tam görmək üçün
});