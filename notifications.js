// Sniper mOS - Bildirim Yönetim Modülü (Final Sürüm)

const VAPID_PUBLIC_KEY = "BP1N_z6QPXOdiKrZvUy0rQAjbUxq2raNBnn2Y2GACPDh8momEK1IwXhTcT8NpebJQfTOWZX-Rvqu38E6uZqSCkU";

async function subscribeUserToPush() {
    console.log("Sniper: Bildirim süreci başlatılıyor...");

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Hata: Tarayıcı bildirim desteği yok.');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Tarayıcıdan abonelik anahtarını alıyoruz
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY
        });

        // Benzersiz bir ID (p256dh hash) oluşturuyoruz ki aynı cihaz defalarca kaydolmasın
        const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))));

        // --- SUPABASE KAYIT OPERASYONU ---
        // Tablo adını 'subscriptions' olarak güncelledik (SQL ile uyumlu)
        const { error } = await _supabase
            .from('subscriptions')
            .upsert([
                { 
                    user_name: 'Efe Can', // Burayı sevgilin için 'Sevgilim' olarak değiştirebilirsin
                    subscription_data: subscription, 
                    p256dh_hash: p256dh,
                    device_info: navigator.userAgent.split(') ')[0].split(' (')[1] || 'Bilinmeyen Cihaz',
                    is_active: true
                }
            ], { onConflict: 'p256dh_hash' }); // Aynı cihazsa veriyi güncelle, yeni satır açma

        if (error) throw error;

        console.log('Sniper: Cihaz başarıyla mühürlendi!', subscription);
        alert("Sniper mOS: Bildirimler aktif, cihaz merkeze kaydedildi!");
        
        checkNotificationStatus();
        
    } catch (error) {
        console.error('Sniper Hatası:', error);
        alert("Kayıt işlemi başarısız: " + error.message);
    }
}

// Butonun görünüp görünmeyeceğine karar veren fonksiyon
async function checkNotificationStatus() {
    const btn = document.getElementById('notification-btn');
    if (!btn) return;

    if (!('Notification' in window)) {
        btn.style.display = 'none';
        return;
    }

    if (Notification.permission === 'granted') {
        btn.style.display = 'none'; // Zaten izin verilmişse butonu gizle
    } else {
        btn.style.display = 'flex'; // İzin yoksa butonu göster
    }
}

// Sayfa yüklendiğinde buton durumunu kontrol et
window.addEventListener('load', checkNotificationStatus);