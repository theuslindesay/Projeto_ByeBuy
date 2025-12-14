const firebaseConfig = {
    apiKey: "AIzaSyDrVDIVgBLPcz34rUOtikR2f-kOBZGYnrI",
    authDomain: "byebuy-861ce.firebaseapp.com",
    projectId: "byebuy-861ce",
    storageBucket: "byebuy-861ce.firebasestorage.app",
    messagingSenderId: "936406311906",
    appId: "1:936406311906:web:e7b579ab1514536d7c4fbb",
    measurementId: "G-4CD5Z7VYZ1"
};
  
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentChatId = null;
let unsubscribeChat = null;
let feedListener = null; 
let itemsCache = [];

window.onload = function() {
    listenToFeed();

    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection("users").doc(user.uid).get().then((doc) => {
                if(doc.exists) {
                    currentUser = { uid: user.uid, ...doc.data() };
                    updateAuthUI();
                    renderCurrentFeed(); 
                }
            });
        } else {
            currentUser = null;
            updateAuthUI();
            renderCurrentFeed();
        }
    });

    setupCNPJMask();
};

function nav(view) { 
    document.querySelectorAll('.view-section').forEach(e => e.classList.remove('active')); 
    document.getElementById('view-'+view).classList.add('active'); 
}

let baseSize = 16;
function resize(val) { 
    baseSize += val; 
    if(baseSize<12) baseSize=12; 
    if(baseSize>24) baseSize=24; 
    document.body.style.fontSize = baseSize+'px'; 
}

function updateAuthUI() {
    if (currentUser) {
        document.getElementById('guest-nav').classList.add('hidden');
        document.getElementById('user-nav').classList.remove('hidden');
        document.getElementById('user-greeting').innerText = `Olá, ${currentUser.name.split(' ')[0]}`;
        
        if(currentUser.photoURL) {
            const avatar = document.getElementById('header-avatar');
            avatar.src = currentUser.photoURL;
            avatar.style.display = 'block';
        }

        document.getElementById('btn-hero-action').classList.remove('hidden');
        document.getElementById('btn-hero-action').textContent = currentUser.type === 'ONG' ? 'Solicitar Doação' : 'Desapegar (Anunciar)';
    } else {
        document.getElementById('guest-nav').classList.remove('hidden');
        document.getElementById('user-nav').classList.add('hidden');
        document.getElementById('btn-hero-action').classList.add('hidden');
        document.getElementById('header-avatar').style.display = 'none';
    }
}

function listenToFeed() {
    const container = document.getElementById('feed-container');
    
    if (feedListener) feedListener();

    feedListener = db.collection("items").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        itemsCache = [];
        
        if (snapshot.empty) { 
            seedInitialData(); 
            return; 
        }
        
        snapshot.forEach((doc) => { 
            itemsCache.push({ id: doc.id, ...doc.data() });
        });
        
        renderCurrentFeed();
    });
}

function renderCurrentFeed() {
    const container = document.getElementById('feed-container');
    container.innerHTML = '';
    
    if (itemsCache.length === 0) return;

    itemsCache.forEach(item => {
        renderCard(item.id, item);
    });
}

function renderCard(id, item) {
    const container = document.getElementById('feed-container');
    
    let isOwner = false;
    if (currentUser && (item.ownerUid === currentUser.uid)) {
        isOwner = true;
    }

    const imgSrc = item.image ? item.image : 'https://via.placeholder.com/400x200?text=Sem+Foto';
    let btnHTML = '';
    
    if (isOwner) {
        btnHTML = `<button class="btn-submit btn-outline" onclick="openChatList('${id}')">Ver Mensagens 📩</button>`;
    } else {
        if (item.type === 'need') {
            btnHTML = `<button class="btn-submit" onclick="donateToItem('${id}', ${item.current}, ${item.total})">Doar para este pedido ❤️</button>`;
        } else {
            btnHTML = `<button class="btn-submit" onclick="openChat('${id}', '${item.ownerUid}', '${item.title}')">Tenho Interesse 💬</button>`;
        }
    }

    const donorUid = item.ownerUid || '';
    const donorName = `<a onclick="openPublicProfile('${donorUid}')" class="profile-link">${item.org}</a>`;

    let cardHTML = `<article class="card">`;
    cardHTML += `<img src="${imgSrc}" class="card-img" alt="${item.title}">`;
    cardHTML += `<div class="card-content">`;
    
    if (item.type === 'need') {
        const pct = (item.current / item.total) * 100;
        cardHTML += `
            <span class="tag" style="background:var(--danger-color)">Pedido de ONG</span>
            <h3>${item.title}</h3>
            <p class="ong-info"><strong>ONG:</strong> ${donorName} - ${item.bairro}</p>
            <div class="progress-bar-bg"><div class="progress-fill" style="width: ${pct}%"></div></div>
            <p style="font-size: 0.8rem;">${item.current} de ${item.total} conseguidos</p>
            ${btnHTML}
        `;
    } else {
        cardHTML += `
            <span class="tag donation">Para Doação</span>
            <h3>${item.title}</h3>
            <p class="ong-info"><strong>Doador:</strong> ${donorName} - ${item.bairro}</p>
            <p style="margin-bottom: 5px;"><strong>Condição:</strong> ${item.condition}</p>
            ${btnHTML}
        `;
    }
    cardHTML += `</div></article>`;
    container.innerHTML += cardHTML;
}

function previewRegisterImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { document.getElementById('reg-preview').src = e.target.result; }
        reader.readAsDataURL(input.files[0]);
    }
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;
    const isOng = document.getElementById('opt-ong').classList.contains('active');
    const cnpj = document.getElementById('reg-cnpj').value;
    const fileInput = document.getElementById('reg-image');

    if (isOng && cnpj.length < 18) { alert("CNPJ inválido."); return; }

    const createUserInDB = (photoDataUrl) => {
        auth.createUserWithEmailAndPassword(email, pass).then((cred) => {
            const data = { 
                name, email, bairro: document.getElementById('reg-bairro').value, 
                type: isOng ? 'ONG' : 'Pessoa',
                photoURL: photoDataUrl || 'https://via.placeholder.com/100'
            };
            if (isOng) { data.cnpj = cnpj; data.ongType = document.getElementById('reg-type-ong').value; }
            return db.collection("users").doc(cred.user.uid).set(data);
        }).then(() => { alert("Conta criada!"); nav('home'); }).catch(e => alert(e.message));
    };

    if (fileInput.files[0]) {
        const r = new FileReader();
        r.onload = (ev) => createUserInDB(ev.target.result);
        r.readAsDataURL(fileInput.files[0]);
    } else createUserInDB(null);
}

function openChat(itemId, ownerId, itemTitle) {
    if (!currentUser) { alert("Faça login!"); nav('login'); return; }
    if (currentUser.uid === ownerId) { alert("Este item é seu."); return; }
    currentChatId = `${itemId}_${currentUser.uid}`;
    db.collection("chats").doc(currentChatId).set({
        participants: [currentUser.uid, ownerId],
        itemId, ownerId, interestedId: currentUser.uid,
        interestedName: currentUser.name,
        interestedAvatar: currentUser.photoURL,
        itemTitle, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    loadChatUI(itemTitle);
}

function openChatList(itemId) {
    document.getElementById('modal-chat-list').classList.remove('hidden');
    const container = document.getElementById('chat-list-container');
    container.innerHTML = '<p>Carregando...</p>';
    db.collection("chats").where("itemId", "==", itemId).get().then((snap) => {
        container.innerHTML = '';
        const myChats = [];
        snap.forEach(doc => { if(doc.data().ownerId === currentUser.uid) myChats.push({id:doc.id, ...doc.data()}); });
        
        if (myChats.length === 0) { container.innerHTML = '<p style="text-align:center;">Sem interessados.</p>'; return; }
        
        myChats.forEach(chat => {
            const div = document.createElement('div');
            div.className = 'chat-list-item';
            div.innerHTML = `<span>${chat.interestedName}</span><small style="color:blue">Abrir</small>`;
            div.onclick = () => { closeModal('modal-chat-list'); currentChatId = chat.id; loadChatUI(chat.itemTitle); };
            container.appendChild(div);
        });
    });
}

function loadChatUI(title) {
    document.getElementById('modal-chat').classList.remove('hidden');
    document.getElementById('chat-title').innerText = title;
    const container = document.getElementById('chat-messages');
    container.innerHTML = 'Carregando...';
    if (unsubscribeChat) unsubscribeChat();
    unsubscribeChat = db.collection("chats").doc(currentChatId).collection("messages").orderBy("timestamp", "asc").onSnapshot(snap => {
        container.innerHTML = '';
        snap.forEach(doc => {
            const msg = doc.data();
            const div = document.createElement('div');
            div.className = `msg-row ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`;
            div.innerHTML = `<div class="message-bubble">${msg.text}</div>`;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    });
}

function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;
    db.collection("chats").doc(currentChatId).collection("messages").add({
        text, senderId: currentUser.uid, senderAvatar: currentUser.photoURL, timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = '';
}

function handleCreateItem(e) {
    e.preventDefault();
    const newItem = {
        title: document.getElementById('item-title').value,
        category: document.getElementById('item-category').value,
        org: currentUser.name, ownerUid: currentUser.uid, bairro: currentUser.bairro, createdAt: Date.now()
    };
    if (currentUser.type === 'ONG') { newItem.type = 'need'; newItem.total = parseInt(document.getElementById('item-total').value); newItem.current = 0; }
    else { newItem.type = 'donation'; newItem.condition = document.getElementById('item-condition').value; }

    const save = (img) => {
        newItem.image = img;
        db.collection("items").add(newItem).then(() => { closeModal('modal-item'); alert("Publicado!"); });
    };
    const f = document.getElementById('item-image').files[0];
    if (f) { const r = new FileReader(); r.onload = ev => save(ev.target.result); r.readAsDataURL(f); }
    else save(null);
}

function handleLogin(e) {
    e.preventDefault();
    auth.signInWithEmailAndPassword(document.getElementById('login-email').value, document.getElementById('login-pass').value)
    .then(() => nav('home')).catch(e => alert(e.message));
}

function logout() { auth.signOut().then(() => location.reload()); }
function donateToItem(id, c, t) { if(!currentUser) return nav('login'); if(c<t) db.collection("items").doc(id).update({current:c+1}).then(()=>alert("Obrigado!")); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openItemModal() { document.getElementById('modal-item').classList.remove('hidden'); }
function openProfileModal() {
    if (!currentUser) return;
    document.getElementById('modal-profile').classList.remove('hidden');
    document.getElementById('prof-name').value = currentUser.name || '';
    document.getElementById('prof-bairro').value = currentUser.bairro || '';
    
    if (currentUser.photoURL) {
        document.getElementById('prof-preview').src = currentUser.photoURL;
    }

    const ongFields = document.getElementById('prof-ong-fields');
    if (currentUser.type === 'ONG') {
        ongFields.classList.remove('hidden');
        document.getElementById('prof-desc').value = currentUser.description || '';
        document.getElementById('prof-phone').value = currentUser.phone || '';
        document.getElementById('prof-site').value = currentUser.website || '';
    } else {
        ongFields.classList.add('hidden');
    }
}

function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('prof-preview').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function handleSaveProfile(e) {
    e.preventDefault();
    const bairro = document.getElementById('prof-bairro').value;
    const updateData = { bairro: bairro };
    const fileInput = document.getElementById('prof-image');
    
    const saveToDb = () => {
        if (currentUser.type === 'ONG') {
            updateData.description = document.getElementById('prof-desc').value;
            updateData.phone = document.getElementById('prof-phone').value;
            updateData.website = document.getElementById('prof-site').value;
        }

        db.collection("users").doc(currentUser.uid).update(updateData)
        .then(() => {
            alert("Perfil atualizado!");
            currentUser = { ...currentUser, ...updateData };
            updateAuthUI();
            closeModal('modal-profile');
        });
    };

    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            updateData.photoURL = e.target.result;
            saveToDb();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveToDb();
    }
}

function openPublicProfile(uid) {
    if (!uid) return;
    db.collection("users").doc(uid).get().then((doc) => {
        if (doc.exists) {
            const user = doc.data();
            document.getElementById('modal-public-profile').classList.remove('hidden');
            document.getElementById('pub-name').textContent = user.name;
            document.getElementById('pub-type').textContent = user.type === 'ONG' ? 'ONG' : 'Doador';
            document.getElementById('pub-bairro').textContent = user.bairro || 'Niterói';
            
            const avatar = user.photoURL || 'https://via.placeholder.com/100';
            document.getElementById('pub-avatar').src = avatar;
            
            if (user.type === 'ONG') {
                document.getElementById('pub-phone-box').classList.remove('hidden');
                document.getElementById('pub-site-box').classList.remove('hidden');
                document.getElementById('pub-desc-box').classList.remove('hidden');
                
                document.getElementById('pub-phone').textContent = user.phone || 'Não informado';
                document.getElementById('pub-desc').textContent = user.description || 'Sem descrição.';
                const siteEl = document.getElementById('pub-site');
                if (user.website) {
                    siteEl.href = user.website.startsWith('http') ? user.website : `https://${user.website}`;
                    siteEl.textContent = user.website;
                } else {
                    siteEl.textContent = 'Não informado';
                    siteEl.removeAttribute('href');
                }
            } else {
                document.getElementById('pub-phone-box').classList.add('hidden');
                document.getElementById('pub-site-box').classList.add('hidden');
                document.getElementById('pub-desc-box').classList.add('hidden');
            }
        }
    });
}

function toggleRegisterType(t) { document.getElementById('opt-pessoa').classList.toggle('active',t=='pessoa'); document.getElementById('opt-ong').classList.toggle('active',t=='ong'); document.getElementById('ong-reg-fields').classList.toggle('hidden',t!='ong'); }
function setupCNPJMask() { const e = document.getElementById('reg-cnpj'); if(e) e.addEventListener('input', ev => { let x=ev.target.value.replace(/\D/g,'').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/); ev.target.value=!x[2]?x[1]:x[1]+'.'+x[2]+'.'+x[3]+'/'+x[4]+(x[5]?'-'+x[5]:''); }); }

function seedInitialData() {
    const examples = [
        { id: 'ex1', title: 'Ração de Gato (Exemplo)', category: 'Animais', org: 'Sistema ByeBuy', bairro: 'Icaraí', type: 'donation', condition: 'Novo', image: null },
        { id: 'ex2', title: 'Cestas Básicas (Exemplo)', category: 'Alimentos', org: 'ONG Esperança', bairro: 'Centro', type: 'need', total: 100, current: 45, image: null }
    ];
    itemsCache = examples;
    renderCurrentFeed();
}