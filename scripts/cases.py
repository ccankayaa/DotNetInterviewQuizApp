"""Editorially authored, bilingual senior-level practical cases.

All correct answers are independently checked against documented semantics.
Cases are intentionally separate from concept-drill templates.
"""
CASES=[]
def add(slug, topic, cat, tr, en, tr_options, en_options, correct, explanation_tr, explanation_en, code=None, level='advanced'):
    row={'id':'case--'+slug,'topicId':topic,'category':cat,'level':level,
         'prompt':{'tr':tr,'en':en},'options':{'tr':tr_options,'en':en_options},
         'correctIndex':correct,'explanation':{'tr':explanation_tr,'en':explanation_en}}
    if code:row['code']=code
    CASES.append(row)

add('boxing-object','boxing-and-unboxing','runtime',
    'Aşağıdaki kodun Allocation davranışı hangisidir?',
    'Which allocation behavior is correct for this code?',
    ['value her iterasyonda heap üzerinde yeni object olarak box edilebilir.','Console.WriteLine GC.Collect işlemini zorunlu çağırır.','int değer tipi olduğundan bu kodda hiçbir boxing olamaz.','Boxing her zaman yalnızca stack üzerinde gerçekleşir.'],
    ['value may be boxed into a new heap object on each iteration.','Console.WriteLine must force a GC.Collect call.','No boxing is possible because int is a value type.','Boxing always happens only on the stack.'],0,
    'object o = value satırı value type değerinin object referansına dönüşmesini, yani boxing tahsisini gerektirir. JIT optimizasyonlarını ayrıca ölçmek gerekir; tasarım düzeyinde tip dönüşümü boxing semantiğine sahiptir.',
    'object o = value requires boxing a value type into an object reference. Specific JIT optimizations should be measured separately; the conversion has boxing semantics.',
    'for (int i = 0; i < 1000; i++) { int value = i; object o = value; }')

add('asynclocal-thread','threadpool-starvation','concurrency',
    'ASP.NET Core request handler, dış HTTP çağrısını Task.Result ile bekliyor. Trafik artınca CPU %20 iken latency yükseliyor. İlk ne incelenmeli?',
    'An ASP.NET Core handler blocks on Task.Result for outbound HTTP. Latency spikes under load while CPU stays at 20%. What comes first?',
    ['CPU kullanımı düşük olduğundan sunucu sayısı düşürülmeli.','ThreadPool starvation ve sync-over-async kaldırma incelenmeli.','Task.Result çevresine global lock eklenmeli.','Daha sık GC.Collect çağrılmalı.'],
    ['Reduce server count because CPU is low.','Check ThreadPool starvation and remove sync-over-async.','Add a global lock around Task.Result.','Call GC.Collect more often.'],1,
    'Bloklanan worker thread sayısı arttığında işler kuyruğa girer; CPU düşük kalsa da istekler bekler. Gerçek async I/O kullanımı ve ThreadPool queue/worker sayaçları incelenmelidir.',
    'Blocked workers cause queued requests even at low CPU use. Use real async I/O and inspect ThreadPool queues and worker counters.',
    'public IActionResult Get() => Ok(_client.GetAsync(url).Result);')

add('scoped-in-singleton','di-lifetimes-and-captive-dependencies','aspnet',
    'AddSingleton<ReportCache>() kaydı olan servis constructor üzerinden scoped DbContext alıyor. En doğru çözüm?',
    'A service registered with AddSingleton<ReportCache>() takes a scoped DbContext in its constructor. What is the sound fix?',
    ['Scope validation kapatılmalı.','DbContext statik alana taşınmalı.','Gerçek kullanıma göre lifetime yeniden tasarlanmalı veya iş başına IServiceScopeFactory kullanılmalı.','DbContext transient yapılınca tüm problemler biter.'],
    ['Disable scope validation.','Store DbContext in a static field.','Redesign lifetimes or create a per-operation scope with IServiceScopeFactory.','Making DbContext transient fixes everything.'],2,
    'Scoped servis singleton içine hapsedilirse yaşam süresi ve thread-safety ihlal edilir. Scoped iş bağımlılıkları için her operasyonun kendi scope sahibi olması gerekir.',
    'Capturing a scoped dependency inside a singleton violates lifetime and thread-safety assumptions. A per-operation scope should own scoped work.')

add('global-asax-migration','global-asax-and-classic-asp-net','aspnet',
    'ASP.NET MVC 5 projesindeki Global.asax/Application_Start mantığını .NET 10 ASP.NET Core uygulamasına taşıyorsun. Hangisi doğrudur?',
    'You migrate ASP.NET MVC 5 Global.asax/Application_Start code to an ASP.NET Core application. Which statement is correct?',
    ['Global.asax olduğu gibi kopyalanıp otomatik çalışır.','web.config içindeki tüm System.Web modülleri çalışmaya devam eder.','Startup yalnızca IIS event handler ile yapılır.','Service registration ve HTTP pipeline, Program.cs / modern hosting ve middleware ile yeniden tasarlanır.'],
    ['Copying Global.asax makes it run as-is.','All System.Web modules in web.config keep running unchanged.','Startup runs only through IIS event handlers.','Redesign registration and request pipeline through Program.cs / modern hosting and middleware.'],3,
    'Global.asax System.Web mimarisine aittir. ASP.NET Core farklı hosting ve middleware modelindedir; kavramsal eşleme ve API migration gerektirir.',
    'Global.asax belongs to System.Web. ASP.NET Core uses a different hosting and middleware model; map responsibilities and migrate APIs.')

add('reflection-aot','reflection-and-metadata-access','runtime',
    'Reflection.Emit ile runtime type üreten bir plugin uygulamasını Native AOT olarak yayınlamak istiyorsun. Asıl engel nedir?',
    'You want to publish a plugin system that emits runtime types through Reflection.Emit as Native AOT. What is the blocker?',
    ['Native AOT runtime dinamik kod üretimini desteklemediğinden tasarım değişmeli.','C# generic tipler hiçbir AOT derlemesine alınamaz.','JIT kodu küçültmediği için tek sebep disk boyutudur.','Sadece NuGet sürümü değiştirmek runtime emit garantiler.'],
    ['Native AOT does not support runtime code generation, so the design must change.','C# generics cannot be compiled with AOT at all.','Disk size is the only reason because JIT cannot shrink code.','Changing a NuGet version guarantees runtime emit support.'],0,
    'Native AOT uygulama yayımlandığında makine kodu üretir; runtime Reflection.Emit gibi dinamik kod üretimi yoktur. Kaynak üretici veya statik kayıt tercih edilebilir.',
    'Native AOT compiles machine code at publish time and disallows runtime code emission such as Reflection.Emit. Source generation or static registration may be viable alternatives.')

add('value-task-double-await','task-versus-valuetask','concurrency',
    'IValueTaskSource arkasına dayanabilecek bir ValueTask<int> sonucu iki defa await ediliyor. Ne söylenebilir?',
    'A ValueTask<int> backed by IValueTaskSource is awaited twice. What is correct?',
    ['İki kez await, Task için bile yasaktır.','Her durumda ikinci await güvenlidir.','ValueTask genel olarak tek tüketim sözleşmesi taşıyabilir; tekrar bekleme hatalıdır.','ValueTask await edilmeden native thread açar.'],
    ['Awaiting any Task twice is forbidden.','The second await is always safe.','ValueTask may have a single-consumption contract; awaiting it again is invalid.','ValueTask creates a native thread before await.'],2,
    'ValueTask bazı kaynaklar için birden fazla await/AsTask/Result erişimine izin vermeyebilir. Paylaşılacak çoklu tüketimli sonuç için Task sözleşmesi daha uygundur.',
    'ValueTask may prohibit multiple awaits or repeated AsTask/Result access with certain backing sources. Use Task when the result needs multiple consumers.')

add('aspnet-middleware-order','middleware-ordering','aspnet',
    'Aşağıdaki middleware sıralaması yetki sorunları üretiyor. Tipik pipeline’da hangi düzeltme gerekir?',
    'This middleware setup causes authorization failures. What is the typical ordering fix?',
    ['UseAuthorization, UseAuthentication öncesine konmalıdır.','UseAuthentication, UseAuthorization öncesinde çalışmalıdır.','Tüm middleware sırası request routing’den bağımsızdır.','Authorization middleware global exception handling yerine geçer.'],
    ['Place UseAuthorization before UseAuthentication.','Run UseAuthentication before UseAuthorization.','Middleware order is independent of request routing.','Authorization replaces global exception handling.'],1,
    'Authentication kimliği kurar; authorization bu kimliğin endpoint’e erişim hakkını değerlendirir. Tipik modern pipeline’da authentication, authorization öncesindedir.',
    'Authentication establishes identity; authorization then evaluates access rights. In a typical pipeline, authentication precedes authorization.',
    'app.UseAuthorization();\napp.UseAuthentication();\napp.MapControllers();')

add('ef-query-split','ef-core-split-queries','data',
    'Bir blogun 10 post ve 10 contributor ilişkisi tek SQL JOIN ile include edildiğinde neye dikkat edilir?',
    'A blog has 10 posts and 10 contributors included through sibling JOINs. What should you check?',
    ['Tek query tüm ilişkileri otomatik 20 satırda getirir.','AsNoTracking tüm JOIN çarpımını kaldırır.','Lazy loading garanti olarak daha az sorgu üretir.','Sibling collection JOIN, 100 birleşik satıra kadar büyüyebilir; split query’nin latency/tutarlılık maliyeti de ölçülmelidir.'],
    ['One query always returns exactly 20 combined rows.','AsNoTracking removes all JOIN multiplication.','Lazy loading always emits fewer queries.','Sibling collection JOINs can produce 100 combined rows; split-query latency/consistency costs must also be measured.'],3,
    'İki sibling collection, 10 × 10 satır üretebilir. Split query çarpımı azaltır fakat ayrı sorgular arasında değişiklik görülebilir; gereğinde transaction izolasyonu düşünülür.',
    'Two sibling collections can yield 10 × 10 joined rows. Splitting reduces the cross product but can observe changes between statements; consider isolation where needed.')

add('payment-duplicate','idempotency-keys-in-payments','dist',
    'Ödeme isteği başarılı DB commit sonrası response dönmeden kopuyor; istemci aynı idempotency key ile tekrar gönderiyor. Doğru sunucu davranışı?',
    'A payment commits to the DB but the response is lost. The client retries with the same idempotency key. What should the server do?',
    ['Aynı doğrulanmış isteğin önceden kaydedilmiş sonucunu döndürüp ikinci charge yaratmamalı.','Yeni HTTP isteği olduğundan ikinci charge yaratmalı.','Güvenli olmak için 30 saniye tüm ödemeleri kapatmalı.','Sadece client tarafında butonu disable etmek yeterli.'],
    ['Return the durable prior outcome for the same verified request without a second charge.','Create another charge because this is a new HTTP request.','Disable all payments for 30 seconds.','Disabling the client button is sufficient.'],0,
    'İş etkisini bir kez uygulama, key/fingerprint ve sonuç kaydının atomik korunmasını gerektirir. Yanıt kaybı ödeme tekrarına dönüşmemelidir.',
    'Effect-once behavior requires atomically preserving key/fingerprint and outcome. A lost response must not become a duplicate charge.')

add('outbox-dual-write','transactional-outbox','dist',
    'Veritabanı INSERT başarılı, ardından Kafka publish sırasında uygulama çöküyor. Dual-write kaybını hangi yaklaşım azaltır?',
    'The DB INSERT commits, then the application crashes before publishing to Kafka. Which approach addresses the dual-write gap?',
    ['Sadece daha uzun timeout kullanmak.','DB transaction içinde outbox kaydı, sonrasında güvenli relay ve idempotent consumer.','Her event için Thread.Sleep eklemek.','HTTP yanıtını retry ederek broker’a mesaj üretilmesini varsaymak.'],
    ['Only increase the timeout.','Write an outbox row in the DB transaction, then use a relay and idempotent consumer.','Add Thread.Sleep for each event.','Retry the HTTP response and assume it publishes to the broker.'],1,
    'Outbox domain state ile mesaj niyetini aynı transaction’a alır. Relay en az bir kez teslimat üretebilir; tüketici tekrarları tolere etmelidir.',
    'Outbox makes the domain state and message intent atomic in the database. Relay may publish more than once; consumers must tolerate duplicates.')

add('fencing-stale-holder','fencing-tokens-and-distributed-locks','dist',
    'Lock lease süresi dolan worker duraklamadan dönüp yeni lock sahibinin yazdığı veriyi eziyor. Asıl koruma?',
    'A paused worker resumes after its lock lease expires and overwrites a newer holder. What is the key protection?',
    ['Worker sleep süresini rastgele artırmak.','Redis TTL’yi sıfıra çekmek.','Veri kaynağına monoton artan fencing token doğrulaması eklemek.','Tüm kilitleri tek process belleğinde saklamak.'],
    ['Add random worker sleep.','Set Redis TTL to zero.','Enforce monotonically increasing fencing tokens at the protected resource.','Store all locks only in one process memory.'],2,
    'Eski lock sahibinin yazısını ancak korunan kaynakta eski token reddederek güvenilir şekilde durdurabilirsiniz. Lease tek başına stale writer’ı önlemez.',
    'The protected store must reject writes carrying stale fencing tokens. A lease alone cannot reliably stop an expired holder.')

add('aes-gcm-nonce','symmetric-encryption-and-aead','security',
    'AES-GCM aynı key altında aynı nonce ile iki farklı plaintext şifreliyor. Değerlendirme?',
    'AES-GCM encrypts two distinct plaintexts using the same key and nonce. What is the assessment?',
    ['Nonce tekrarı güvenliğe zarar vermez.','Yalnızca key 128-bit olunca tehlikelidir.','Nonce reuse hem gizlilik hem bütünlük garantilerini ciddi şekilde riske atabilir.','GCM otomatik olarak tek yönlü hash’e dönüşür.'],
    ['Nonce reuse is harmless.','It matters only with 128-bit keys.','Nonce reuse can seriously compromise confidentiality and integrity guarantees.','GCM automatically becomes a one-way hash.'],2,
    'GCM nonce benzersizliği kritik bir kriptografik sözleşmedir. Aynı key/nonce tekrarında ciddi saldırı imkânları oluşur; standart AEAD kütüphanesi ve nonce politikası kullanın.',
    'Nonce uniqueness is a critical GCM security property. Reusing a key/nonce pair can enable serious attacks; use a reviewed AEAD library and nonce policy.')

add('password-storage','argon2id-password-hashing','security',
    'Bir geliştirici parola saklamayı SHA256(password) ile uyguluyor. Senior review için doğru karar?',
    'A developer stores passwords as SHA256(password). What should a senior reviewer require?',
    ['Hash uzunluğunu 512-bit’e çıkarınca yeterli.','Parolayı AES ile şifreleyip ortak anahtarı kodda saklamalı.','Tüm kullanıcılara tek ortak salt eklemek yeterli.','Bellek maliyetli, per-user salt kullanan güvenilir Argon2id/suitable password KDF tercih edilmeli.'],
    ['A 512-bit output fixes the issue.','Encrypt with AES and hardcode a shared key.','Use a single salt shared across users.','Use a reviewed, memory-hard password KDF such as Argon2id with per-user salts.'],3,
    'Hızlı hash offline guessing’e çok ucuz deneme sağlar. Modern password KDF salt ve ayarlanabilir hesaplama/bellek maliyetiyle saldırı maliyetini yükseltir.',
    'Fast hashes allow cheap offline guesses. A modern password KDF uses salts and tunable work/memory cost to raise attacker expense.')

add('jwt-audience','jwt-validation-and-key-rotation','security',
    'İmzası geçerli bir JWT başka API için üretilmiş, fakat bizim API kabul ediyor. Eksik kontrol hangisidir?',
    'A correctly signed JWT was issued for another API, but yours accepts it. What check is missing?',
    ['audience (aud) doğrulaması.','JSON pretty print.','Daha büyük HTTP body sınırı.','Cache-Control max-age.'],
    ['audience (aud) validation.','JSON pretty-printing.','Larger HTTP body limits.','Cache-Control max-age.'],0,
    'İmzanın geçerli olması token’ın hedef sistem ve doğru issuer için düzenlendiği anlamına gelmez. audience, issuer, algorithm ve exp doğrulaması gerekir.',
    'A valid signature does not imply the token targets your API or issuer. Validate audience, issuer, allowed algorithm, and expiration.')

add('mvcc-write-skew','mvcc-and-snapshot-isolation','data',
    'Snapshot isolation altında iki doktor aynı anda “diğeri nöbette” kontrolünü görüp kendi nöbetlerini kapatıyor. Hangi anomali?',
    'Under snapshot isolation, two doctors both see the other on call and independently go off call. What anomaly occurred?',
    ['Dirty read.','Write skew; ilişkili invariant serializable işlem veya açık kilitle korunmalı.','TCP head-of-line blocking.','Index fragmentation.'],
    ['Dirty read.','Write skew; protect the invariant with serializable handling or explicit locking.','TCP head-of-line blocking.','Index fragmentation.'],1,
    'Farklı satırlardaki yazılar çatışmıyor gibi görünse de ortak iş invariant’ı bozulur. Snapshot isolation her serializability gereğini karşılamaz.',
    'Updates to different rows can each appear valid while violating a cross-row invariant. Snapshot isolation does not guarantee full serializability.')

add('linux-sigkill','linux-signals-and-graceful-shutdown','os',
    'Kubernetes pod SIGKILL alıyor ve background worker finally bloğu çalışmadan kapanıyor. Doğru açıklama?',
    'A Kubernetes pod receives SIGKILL and its worker exits without executing finally. What explains this?',
    ['SIGKILL zorla sonlandırır; önce SIGTERM/graceful stop ve durable checkpoint tasarlanmalı.','finally C# dilinde hiç çalışmaz.','SIGKILL mutlaka tüm async task’ları tamamlatır.','Sadece thread priority yükseltilmeli.'],
    ['SIGKILL terminates forcibly; design SIGTERM/graceful stop and durable checkpoints first.','finally never works in C#.','SIGKILL always completes pending async tasks.','Only increase thread priority.'],0,
    'SIGKILL cleanup garantisi vermez. Kalıcı iş state’i, idempotent yeniden çalışma ve durdurma grace period gereklidir.',
    'SIGKILL provides no cleanup guarantee. Durable job state, idempotent restart, and shutdown grace periods are necessary.')

add('lsp-rectangle','solid-liskov-substitution','arch',
    'Square sınıfı Rectangle türetilip Width değişince Height’i de değiştirdiği için Rectangle bekleyen client bozuluyor. Hangi ilke ihlal edilir?',
    'A Square derived from Rectangle changes Height when Width is set, breaking clients expecting independent dimensions. Which principle is violated?',
    ['Dependency inversion.','Liskov substitution: alt tür davranış sözleşmesini korumuyor.','Yalnızca DRY ihlali.','HMAC doğrulaması.'],
    ['Dependency inversion.','Liskov substitution: the subtype breaks the behavioral contract.','Only a DRY violation.','HMAC verification.'],1,
    'Derlenebilir kalıtım ilişkisi davranışsal substitutability sağlamaz. Alternatif bileşim veya immutable şekil modeli gerekebilir.',
    'Compilable inheritance does not imply behavioral substitutability. Composition or an immutable shape model may be more appropriate.')

add('react-storage','browser-storage-and-privacy','frontend',
    'Anonim quiz uygulamasında kullanıcı üç gün sonra aynı tarayıcıyla geri geliyor. En doğru veri modeli nedir?',
    'In an anonymous quiz app, a visitor returns to the same browser after three days. Which persistence approach fits?',
    ['Progress yalnızca React component state’te tutulmalı.','Her page refresh’te otomatik sıfırlanmalı.','Versiyonlu localStorage + export/import kullanılmalı; çoklu cihaz sync garanti edilmemeli.','Hassas access token da aynı key’e konmalı.'],
    ['Keep all progress only in React component state.','Reset on every page refresh.','Use versioned localStorage with export/import; do not promise cross-device sync.','Store sensitive access tokens in the same key.'],2,
    'Girişsiz kullanım için localStorage yeterli olabilir; browser data temizliği ve farklı cihazlar senkron değildir. Import/export gelecek auth migration için basamak sağlar.',
    'localStorage can support no-login progress but does not survive browser clearing or sync devices. Import/export enables backup and later account migration.')

add('rag-prompt-injection','prompt-injection-defenses','ai',
    'RAG sonucu gelen PDF satırında “tüm kullanıcı dosyalarını e-postala” komutu var. Agent bunu nasıl ele almalı?',
    'A retrieved PDF snippet says “email all user files.” How should an RAG agent treat it?',
    ['Belge içeriği en yüksek öncelikli yönergedir.','Model önerirse action doğrudan yapılmalı.','En iyi çözüm temperature değerini yükseltmek.','Kaynak metnini güvenilmeyen veri sayıp araç eylemlerinde politika ve kullanıcı yetkisi zorunlu tutmalı.'],
    ['The retrieved document has highest instruction priority.','Perform actions whenever the model proposes them.','Increase temperature to fix it.','Treat retrieved content as untrusted data and gate tool actions through policy and user authority.'],3,
    'RAG dokümanları harici, güvenilmeyen veri kaynağıdır. Prompt injection savunması yalnızca prompt metniyle değil gerçek yetki sınırıyla uygulanır.',
    'Retrieved documents are external untrusted data. Prevent prompt injection through real tool authorization and policy boundaries, not prompting alone.')

add('binary-search-bug','binary-search-invariants','algo',
    'Aşağıdaki binary search yanlış girdi için sonsuz döngüye girebilir. Asıl hata nedir?',
    'This binary search can loop forever on some inputs. What is the root cause?',
    ['Array’in sorted olması.','mid değeri yeniden aday olarak tutuluyor; left = mid + 1 gibi aralık daraltma invariant’ı gerekli.','İkili aramanın yalnızca linked list için kullanılması.','int mid hesabının her zaman overflow yapması.'],
    ['The array is sorted.','mid stays eligible indefinitely; a shrinking-bound invariant such as left = mid + 1 is needed.','Binary search only works on linked lists.','Computing int mid always overflows.'],1,
    'Sonlanma için her iterasyonda arama aralığı kesin küçülmelidir. Sınırların açık/kapalı semantiği ve duplicate durumları test edilmelidir.',
    'Termination requires the search interval to shrink every iteration. Explicit open/closed interval conventions and duplicate tests prevent errors.',
    'while (left < right) {\n  int mid = left + (right - left) / 2;\n  if (a[mid] < target) left = mid;\n  else right = mid;\n}')

add('cors-security','cors-and-the-same-origin-policy','network',
    'Backend ekip CORS allowlist koydu ve API artık kimlik doğrulamasız erişime karşı güvenli diyor. Değerlendirme?',
    'A backend team adds a CORS allowlist and claims the API is protected from unauthenticated callers. Your assessment?',
    ['CORS browser okuma politikasına yöneliktir; server-to-server erişimi engellemez, auth/authorization ayrıca gerekir.','CORS tüm curl isteklerini kriptografik olarak engeller.','CORS yalnızca TCP portlarını kapatır.','Origin header kimlik belgesidir.'],
    ['CORS controls browser cross-origin reads; it does not block server-to-server callers, so auth/authorization are separate.','CORS cryptographically blocks every curl request.','CORS only closes TCP ports.','Origin headers prove user identity.'],0,
    'CORS tarayıcı davranışıyla sınırlıdır. Sunucu kimlik ve nesne yetkisini her durumda kendi doğrulamalıdır.',
    'CORS is a browser-side enforcement mechanism. The server must independently validate authentication and object-level authorization.')

add('what-does-senior-do','communicating-architecture-trade-offs','leadership',
    'Bir ekip her servisi mikroservise bölmek istiyor; trafik düşük, release süreci tek ekip. Kıdemli mühendis hangi yaklaşımı önermeli?',
    'A single team with low traffic wants to split every capability into microservices. What is a mature recommendation?',
    ['Mikroservis her koşulda zorunludur.','Monolit teknik olarak scale edilemez.','İş/sahiplik sınırlarını ve operasyonel maliyeti analiz edip modüler monoliti de seçenek olarak değerlendirmek.','Yalnızca en güncel framework seçimini kıstas yapmak.'],
    ['Microservices are always mandatory.','Monoliths cannot scale.','Compare ownership boundaries and operational cost; include a modular monolith as an option.','Decide only by choosing the newest framework.'],2,
    'Senior mimari kararı moda teknolojiye değil kısıt ve ödünleşimlere dayandırır. Ayrıştırma için gerçek bağımsız deploy/scale ihtiyacı doğrulanmalıdır.',
    'A senior decision is based on constraints and trade-offs, not trends. Independently deployable boundaries should be justified by real needs.')
