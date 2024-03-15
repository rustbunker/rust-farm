# Kötü Kod İyi Kod

Bu kütüphanede birkaç fonksiyon yer alıyor. Bad olarak işaretlenmiş fonksiyonlar sürdürülebilirlik _(Sustainability)_ açısından negatif etkide olanlar. Ayrıca kütüphanedeki fonksiyonlar için benchmark ölçümleri de var. Aslında Green Coding konsepti kapsamında neler yapılabileceğini araştırıyorum. Green Coding prensiplerini aşağıdaki gibi özetleyebiliriz.

- Efficiency (Verimlilik) : Enerji tüketimini daha iyi kod yazarak azaltmaya çalışmanın bir sonucudur. Bu genellikle algoritmaların zaman (Time) ve boyut (Space) karmaşıklığına göre optimize edilmesi anlamına gelir. Yani Big O mühim bir meseledir.
- Kaynak Tüketiminin Azaltılması (Reduciny Resource Consumption) : CPU ve bellek tüketimini minimum seviyeye çeken veri yapılarının ve algoritmaların kullanılmasını öğütler.
- Ölçeklenebilirlik (Scalability) : Enerji tüketimini doğrusal olarak artırmadan sistemleri doğru şekilde tasarlayabilme prensibidir.
- Tasarımda Sürdürülebilir Olmak (Sustainability in Design) : Yazılan kodun uzun vadede nasıl bir etkisi olacağını düşünme prensibidir. Günü kurtaran kod bile olsa bu kodun uzun vadede ektisinin ne olacağını düşünmek gerekir

## Fibonacci Değeri Hesaplaması

Fibonacci yapısında iki fonksiyon yer alıyor. Aslında bir programlama dilinde öz yinelemeli (Recursive) fonksiyonları öğrenirken sık kullanılan problemlerden birisidir Fibonacci hesaplaması. Ve genellikle calc_worst fonksiyonunda olduğu gibi hesaplanır. calc_worst'te her çağrı n-1 ve n-2 için birer çağrı daha yapar. Yani her seviyede fonksiyon çağrılarının sayısı iki katına çıkar. Dolayısıyla Big O değeri açısından bakarsak Time Complexity değeri O(2^n) olur. Her seviyede fonksiyon çağrılarının sayısı iki katına çıktığı için üssel bir büyüme söz konusudur. Dolayısıyla büyük bir sayı için fibonacci hesaplaması istendiğinde işlem uzun sürer. 51 değeri için bunu deneyebilirsiniz. Bu çok doğal olarak işlemcinin daha uzun süre hesaplama yapması, belleğin daha fazla kullanılması anlamına da gelir. Green Code prensipleri için pek de ideal değil. 

Şimdi yazılması biraz daha zor olan ikinci fonksiyona bakalım, calc_green. Bu fonksiyon fibonacci hesaplaması için Memoization tekniğini kullanır. Bu teknikte amaç önceden yapılmış hesaplamaların bir HashMap' te tutulması ve tekrar ihtiyaç duyulması halinde yeniden hesaplamaya gerek kalmadan kullanılabilmesidir. Dolayısıyla her sayı için hesaplama sadece bir kez yapılır diyebiliriz. Her sayı için tek bir hesaplama yapılması zaman karmaşıklığının O(n) olması anlamına gelir. Bu modelin kıymeti özellikle yüksek fibonacci sıra sayıları için anlamlıdır. 51 değerinin hesaplamasına birde bu fonksiyonla bakın derim ;)

## Coin Change Problemi

Para üstü hesaplayacağız ancak bunu minimum sayıda bozuk para kullanarak yapmak istiyoruz. Mesela 41 cents verilirse 1 Quarter + 1 Dime + 1 Nickel + 1 Penny yeterlidir. Bu en az bozukluk kullanarak 41 Cents üretilmesidir.

```text
1 Penny     = 1 Cent
1 Nickel    = 5 Cents
1 Dime      = 10 Cents
1 Quarter   = 25 Cents
```

Bu problem Coin Change olarak adlandırılıyor. İki senaryo olarak ele alınabilir. Bir senaryoda _(ki benim bu kütüphanede ele alacağımdır)_ belli bir miktarı oluşturmak için gerekli minimum bozuk para sayısı hesaplanmaya çalışılır. Diğer senaryoda ise bu miktarı oluşturmak için hangi bozukluklarının kullanılması gerektiği hesaplanır.    

## Test ve Benchmarks

Örnek fonksiyonlara ait testleri çalıştırmak ve benchmark çıktıları için aşağıdaki komutları kullanabiliriz.

```shell
cargo test
cargo bench
```

## Sistem

Benchmark koşularını yaptığım makinenin özellikleri şöyle.

| Özellik | Değer                                   |
|---------|-----------------------------------------|
| OS      | Ubuntu 22.04                            |
| CPU     | Intel® Core™ i7-6700T CPU @ 2.80GHz × 8 |
| RAM     | 32 Gb                                   |

## Fibonacci Benchmark

İlk olarak Fibonacci benchmark ölçümlerini yorumlamaya çalışalım. Criterion küfesi ile elde ettiğim sonuçlar şöyle.

```text
Worst Case/Worst/36     time:   [58.093 ms 60.141 ms 63.221 ms]
Found 1 outliers among 10 measurements (10.00%)
  1 (10.00%) high mild
Worst Case/Worst/37     time:   [95.947 ms 98.038 ms 100.20 ms]
Worst Case/Worst/38     time:   [160.89 ms 171.29 ms 177.80 ms]
Worst Case/Worst/39     time:   [246.47 ms 253.76 ms 262.40 ms]
Found 1 outliers among 10 measurements (10.00%)
  1 (10.00%) low mild
Benchmarking Worst Case/Worst/40: Warming up for 3.0000 s
Warning: Unable to complete 10 samples in 20.0s. You may wish to increase target time to 23.6s or enable flat sampling.
Worst Case/Worst/40     time:   [414.04 ms 425.41 ms 443.02 ms]
Found 1 outliers among 10 measurements (10.00%)
  1 (10.00%) high mild

Green Case/Green/36     time:   [17.796 ns 18.378 ns 18.844 ns]
Found 1 outliers among 10 measurements (10.00%)
  1 (10.00%) high mild
Green Case/Green/37     time:   [17.580 ns 17.863 ns 18.181 ns]
Green Case/Green/38     time:   [17.780 ns 17.973 ns 18.232 ns]
Green Case/Green/39     time:   [17.451 ns 17.772 ns 18.349 ns]
Found 2 outliers among 10 measurements (20.00%)
  2 (20.00%) high mild
Green Case/Green/40     time:   [17.795 ns 18.611 ns 19.507 ns]
```

Pek tabii O(n^2) ile çalışan fonksiyon O(n) çalışana göre değerler arttıkça çok çok daha yavaş kalıyor diyebiliriz. Hatta 40 değeri için Worst Case bir uyarı mesajı da vermekte. Uyarı mesajı belirlenen sürede 10 örneğin **tamamlanamadığını** söylüyor. Green Case gruplamasındaki sonuçlara göre hesaplama sürelerinin milisaniye'den nanosaniyeler seviyesine düştüğünü görüyoruz. Memoization tekniğinin bir sonucu. Buna Dramatik Performans İyileşmesi diyelim. 36'dan 40'a kadar olan hesaplamalarda Green Case için hesaplama sürelerinin neredeyse aynı kaldığına da dikkat edelim. 