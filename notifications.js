// Sniper mOS - Bildirim Yönetim Modülü (Supabase Entegrasyonlu)

async function subscribeUserToPush() {
    console.log("Sniper: Bildirim süreci başlatılıyor...");

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Hata: Tarayıcı bildirim desteği yok.');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const publicKey = 'BK-zE-HA0S_GQ8v64KKy24lTfQ5Tz4CknNwUmUp05emRDH6VcItJGvMwzzezlPJTkhwa5DCI9XVhM6C5TXNO9uk';
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });

        // --- SUPABASE KAYIT OPERASYONU ---
        // index.html içinde tanımladığın _supabase objesini kullanıyoruz
        const { data, error } = await _supabase
            .from('user_subscriptions')
            .upsert([
                { 
                    user_id: 'efe_can', 
                    subscription_data: subscription 
                }
            ], { onConflict: 'user_id' });

        if (error) throw error;

        console.log('Sniper: Kayıt başarılı!', subscription);
        alert("Sniper mOS: Cihaz merkeze başarıyla kaydedildi!");
        
        // Başarılı olduktan sonra butonu gizle
        checkNotificationStatus();
        
    } catch (error) {
        console.error('Sniper Hatası:', error);
        alert("Kayıt işlemi başarısız: " + error.message);
    }
}

async function checkNotificationStatus() {
    const btn = document.getElementById('notification-btn');
    if (!btn) return;

    if (!('Notification' in window) || Notification.permission === 'granted') {
        btn.style.display = 'none';
    } else {
        btn.style.display = 'flex';
    }
}

window.addEventListener('load', checkNotificationStatus);