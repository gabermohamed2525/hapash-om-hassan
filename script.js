// المنتجات الافتراضية
let defaultProducts = [
    { id: 1, name: "جبنه قريش فلاحي", price: 90, badge: "90ج الكيلو", image_url: "جبنه قريش فلاحي ب90ج الكيلو.jpg", description: "جبن قريش ريفي غني بالقشطة والبروتين الطبيعي." },
    { id: 2, name: "زبده ام حسن الفلاحي", price: 250, badge: "250ج الكيلو", image_url: "زبده ام حسن الفلاحي 250ج الكيلو.jpg", description: "زبدة فلاحي أصلية 100% مثالية للأكلات الشرقية." },
    { id: 3, name: "وقية سمنه جاموسي", price: 440, badge: "440ج (كيلو وربع)", image_url: "وقه سمنه جاموسي 440ج وزن الوقه كيلو وربع.jpg", description: "سمن جاموسي مركز، وزن الوقية كيلو وربع." },
    { id: 4, name: "رنجه بطارخ", price: 160, badge: "160ج الكيلو", image_url: "رنجه بطارخ 160ج الكيلو.jpg", description: "رنجة مدخنة بطارخ ممتازة وطرية وعالية الجودة." },
    { id: 5, name: "ورقة سمنه بقري", price: 380, badge: "كيلو وربع", image_url: "ورقه سمنه بقري وزنها كيلو وربع سمنه.jpg", description: "سمن بقري صافي معبأ في ورقة ريفية أصلية." }
];

// جلب البيانات من LocalStorage
let products = JSON.parse(localStorage.getItem("store_products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("store_cart")) || [];

// متغيرات التصفية والبحث
let currentCategory = 'all';

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    renderProducts(products);
    updateCartUI();
    updateDashboardCount();
});

// عرض المنتجات في المتجر الرئيسي مع دعم الفلترة والبحث
function renderProducts(productsToRender) {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";

    if (productsToRender.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#777; padding:40px;">عذراً، لم نجد منتجات تطابق بحثك.</p>`;
        return;
    }

    productsToRender.forEach(prod => {
        grid.innerHTML += `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <span class="product-badge">${prod.badge}</span>
                    <img src="${prod.image_url}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/300x200?text=ترحاب+أم+حسن'">
                </div>
                <div class="product-info">
                    <div>
                        <h3 class="product-title">${prod.name}</h3>
                        <p class="product-desc">${prod.description}</p>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">${prod.price} ج.م</span>
                        <button class="buy-btn" onclick="addToCart(${prod.id})">
                            <i class="fa-solid fa-cart-plus"></i> أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// دالة البحث الفوري (Live Search) والفلترة معاً
function filterProducts() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();

    let filtered = products.filter(prod => {
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesDesc = prod.description.toLowerCase().includes(query);
        const isMatchQuery = matchesName || matchesDesc;

        if (currentCategory === 'all') return isMatchQuery;
        
        // تصنيف مبسط بناءً على اسم المنتج
        let matchCat = false;
        if (currentCategory === 'جبن' && prod.name.includes('جبن')) matchCat = true;
        if (currentCategory === 'سمن' && (prod.name.includes('سمن') || prod.name.includes('زبده'))) matchCat = true;
        if (currentCategory === 'رنجة' && prod.name.includes('رنجه')) matchCat = true;

        return isMatchQuery && matchCat;
    });

    renderProducts(filtered);
}

// تغيير الأقسام عبر الأزرار
function setCategory(category, btnElement) {
    currentCategory = category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    filterProducts();
}

// إشعار Toast احترافي
function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const msgEl = document.getElementById("toastMessage");
    msgEl.innerText = message;
    
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// إدارة سلة المشتريات
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح`);
}

function updateQty(productId, delta) {
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(p => p.id !== productId);
        }
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem("store_cart", JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.getElementById("cartItemsContainer");
    const countBadge = document.getElementById("cartCount");
    const totalPriceEl = document.getElementById("cartTotalPrice");

    let totalCount = 0;
    let totalPrice = 0;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<p style="color:#777; text-align:center; margin-top:40px;">السلة فارغة حالياً</p>`;
    } else {
        cart.forEach(item => {
            totalCount += item.qty;
            totalPrice += item.price * item.qty;

            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span>${item.price} ج.م × ${item.qty}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
        });
    }

    countBadge.innerText = totalCount;
    totalPriceEl.innerText = totalPrice + " ج.م";
}

function toggleCartDrawer() {
    document.getElementById("cartDrawer").classList.toggle("open");
    document.getElementById("cartOverlay").style.display = document.getElementById("cartDrawer").classList.contains("open") ? "block" : "none";
}

function openCheckoutModal() {
    if (cart.length === 0) {
        alert("سلتك فارغة!");
        return;
    }
    toggleCartDrawer();
    document.getElementById("checkoutModal").classList.add("active");
}

function closeCheckoutModal() {
    document.getElementById("checkoutModal").classList.remove("active");
}

function sendWhatsAppOrder(e) {
    e.preventDefault();
    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const address = document.getElementById("clientAddress").value.trim();

    let itemsText = cart.map(item => `▪️ ${item.name} (الكمية: ${item.qty}) - السعر: ${item.price * item.qty} ج.م`).join('\n');
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const message = `🛒 *طلب جديد عبر متجر ترْحاب أم حسن*\n\n` +
                    `📋 *المنتجات المطلوبة:*\n${itemsText}\n\n` +
                    `💰 *الإجمالي الكلي:* ${totalPrice} ج.م\n\n` +
                    `👤 *اسم العميل:* ${name}\n` +
                    `📱 *رقم الهاتف:* ${phone}\n` +
                    `📍 *العنوان:* ${address}\n\n` +
                    `يرجى تأكيد الطلب وتحديد موعد التوصيل. شكراً!`;

    window.open(`https://wa.me/201025134834?text=${encodeURIComponent(message)}`, '_blank');

    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();
    document.getElementById("checkoutForm").reset();
}

// لوحة التحكم والداشبورد
// الرمز السري الخاص بالمتجر (يمكنك تغييره متى شئت)
const OWNER_PIN = "1234";

// عند الضغط على زر لوحة التحكم، افتح نافذة إدخال الباسورد الاحترافية بدلاً من prompt
function openDashboardModal() {
    document.getElementById("ownerPinInput").value = "";
    document.getElementById("ownerLoginModal").classList.add("active");
    setTimeout(() => {
        document.getElementById("ownerPinInput").focus();
    }, 100);
}

function closeOwnerLoginModal() {
    document.getElementById("ownerLoginModal").classList.remove("active");
}

// التحقق من الرمز السري المدخل
function verifyOwnerPin(e) {
    e.preventDefault();
    const enteredPin = document.getElementById("ownerPinInput").value;

    if (enteredPin === OWNER_PIN) {
        closeOwnerLoginModal();
        renderAdminProductsList();
        updateDashboardCount();
        document.getElementById("dashboardModal").classList.add("active");
        showToast("مرحباً بك يا أونر المتجر!");
    } else {
        showToast("❌ الرمز السري غير صحيح!");
        document.getElementById("ownerPinInput").value = "";
        document.getElementById("ownerPinInput").focus();
    }
}

function closeDashboardModal() {
    document.getElementById("dashboardModal").classList.remove("active");
}

function switchDashboardTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.dashboard-tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'add') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tabAdd').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tabManage').classList.add('active');
        renderAdminProductsList();
    }
}

function renderAdminProductsList() {
    const listContainer = document.getElementById("adminProductsList");
    listContainer.innerHTML = "";

    if (products.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; color:#777; padding:20px;">لا توجد منتجات حالياً</p>`;
        return;
    }

    products.forEach(prod => {
        listContainer.innerHTML += `
            <div class="admin-product-row">
                <div class="admin-prod-info">
                    <img src="${prod.image_url}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/50?text=صورة'">
                    <div>
                        <h4>${prod.name}</h4>
                        <span>${prod.price} ج.م</span>
                    </div>
                </div>
                <div class="admin-prod-actions">
                    <button class="delete-prod-btn" onclick="deleteProduct(${prod.id})">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `;
    });
}

function deleteProduct(id) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem("store_products", JSON.stringify(products));
        renderProducts(products);
        renderAdminProductsList();
        updateDashboardCount();
        showToast("تم حذف المنتج بنجاح");
    }
}

function addNewProduct(e) {
    e.preventDefault();
    
    const imageInput = document.getElementById("adminImageFile");
    const file = imageInput.files[0];

    if (!file) {
        alert("يرجى اختيار صورة للمنتج!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Image = event.target.result;

        const newProd = {
            id: Date.now(),
            name: document.getElementById("adminName").value,
            price: Number(document.getElementById("adminPrice").value),
            badge: document.getElementById("adminBadge").value,
            image_url: base64Image,
            description: document.getElementById("adminDesc").value
        };

        products.push(newProd);
        localStorage.setItem("store_products", JSON.stringify(products));

        renderProducts(products);
        renderAdminProductsList();
        updateDashboardCount();
        
        document.getElementById("adminForm").reset();
        showToast("تم إضافة المنتج بنجاح!");
        switchDashboardTab('manage');
    };

    reader.readAsDataURL(file);
}

function updateDashboardCount() {
    document.getElementById("dashboardCount").innerText = products.length;
}