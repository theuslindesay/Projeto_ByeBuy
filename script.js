const firebaseConfig = {
  apiKey: "AIzaSyDrVDIVgBLPcz34rUOtikR2f-kOBZGYnrI",
  authDomain: "byebuy-861ce.firebaseapp.com",
  projectId: "byebuy-861ce",
  storageBucket: "byebuy-861ce.firebasestorage.app",
  messagingSenderId: "936406311906",
  appId: "1:936406311906:web:e7b579ab1514536d7c4fbb",
  measurementId: "G-4CD5Z7VYZ1"
};  
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

window.onload = function() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection("users").doc(user.uid).get().then((doc) => {
                if(doc.exists) {
                    currentUser = { uid: user.uid, ...doc.data() };
                    updateAuthUI();
                }
            });
        } else {
            currentUser = null;
            updateAuthUI();
        }
    });

    listenToFeed();
    setupCNPJMask();
};

function listenToFeed() {
    const container = document.getElementById('feed-container');
    
    db.collection("items").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        container.innerHTML = '';

        if (snapshot.empty) {
            seedInitialData();
            return;
        }

        snapshot.forEach((doc) => {
            const item = doc.data();
            renderCard(doc.id, item);
        });
    }, (error) => {
        console.error(error);
        container.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar dados.<br>Verifique as Regras do Firebase.</p>`;
    });
}

function renderCard(id, item) {
    const container = document.getElementById('feed-container');
    const imgSrc = item.image ? item.image : 'https://via.placeholder.com/400x200?text=Sem+Foto';
    
    let cardHTML = `<article class="card">`;
    cardHTML += `<img src="${imgSrc}" class="card-img" alt="${item.title}">`;
    cardHTML += `<div class="card-content">`;
    
    if (item.type === 'need') {
        const pct = (item.current / item.total) * 100;
        cardHTML += `
            <span class="tag">${item.category}</span>
            <h3>${item.title}</h3>
            <p class="ong-info"><strong>ONG:</strong> ${item.org} - ${item.bairro}</p>
            <div class="progress-bar-bg">
                <div class="progress-fill" style="width: ${pct}%"></div>
            </div>
            <p style="font-size: 0.8rem;">${item.current} de ${item.total} arrecadados</p>
            <button class="btn-submit" onclick="donateToItem('${id}', ${item.current}, ${item.total})">Doar para este item</button>
        `;
    } else {
        cardHTML += `
            <span class="tag donation">Disponível</span>
            <h3>${item.title}</h3>
            <p class="ong-info"><strong>Doador:</strong> ${item.org} - ${item.bairro}</p>
            <p style="margin-bottom: 5px;"><strong>Condição:</strong> ${item.condition}</p>
            <button class="btn-submit btn-green" onclick="contactDonor()">Tenho Interesse</button>
        `;
    }
    cardHTML += `</div></article>`;
    container.innerHTML += cardHTML;
}

function seedInitialData() {
    const seeds = [
        {
            type: 'need', title: '50 Mochilas Escolares', category: 'Educação',
            org: 'ONG Futuro', bairro: 'Fonseca', current: 15, total: 50,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
            createdAt: Date.now()
        },
        {
            type: 'donation', title: 'Sofá Confortável', category: 'Móveis',
            org: 'Maria Silva', bairro: 'Icaraí', condition: 'Usado - Bom',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
            createdAt: Date.now()
        },
        {
            type: 'need', title: 'Ração para cachorro', category: 'Animais',
            org: 'Cachorrinhos de Icaraí', bairro: 'Icaraí', current: 5, total: 20,
            image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
            createdAt: Date.now()
        }
    ];

    seeds.forEach(s => {
        db.collection("items").add(s);
    });
}

function donateToItem(docId, current, total) {
    if (!currentUser) { alert("Faça login para doar!"); return; }
    if (current < total) {
        db.collection("items").doc(docId).update({
            current: current + 1
        }).then(() => {
            alert("Doação registrada com sucesso!");
        });
    } else {
        alert("Meta já atingida!");
    }
}

function contactDonor() {
    if (!currentUser) { alert("Faça login para contactar!"); return; }
    alert("O doador receberá seu contato por e-mail!");
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const name = document.getElementById('reg-name').value;
    const bairro = document.getElementById('reg-bairro').value;
    const isOng = document.getElementById('opt-ong').classList.contains('active');

    const cnpj = document.getElementById('reg-cnpj').value;

    if (isOng && cnpj.length < 18) {
        alert("Por favor, preencha o CNPJ corretamente.");
        return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        const user = userCredential.user;
        
        const userData = {
            name: name,
            email: email,
            bairro: bairro,
            type: isOng ? 'ONG' : 'Pessoa'
        };

        if (isOng) {
            userData.cnpj = cnpj;
            userData.ongType = document.getElementById('reg-type-ong').value;
        }

        return db.collection("users").doc(user.uid).set(userData);
    })
    .then(() => {
        alert("Conta criada com sucesso!");
        nav('home');
    })
    .catch((error) => {
        alert("Erro ao cadastrar: " + error.message);
    });
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
        nav('home');
    })
    .catch((error) => {
        alert("Erro no login: " + error.message);
    });
}

function logout() {
    auth.signOut().then(() => {
        alert("Você saiu.");
        window.location.reload();
    });
}

function handleCreateItem(e) {
    e.preventDefault();
    if (!currentUser) return;

    const title = document.getElementById('item-title').value;
    const category = document.getElementById('item-category').value;
    const fileInput = document.getElementById('item-image');
    
    const newItem = {
        title: title,
        category: category,
        org: currentUser.name,
        bairro: currentUser.bairro,
        createdAt: Date.now()
    };

    if (currentUser.type === 'ONG') {
        newItem.type = 'need';
        newItem.total = parseInt(document.getElementById('item-total').value);
        newItem.current = 0;
    } else {
        newItem.type = 'donation';
        newItem.condition = document.getElementById('item-condition').value;
    }

    const saveToDb = (base64Img) => {
        newItem.image = base64Img;
        db.collection("items").add(newItem)
        .then(() => {
            closeModal();
            alert("Item publicado!");
            document.querySelector('#modal-item form').reset();
        })
        .catch(err => alert("Erro ao salvar: " + err.message));
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveToDb(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveToDb(null);
    }
}

function setupCNPJMask() {
    const cnpjInput = document.getElementById('reg-cnpj');
    if(cnpjInput) {
        cnpjInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
        });
    }
}

function nav(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
}

function openModal() {
    if (!currentUser) { alert("Faça login!"); nav('login'); return; }
    
    const ongFields = document.getElementById('ong-fields');
    const condFields = document.getElementById('condition-field');
    
    if (currentUser.type === 'ONG') {
        ongFields.classList.remove('hidden');
        condFields.classList.add('hidden');
    } else {
        ongFields.classList.add('hidden');
        condFields.classList.remove('hidden');
    }
    document.getElementById('modal-item').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal-item').classList.add('hidden'); }

function toggleRegisterType(type) {
    const container = document.getElementById('register-toggle');
    const optPessoa = document.getElementById('opt-pessoa');
    const optOng = document.getElementById('opt-ong');
    const ongFields = document.getElementById('ong-reg-fields');

    if (type === 'ong') {
        container.classList.add('toggle-right');
        optOng.classList.add('active');
        optPessoa.classList.remove('active');
        ongFields.classList.remove('hidden');
    } else {
        container.classList.remove('toggle-right');
        optPessoa.classList.add('active');
        optOng.classList.remove('active');
        ongFields.classList.add('hidden');
    }
}

function updateAuthUI() {
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const heroBtn = document.getElementById('btn-hero-action');
    const userGreeting = document.getElementById('user-greeting');

    if (currentUser) {
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        userGreeting.textContent = `Olá, ${currentUser.name}`;
        heroBtn.classList.remove('hidden');
        
        if (currentUser.type === 'ONG') {
            heroBtn.textContent = 'Solicitar';
            heroBtn.classList.remove('btn-blue'); heroBtn.classList.add('btn-green');
        } else {
            heroBtn.textContent = 'Anunciar';
            heroBtn.classList.add('btn-blue');
        }
    } else {
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
        heroBtn.classList.add('hidden');
    }
}

let baseSize = 16;
function resize(val) {
    baseSize += val; if(baseSize < 12) baseSize = 12; if(baseSize > 24) baseSize = 24;
    document.body.style.fontSize = baseSize + 'px';
}