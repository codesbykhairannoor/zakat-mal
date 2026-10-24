/**
 * zakat-mal: Authoritative Al-Qur'an Dalil Database
 */

import { DalilReference } from '../types/common';

export const QURAN_DALIL: Record<string, DalilReference> = {
  PURIFICATION_COMMAND: {
    id: 'quran_at_tawbah_103',
    category: 'quran',
    title: 'Perintah Memungut Zakat untuk Menyucikan Harta dan Jiwa',
    titleEn: 'Command to Collect Zakat to Purify Wealth and Souls',
    source: "QS. At-Tawbah (9:103)",
    arabicText: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَّهُمْ ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ',
    transliteration: "Khudh min amwālihim sadaqatan tutahhiruhum wa tuzakkīhim bihā wa salli 'alayhim, inna salātaka sakanul lahum, wallāhu samī'un 'alīm.",
    translationEn: 'Take, [O, Muhammad], from their wealth a charity by which you purify them and cause them increase, and invoke [Allah\'s blessings] upon them. Indeed, your invocations are reassurance for them. And Allah is Hearing and Knowing.',
    translationId: 'Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka dan berdoalah untuk mereka. Sesungguhnya doa kamu itu (menjadi) ketenteraman jiwa bagi mereka. Dan Allah Maha Mendengar lagi Maha Mengetahui.',
    grade: 'Mutawatir (Al-Qur\'an Al-Karim)',
    relevance: 'Dalil asasi kewajiban zakat mal atas segala bentuk kekayaan yang berkembang (an-nama\') untuk menyucikan jiwa dan membersihkan harta.'
  },

  GOLD_SILVER_WARNING: {
    id: 'quran_at_tawbah_34_35',
    category: 'quran',
    title: 'Kewajiban Zakat Emas dan Perak serta Larangan Menimbun Harta',
    titleEn: 'Obligation of Gold and Silver Zakat and Prohibition of Wealth Hoarding',
    source: "QS. At-Tawbah (9:34-35)",
    arabicText: 'وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلَا يُنفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ ۝ يَوْمَ يُحْمَىٰ عَلَيْهَا فِي نَارِ جَهَنَّمَ فَتُكْوَىٰ بِهَا جِبَاهُهُمْ وَجُنُوبُهُمْ وَظُهُورُهُمْ ۖ هَٰذَا مَا كَنَزْتُمْ لِأَنفُسِكُمْ فَذُوقُوا مَا كُنتُمْ تَكْنِزُونَ',
    transliteration: "Walladhīna yaknizūnadhdhahaba wal fiddhata wa lā yunfiqūnahā fī sabīlillāhi fabashshirhum bi'adhābin alīm.",
    translationEn: 'And those who hoard gold and silver and spend it not in the way of Allah - give them tidings of a painful punishment. The Day when it will be heated in the fire of Hell and seared therewith will be their foreheads, their flanks, and their backs, [it will be said], "This is what you hoarded for yourselves, so taste what you used to hoard."',
    translationId: 'Dan orang-orang yang menyimpan emas dan perak dan tidak menafkahkannya pada jalan Allah, maka beritahukanlah kepada mereka, (bahwa mereka akan mendapat) siksa yang pedih, pada hari dipanaskan emas perak itu dalam neraka Jahannam, lalu dibakar dengannya dahi mereka, lambung dan punggung mereka (lalu dikatakan) kepada mereka: "Inilah harta bendamu yang kamu simpan untuk dirimu sendiri, maka rasakanlah sekarang (akibat dari) apa yang kamu simpan itu."',
    grade: 'Mutawatir (Al-Qur\'an Al-Karim)',
    relevance: 'Landasan nash qath\'i kewajiban zakat emas, perak, dan seluruh instrumen moneter penyimpan nilai (cash, deposito, tabungan, mata uang).'
  },

  EARNED_WEALTH_BUSINESS: {
    id: 'quran_al_baqarah_267',
    category: 'quran',
    title: 'Kewajiban Menafkahkan Hasil Usaha / Perniagaan yang Baik',
    titleEn: 'Obligation to Spend from Wholesome Earned Wealth and Trade',
    source: "QS. Al-Baqarah (2:267)",
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَنفِقُوا مِن طَيِّبَاتِ مَا كَسَبْتُمْ وَمِمَّا أَخْرَجْنَا لَكُم مِّنَ الْأَرْضِ ۖ وَلَا تَيَمَّمُوا الْخَبِيثَ مِنْهُ تُنفِقُونَ وَلَسْتُم بِآخِذِيهِ إِلَّا أَن تُغْمِضُوا فِيهِ ۚ وَاعْلَمُوا أَنَّ اللَّهَ غَنِيٌّ حَمِيدٌ',
    transliteration: "Yā ayyuhalladhīna āmanū anfiqū min tayyibāti mā kasabtum wa mimmā akhrajnā lakum minal ard...",
    translationEn: 'O you who have believed, spend from the good things which you have earned and from that which We have produced for you from the earth. And do not aim toward the defective therefrom, spending [from that] while you would not take it [yourself] except with closed eyes. And know that Allah is Free of need and Praiseworthy.',
    translationId: 'Hai orang-orang yang beriman, nafkahkanlah (di jalan Allah) sebagian dari hasil usahamu yang baik-baik dan sebagian dari apa yang Kami keluarkan dari bumi untuk kamu. Dan janganlah kamu memilih yang buruk-buruk lalu kamu menafkahkan daripadanya, padahal kamu sendiri tidak mau mengambilnya melainkan dengan memicingkan mata terhadapnya. Dan ketahuilah, bahwa Allah Maha Kaya lagi Maha Terpuji.',
    grade: 'Mutawatir (Al-Qur\'an Al-Karim)',
    relevance: 'Dalil utama kewajiban zakat perniagaan / perdagangan (\'urud at-tijarah) dan zakat profesi/penghasilan atas kasab (penghasilan halal).'
  },

  AGRICULTURE_HARVEST: {
    id: 'quran_al_anam_141',
    category: 'quran',
    title: 'Kewajiban Menunaikan Hak (Zakat) Pertanian pada Hari Panen',
    titleEn: 'Obligation to Render Zakat on Crops on the Day of Harvest',
    source: "QS. Al-An'am (6:141)",
    arabicText: 'وَهُوَ الَّذِي أَنشَأَ جَنَّاتٍ مَّعْرُوشَاتٍ وَغَيْرَ مَعْرُوشَاتٍ وَالنَّخْلَ وَالزَّرْعَ مُخْتَلِفًا أُكُلُهُ وَالزَّيْتُونَ وَالرُّمَّانَ مُتَشَابِهًا وَغَيْرَ مُتَشَابِهٍ ۚ كُلُوا مِن ثَمَرِهِ إِذَا أَثْمَرَ وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ ۖ وَلَا تُسْرِفُوا ۚ إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ',
    transliteration: "Wa huwalladhī ansha'a jannātim ma'rūshātiw wa ghayra ma'rūshātiw wan-nakhla waz-zar'a mukhtalifan ukuluh... wa ātū haqqahū yawma hasādih...",
    translationEn: 'And He it is who causes gardens to grow, [both] trellised and untrellised, and palm trees and crops of different [kinds of] food and olives and pomegranates, similar and dissimilar. Eat of [each of] its fruit when it yields and give its due [zakat] on the day of its harvest. And be not excessive. Indeed, He does not like those who commit excess.',
    translationId: 'Dan Dialah yang menjadikan kebun-kebun yang berjunjung dan yang tidak berjunjung, pohon korma, tanam-tanaman yang bermacam-macam buahnya, zaitun dan delima yang serupa (bentuk dan warnanya) dan tidak sama (rasanya). Makanlah dari buahnya (yang bermacam-macam itu) bila dia berbuah, dan tunaikanlah haknya di hari memetik hasilnya (dengan disedekahkan kepada fakir miskin); dan janganlah kamu berlebih-lebihan. Sesungguhnya Allah tidak menyukai orang-orang yang berlebih-lebihan.',
    grade: 'Mutawatir (Al-Qur\'an Al-Karim)',
    relevance: 'Dalil qath\'i bahwa zakat hasil pertanian, perkebunan, dan buah-buahan wajib dikeluarkan seketika saat panen tanpa mensyaratkan berlalunya haul 1 tahun.'
  },

  ZAKAT_ASNAF: {
    id: 'quran_at_tawbah_60',
    category: 'quran',
    title: 'Delapan Golongan Penerima Zakat (Asnaf Al-Mustahiqqin)',
    titleEn: 'The Eight Prescribed Categories of Zakat Beneficiaries (Asnaf Al-Mustahiqqin)',
    source: "QS. At-Tawbah (9:60)",
    arabicText: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ ۖ فَرِيضَةً مِّنَ اللَّهِ ۗ وَاللَّهُ عَلِيمٌ حَكِيمٌ',
    transliteration: "Innamas-sadaqātu lil-fuqarā'i wal-masākīni wal-'āmilīna 'alayhā wal-mu'allafati qulūbuhum wa fir-riqābi wal-ghārimīna wa fī sabīlillāhi wabnis-sabīli farīdatam minallāh, wallāhu 'alīmun hakīm.",
    translationEn: 'Zakah expenditures are only for the poor and for the needy and for those employed to collect [zakah] and for bringing hearts together [for Islam] and for freeing captives [or slaves] and for those in debt and for the cause of Allah and for the [stranded] traveler - an obligation [imposed] by Allah. And Allah is Knowing and Wise.',
    translationId: 'Sesungguhnya zakat-zakat itu, hanyalah untuk orang-orang fakir, orang-orang miskin, pengurus-pengurus zakat, para mu\'allaf yang dibujuk hatinya, untuk (memerdekakan) budak, orang-orang yang berhutang, untuk jalan Allah dan untuk mereka yag sedang dalam perjalanan, sebagai suatu ketetapan yang diwajibkan Allah, dan Allah Maha Mengetahui lagi Maha Bijaksana.',
    grade: 'Mutawatir (Al-Qur\'an Al-Karim)',
    relevance: 'Penetapan syar\'i 8 asnaf penerima zakat yang eksklusif (innamā) sebagai dasar distribusi zakat.'
  }
};
