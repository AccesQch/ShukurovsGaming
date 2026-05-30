// 1. ÇAT GÖNDƏRMƏ FİXİ:
function sendGenMsg() {
    let inputEl = document.getElementById('gen-chat-input');
    if (!inputEl) return;
    let txt = inputEl.value.trim();
    if (!txt) return;

    // Hansı chatda olduğumuzu yoxlayırıq
    let roleToDisplay = curUser.isVip && currentGenChat === 'vipChat' && curUser.role === 'Member' ? 'VIP' : curUser.role;
    
    // Mesajı bazaya push edirik
    db.generalChats[currentGenChat].push({ s: curUser.nick, role: roleToDisplay, t: txt });
    saveDb(); 
    inputEl.value = ''; 
    updateGenChatMsgs();
}

// 2. BİLET GÖRÜNMƏZLIYI FİXİ:
function renderUserTickets() {
    let box = document.getElementById('user-tickets');
    let arr = [];

    // Əgər istifadəçi Admin və ya Dev-dirsə, bütün biletləri görsün
    if(curUser.role === 'Developer' || curUser.role === 'Admin') {
        arr = db.tickets;
    } else {
        // Member sadəcə öz biletlərini görsün
        arr = db.tickets.filter(t => t.uId === curUser.id);
    }
    
    // Sıralama (Açıq olanlar üstdə)
    arr.sort((a,b) => (a.status === 'Açıq' ? -1 : 1));

    if (arr.length === 0) box.innerHTML = '<p>Bilet yoxdur.</p>';
    else box.innerHTML = arr.map(t => `
        <div class="ticket-item">
            <b>${t.id} - ${t.uNick}</b> | ${t.type} | 
            <span style="color:${t.status==='Açıq'?'green':'red'}">${t.status}</span>
            <button onclick="openChat('${t.id}')">Giriş</button>
        </div>
    `).join('');
}

// 3. ADMIN PANEL BİLET FİXİ:
function searchAdminTickets() {
    let val = document.getElementById('search-ticket').value.toLowerCase();
    // Bütün biletləri çəkir (Developer burada hər şeyi görəcək)
    let arr = db.tickets.filter(t => t.id.toLowerCase().includes(val) || t.uNick.toLowerCase().includes(val));
    document.getElementById('admin-t-list').innerHTML = arr.map(t => `
        <div class="admin-ticket">
            <span>${t.id} - ${t.uNick}</span>
            <button onclick="openChat('${t.id}')">Bax</button>
        </div>
    `).join('');
}