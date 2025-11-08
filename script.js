document.addEventListener('DOMContentLoaded', () => {
  const dbRef = firebase.firestore();
  const pageCategory = document.body.dataset.category; // تحديد القسم من data-category في <body>
  const grid = document.getElementById('productsGrid');
  const logoEl = document.getElementById('site-logo');
  const waEl = document.getElementById('wa-number');

  // جلب الشعار وواتساب
  dbRef.collection('settings').doc('main').onSnapshot(doc => {
    if(!doc.exists) return;
    const data = doc.data();
    if(data.logo && logoEl) logoEl.src = data.logo;
    if(data.whatsapp && waEl) {
      waEl.innerHTML = `<a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}" target="_blank">${data.whatsapp}</a>`;
    }
  });

  // جلب المنتجات حسب القسم
  const q = dbRef.collection('products')
             .where('category', '==', pageCategory)
             .orderBy('price','asc');

  q.onSnapshot(snapshot => {
    grid.innerHTML = '';
    if(snapshot.empty){
      grid.innerHTML = '<p>لا توجد منتجات في هذا القسم حالياً.</p>';
      return;
    }
    snapshot.forEach(doc => {
      const p = doc.data();
      const priceNum = parseFloat(p.price)||0;
      const discount = parseFloat(p.discountPercent)||0;
      const after = discount>0 ? (priceNum*(100-discount)/100).toFixed(2) : null;

      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Image'"/>
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="price-row">
          ${after ? `<div class="price-current">${after} ج</div>
                     <div class="price-old">${priceNum} ج</div>
                     <div class="discount-badge">${discount}%</div>`
                 : `<div class="price-current">${priceNum} ج</div>`}
        </div>
      `;
      grid.appendChild(card);
    });
  }, err => {
    console.error(err);
    grid.innerHTML = '<p>فشل تحميل المنتجات.</p>';
  });
});
