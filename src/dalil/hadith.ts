/**
 * zakat-mal: Authoritative Sahih Hadith Database
 */

import { DalilReference } from '../types/common';

export const HADITH_DALIL: Record<string, DalilReference> = {
  GOLD_SILVER_NISAB_RATE: {
    id: 'hadith_abu_dawud_1573',
    category: 'hadith',
    title: 'Nisab dan Kadar Zakat Emas (20 Dinar = 85g) & Perak (200 Dirham = 595g)',
    source: 'Sunan Abu Dawud No. 1573, dari Ali bin Abi Thalib r.a.',
    arabicText: 'فَإِذَا كَانَتْ لَكَ مِائَتَا دِرْهَمٍ وَحَالَ عَلَيْهَا الْحَوْلُ فَفِيهَا خَمْسَةُ دَرَاهِمَ، وَلَيْسَ عَلَيْكَ شَيْءٌ - يَعْنِي فِي الذَّهَبِ - حَتَّى يَكُونَ لَكَ عِشْرُونَ دِينَارًا، فَإِذَا كَانَتْ لَكَ عِشْرُونَ دِينَارًا وَحَالَ عَلَيْهَا الْحَوْلُ فَفِيهَا نِصْفُ دِينَارٍ، فَمَا زَادَ فَبِحِسَابِ ذَلِكَ',
    translationEn: 'When you possess two hundred dirhams and a year passes, five dirhams are due. And you owe nothing on gold until you possess twenty dinars. When you possess twenty dinars and a year passes, half a dinar is due. Whatever exceeds that is calculated proportionally.',
    translationId: 'Bila kamu memiliki 200 dirham dan telah berlalu satu haul (satu tahun), maka padanya wajib zakat 5 dirham. Dan tidak ada kewajiban atasmu sesuatu pun - yakni pada emas - hingga kamu memiliki 20 dinar. Bila kamu telah memiliki 20 dinar dan telah berlalu satu haul, maka padanya wajib zakat setengah dinar. Dan kelebihannya dihitung sesuai proporsi kelipatannya.',
    grade: 'Hasan / Sahih (Dishahihkan oleh Syaikh Al-Albani dalam Shahih Sunan Abi Dawud)',
    relevance: 'Penetapan qath\'i bahwa nisab emas adalah 20 dinar (= 85 gram emas murni 24 karat) dengan kadar zakat 2.5% (setengah dinar dari 20 dinar), serta nisab perak 200 dirham (= 595 gram perak murni).'
  },

  SILVER_FIVE_UQIAH: {
    id: 'hadith_bukhari_1405_muslim_979',
    category: 'hadith',
    title: 'Nisab Minimal 5 Awaq (Perak) dan 5 Wasaq (Pertanian)',
    source: 'Sahih Bukhari No. 1405 & Sahih Muslim No. 979, dari Abu Sa\'id Al-Khudri r.a.',
    arabicText: 'لَيْسَ فِيمَا دُونَ خَمْسِ أَوَاقٍ صَدَقَةٌ، وَلَيْسَ فِيمَا دُونَ خَمْسِ ذَوْدٍ صَدَقَةٌ، وَلَيْسَ فِيمَا دُونَ خَمْسَةِ أَوْسُقٍ صَدَقَةٌ',
    translationEn: 'There is no charity (zakat) on anything less than five Uqiyah [200 dirhams silver], there is no charity on less than five camels, and there is no charity on less than five Wasaq [of grain/dates].',
    translationId: 'Tidak ada zakat pada harta perak yang kurang dari 5 awaq (200 dirham / 595 gram), tidak ada zakat pada unta yang kurang dari 5 ekor, dan tidak ada zakat pada hasil tanaman yang kurang dari 5 wasaq (300 sha\' / ~653 kg).',
    grade: 'Muttafaq \'Alayh (Sahih Bukhari & Sahih Muslim)',
    relevance: 'Hadits shahih muttafaq \'alayh yang menetapkan batasan nisab perak (5 awaq), nisab unta (5 ekor), dan nisab pertanian (5 wasaq).'
  },

  BUSINESS_TRADE_INVENTORY: {
    id: 'hadith_abu_dawud_1562',
    category: 'hadith',
    title: 'Kewajiban Zakat Barang Dagangan / Perniagaan (\'Urud At-Tijarah)',
    source: 'Sunan Abu Dawud No. 1562, dari Samurah bin Jundub r.a.',
    arabicText: 'أَمَّا بَعْدُ، فَإِنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ كَانَ يَأْمُرُنَا أَنْ نُخْرِجَ الصَّدَقَةَ مِنَ الَّذِي نُعِدُّ لِلْبَيْعِ',
    translationEn: 'The Messenger of Allah (ﷺ) used to command us to pay zakat from whatever we prepared for sale.',
    translationId: 'Amma ba\'du, sesungguhnya Rasulullah shallallahu \'alaihi wa sallam memerintahkan kami untuk mengeluarkan zakat dari harta yang kami persiapkan untuk dijual (barang perniagaan).',
    grade: 'Hasan (Diriwayatkan oleh Abu Dawud, Ad-Daruquthni, dan Al-Baihaqi)',
    relevance: 'Landasan hadits utama kewajiban zakat perniagaan atas persediaan barang dagangan (inventory) yang diperjualbelikan untuk mencari laba.'
  },

  AGRICULTURE_IRRIGATION_RATES: {
    id: 'hadith_bukhari_1483',
    category: 'hadith',
    title: 'Kadar Zakat Pertanian: 10% Pengairan Alami vs 5% Pengairan Buatan',
    source: 'Sahih Bukhari No. 1483, dari Salim bin Abdullah dari ayahnya (Abdullah bin Umar r.a.)',
    arabicText: 'فِيمَا سَقَتِ السَّمَاءُ وَالْعُيُونُ أَوْ كَانَ عَثَرِيًّا الْعُشْرُ، وَمَا سُقِيَ بِالنَّضْحِ نِصْفُ الْعُشْرِ',
    translationEn: 'On land irrigated by rain water or by natural springs or if the land is wet due to water channels, one-tenth (10%) is compulsory, and on the land irrigated by the water drawn from a well or camel, half of the one-tenth (5%) is compulsory.',
    translationId: 'Pada tanaman yang diairi oleh air hujan, mata air alami, atau tadah hujan, zakatnya adalah sepersepuluh (10%). Dan pada tanaman yang diairi dengan penyiraman alat/kincir/biaya, zakatnya adalah setengah dari sepersepuluh (5%).',
    grade: 'Sahih (HR. Bukhari)',
    relevance: 'Penetapan diferensiasi tarif zakat pertanian berdasarkan ada tidaknya biaya pengairan (bi kulfa = 5% vs bighayri kulfa = 10%).'
  },

  RIKAZ_KHUMUS_20_PERCENT: {
    id: 'hadith_bukhari_1499_muslim_1710',
    category: 'hadith',
    title: 'Kadar Zakat Barang Temuan Purbakala (Rikaz) Sebesar Seperlima (20%)',
    source: 'Sahih Bukhari No. 1499 & Sahih Muslim No. 1710, dari Abu Hurairah r.a.',
    arabicText: 'الْعَجْمَاءُ جُرْحُهَا جُبَارٌ، وَالْبِئْرُ جُبَارٌ، وَالْمَعْدِنُ جُبَارٌ، وَفِي الرِّكَازِ الْخُمُسُ',
    translationEn: 'Compensation for injuries caused by animals is not payable, nor is it payable for falls into wells or mines. And in Rikaz [buried ancient treasure] there is one-fifth (20%).',
    translationId: 'Kerusakan yang disebabkan oleh hewan tidak ada gantinya, sumur tua tidak ada gantinya, tambang tua tidak ada gantinya, dan pada harta rikaz (harta temuan terpendam) zakatnya adalah seperlima (20%).',
    grade: 'Muttafaq \'Alayh (Sahih Bukhari & Sahih Muslim)',
    relevance: 'Penetapan nash mutlak bahwa zakat barang temuan (rikaz) adalah 20% (al-khumus) dikeluarkan seketika tanpa syarat haul.'
  },

  LIVESTOCK_SHEEP_CAMEL_LETTER: {
    id: 'hadith_bukhari_1454',
    category: 'hadith',
    title: 'Kitab Shadaqah Abu Bakr Ash-Shiddiq: Rincian Lengkap Zakat Unta dan Kambing',
    source: 'Sahih Bukhari No. 1454, dari Anas bin Malik r.a.',
    arabicText: 'هَذِهِ فَرِيضَةُ الصَّدَقَةِ الَّتِي فَرَضَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ عَلَى الْمُسْلِمِينَ... فِي أَرْبَعٍ وَعِشْرِينَ مِنَ الإِبِلِ فَمَا دُونَهَا مِنَ الغَنَمِ، فِي كُلِّ خَمْسٍ شَاةٌ... وَفِي صَدَقَةِ الْغَنَمِ فِي سَائِمَتِهَا إِذَا كَانَتْ أَرْبَعِينَ إِلَى عِشْرِينَ وَمِائَةٍ شَاةٌ، فَإِذَا زَادَتْ عَلَى عِشْرِينَ وَمِائَةٍ إِلَى مِائَتَيْنِ شَاتَانِ، فَإِذَا زَادَتْ عَلَى مِائَتَيْنِ إِلَى ثَلَاثِ مِائَةٍ فَفِيهَا ثَلَاثُ شِيَاهٍ، فَإِذَا زَادَتْ عَلَى ثَلَاثِ مِائَةٍ فَفِي كُلِّ مِائَةٍ شَاةٌ',
    translationEn: 'This is the obligation of charity which the Messenger of Allah (ﷺ) made obligatory upon Muslims... In twenty-four camels or less, sheep are given: for every five camels, one sheep... And in the zakat of sheep that graze on pasture, if they are between forty and one hundred and twenty, one sheep is due; if they exceed one hundred and twenty up to two hundred, two sheep are due; if they exceed two hundred up to three hundred, three sheep are due; and if they exceed three hundred, then for every hundred sheep, one sheep is due.',
    translationId: 'Inilah ketentuan zakat yang telah difardhukan oleh Rasulullah shallallahu \'alaihi wa sallam kepada kaum Muslimin... Pada 24 ekor unta ke bawah, zakatnya adalah kambing: setiap 5 ekor unta wajib 1 ekor kambing... Dan pada zakat kambing yang digembalakan di padang rumput bebas (sa\'imah), bila berjumlah 40 hingga 120 ekor zakatnya 1 ekor kambing; bila lebih dari 120 hingga 200 ekor zakatnya 2 ekor kambing; bila lebih dari 200 hingga 300 ekor zakatnya 3 ekor kambing; dan bila lebih dari 300 ekor maka pada setiap kelipatan 100 ekor zakatnya 1 ekor kambing.',
    grade: 'Sahih (HR. Bukhari)',
    relevance: 'Dokumen konstitusional Fiqh Zakat terlengkap yang merinci tingkatan nisab hewan ternak unta dan kambing.'
  },

  LIVESTOCK_CATTLE_MUADH: {
    id: 'hadith_abu_dawud_1572_tirmidhi_622',
    category: 'hadith',
    title: 'Ketentuan Zakat Sapi / Kerbau: Setiap 30 Ekor (Tabi\') & Setiap 40 Ekor (Musinnah)',
    source: 'Sunan Abu Dawud No. 1572, At-Tirmidhi No. 622, dari Mu\'adz bin Jabal r.a.',
    arabicText: 'بَعَثَنِي النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ إِلَى الْيَمَنِ، فَأَمَرَنِي أَنْ آخُذَ مِنْ كُلِّ ثَلَاثِينَ بَقَرَةً تَبِيعًا أَوْ تَبِيعَةً، وَمِنْ كُلِّ أَرْبَعِينَ مُسِنَّةً',
    translationEn: 'The Prophet (ﷺ) sent me to Yemen and commanded me to take from every thirty cattle a Tabi\' (a one-year-old male or female calf) and from every forty a Musinnah (a two-year-old cow).',
    translationId: 'Nabi shallallahu \'alaihi wa sallam mengutusku ke Yaman dan memerintahkanku untuk mengambil zakat dari setiap 30 ekor sapi seekor tabi\' atau tabi\'ah (anak sapi jantan/betina berumur 1 tahun), dan dari setiap 40 ekor sapi seekor musinnah (sapi betina berumur 2 tahun).',
    grade: 'Sahih (Dishahihkan oleh Imam At-Tirmidhi, Ibnu Hibban, dan Al-Albani)',
    relevance: 'Hadits shahih yang menjadi formula universal zakat sapi dan kerbau: pemecahan kombinasi bilangan bulat kelipatan 30 (tabi\') dan kelipatan 40 (musinnah).'
  },

  HAWL_CONDITION: {
    id: 'hadith_abu_dawud_1573_tirmidhi_631',
    category: 'hadith',
    title: 'Syarat Haul 1 Tahun Penuh untuk Zakat Harta Tertentu',
    source: 'Sunan Abu Dawud No. 1573, Sunan At-Tirmidhi No. 631, dari Ali bin Abi Thalib & Aisyah r.a.',
    arabicText: 'لَا زَكَاةَ فِي مَالٍ حَتَّى يَحُولَ عَلَيْهِ الْحَوْلُ',
    translationEn: 'There is no zakat on any wealth until a full year has passed over it.',
    translationId: 'Tidak ada zakat pada suatu harta hingga telah berlalu padanya satu haul (satu tahun kepemilikan penuh).',
    grade: 'Shahih bi Syawahidihi (Dikuatkan oleh berbagai jalur periwayatan dari Ali, Ibnu Umar, dan Aisyah)',
    relevance: 'Penetapan syarat haul (berlalunya satu tahun genap kepemilikan) untuk harta emas, perak, uang simpanan, perniagaan, dan peternakan.'
  }
};
