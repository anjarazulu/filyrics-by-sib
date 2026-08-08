const chants = [
    {
        id: 1,
        titre: "Hazavan'ny aliko",
        auteur: "Arson Nicolas",
        compositeur: "Manoa",
        tonalite: "A / F#m",
        paroles: `Ianao ilay hazavan'ny aliko
Izay miposaka indray ho ahy
Ianao ilay manazava ny amiko rehetra
Ao am-poko Ianao no mitoetra

Na aiza na aiza na aiza misy ahy
Izaho tsy hanahy, fantatro fa
Ianao hanzava ahy
Na haizina mikitroka io
Na koa halaelo, fantatro fa
Izaho tsy handeha irery

F'Ianao ilay hazavana
Hazavana (x4)`
    },
    {
        id: 2,
        titre: "Kasiho",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "A / F#m",
        paroles: `Ny sitrakao Tompo ô, no aoka hatao
Ny lalanao no hizorako
Ny herinao no mampahery ahy
Jesosy ô mila anao ny fiainako

Raiso indray aho Jesoa, fihino an-tratranao
Fa mahery sy osa, eny kanosa tsy mahafoy Anao
Ny anilanao irery ihany no hany hasambarako
Jesosy ô, Jesosy ô kasiho ny foko`
    },
    {
        id: 3,
        titre: "Ny Ray",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "A / F#m",
        paroles: `Avelako any ireo sakana ho ahy
Ary tsy avelako hanakana ahy izao rehetra izao
Hadinoiko avokoa satria efa nofafany
Ireo ota vitako hatrizay
Ny eo anilany izao no hokasaiko

Ka na inona na inona hiseho efa fantatro fa
Manana Ray Mpiaro aho
Miahy sy mitahy, ka izaho tsy hanahy
Ny fitiavany no mampahery ahy

Izao rehetra izao zava-poana ho ahy
Mora foana, voafafan'ny fotoana
Tsy ohatra Anao, Ray
Izay momba Anao, toa lasa momba ahy
Tsy ilaiko porofo ny fisianao satria
Efa fantatro fa eo anilako eo...`
    },
    {
        id: 4,
        titre: "Magnana Azy",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "F / Dm",
        paroles: `Tompo mahery ny Andriamanitro eh
'lay Nahary izao rehetra izao, mitahy ahy sy ianao
Ireo olako kely jamais jamais, tsy hampiondrika ahy
Magnana Azy toujours mande

Koa magnana Azy eh, toujours mande
Koa magnana Azy eh, tsy maintsy courage eh eh
Koa Magnana Azy eh, tsy misy mihemotra oh
Koa Magnana Azy eh, mijoro ake

Ny ety an-tany mihoatra Azy tsy misy raha pare
Magnana Azy eh, toujours mafy eh
Ireo fahavalo manenjika, tsy hampiontsona eh
Magnana Azy eh mijoro ake

Koa magnana Azy eh, toujours mande
Koa magnana Azy eh, tsy maintsy courage eh eh
Koa Magnana Azy eh, tsy misy mihemotra oh
Koa Magnana Azy eh, mijoro ake

Izaho hoy aho (tsy ho kivy) x3
Magnana Anao miahy ahy isan'andro oh
Izaho hoy aho (tsy ho very) x3
Fa misy Anao tsy mamela ahy irery

Koa magnana Azy eh, toujours mande
Koa magnana Azy eh, tsy maintsy courage eh eh
Koa Magnana Azy eh, tsy misy mihemotra oh
Koa Magnana Azy eh, mijoro ake fô ou oh`
    },
    {
        id: 5,
        titre: "Avo Indrindra",
        auteur: "Arson Nicolas & Antsa Fifaliana",
        compositeur: "Antsa Fifaliana",
        tonalite: "C /Am",
        paroles: `Hidera Anao amin'ny foko rehetra aho
Hanambara ireo zava-mahagaga nataonao
Ny foko ent-nin'kafaliana
No hanandratako hira fitoriana ny Anaranao Masina
Ry Avo Indrindra ô

Mendrika Anao avokoa (ny haja, voninahitra)
Ianao Ray Tsitoha (ry Mpanjakan'ny lanitra)
Ny fahasoavanao no nahatonga ahy ho olom-baovao
Ny fitiavanao tokoa (no nahatoy izao ahy)
Ray Mpamindra fo (Tompo miahy)
Masina Ianao, ry Avo indrindra ô

Androany aho hihira ho Anao
Noho ny soa rehetra izay efa vitanao
Atolotray ho Anao ry Ray ny antsa avy ao am-po
Ho Anao tokoa, ry Avo indrindra ô`
    },
    {
        id: 6,
        titre: "Mahery aho",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "C / Am",
        paroles: `Ekeko hoe mafy ny ady, fantatro hoe izaho mila mafy
Ilay haka aina anie satry fa io anie tsy hoe ny ahy irery
Ka tsy asiana tomany, ny aty anie efa ohatr'izany
Fahoriana, fijaliana, dia izay ihany no miverina eo
Ny ataoko am-po hoe « ny Raiko mafy »
Ny herim-panahy no ataoko ho fitafy

Ataoko an-tsaina hoe ady io
Mihatra aman'aina fa tsy asiana taraina satria
Izaho anie tsy hoe miady irery
Ka ataoko an-tsaina hoe mitsangana rehefa mianjera
Ataoko am-po foana hoe izaho tsy ho rery
Ny ao ambony ao mijery ka fantatro
Fa izaho tsy ho very
Fanilon'ny tongotro sy hazavan'ny lalako

Mahery aho manana Anao, mahery aho Tompo ô`
    },
    {
        id: 7,
        titre: "Fantatro",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "A♭ /Fm",
        paroles: `Asehoy ahy izay mbola tsy hitako
Hazavao ireo izay tsy takatro
Lazao ahy Izay mbola tsy fantatro
Ahafantarako Anao misimisy be be kokoa

Fa mangetaheta Anao izao tontolo izao
Asehoy azy fa eo miasa sy mijery Ianao
Fa mangetaheta Anao, ny fanahiko Tompo ô
Miasà, mitoera ato am-poko Ianao Jesoa

Fantatro izay inoako, dia matoky Azy aho
(Matoky An-dRay) x2 Matoky Azy aho
Fantatro izay lazaiko, fa avy amin'ny teninao
(Ny teninao) x2 Manazava ny lalako

Ny fitiavanao no aoko ho hery ho ahy
Ny teninao, no fiadian'ny fanahy
Izao rehetra izao aoka ahalala ny herinao
Ilay mbola mihazona ahy hatrizao

Oh ! oh ! Fantatro izay inoako
Oh ! oh ! Fantatro ilay Mpamonjy ahy`
    },
    {
        id: 8,
        titre: "Hidera Anao",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "D / Bm",
        paroles: `Hidera Anao izaho Tompo Malalako ô
Hankalaza ny Anaranao Raiko tia zah (ah ! ah ! eh !)
Ny midera Anao Raiko roh hasambarako eh
Hankalaza ny Anaranao Andriamanitra

Fa ny midera Anao roh (Mahasambatsambatse)
Ny midera Anao oh (Magnome hafaliagna eh)
Ka na aiza na aiza (No mety hisy 'zao)
Dia hidera Anao oh (Tompo Ray Masina)

Hidera Anao 'zaho Tompo ô, isan'andro isan'andro
Na maraina na atoandro 'zaho hidera Anao
Hankalaza Anao 'zaho ô, isan'andro isan'andro
Na maraina na atoandro hankalaza Anao

'zaho, 'zaho, 'zaho, hankalaza Anao
'zaho, 'zaho, 'zaho, 'zaho hidera Anao

Ka hihira aho hanandratra feo mahery
Hiderako anao zegny x2
Ka hihira aho hanandratra Anao
Tompo andriamanitro eh x2`
    },
    {
        id: 9,
        titre: "Manakôry",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "B♭ / Gm",
        paroles: `Manakôry aby eh! Salama va? Akory lahaly?
Ino vaovao? Zahay salama tsy marary
Manao ahoana gôna, dia faly mahafantatra
Efa ao daholo ve ireo tapaka sy namana

Eto niany, miara-midera tsy misy miala
Fanjakam-pisorona, isika rehetra samy mpandray anjara
Alaviro androany ireo izay mety ho fahasamihafana
Fa fifankatiavana, izay ihany eto no lalàna

Andao hiara hidera eh, hiara-hitsikitsiky, hiara-hifaly
Ho ren'izao tontolo izao, ho ren-danitra, ho ren-tany
Fa isika izao mifankatia araky ny Teniny
"Mba ho iray ihany izy rehetra", izany no aoka hitoetra`
    },
    {
        id: 10,
        titre: "Iray",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "C / Am",
        paroles: `Tsy asiana fetra, tsy ho rava intsony
Fa mitohy ety, ka hatrany Aminao
Ho iray tokoa, hanao izay soa
Ho any Aminao, Ray ô
Ny fiderana no mampiray
Ny fitiavanao tsy hiala aminay
Ka ho tonga hery, tsy hisy ho very
Fa eo an-tananao 'zahay

Feo Iray, fo mifandray
No entinay hiderana Anao
Izahay ho hiray, ho mandrakizay
Ka hatrary ankoatra ary
Manana Anao hiaro ny dia

Ny sakana tsy hisy intsony
Manana Anao ny fonay ho tony
Izay rehetra atao, hampifandray
Ka fo, fanahy ho iray
Isaoranay Ianao ry Ray
Nanome 'lay talenta soa ho anay
Entinay hidera, hanandratra Anao
Ka manomboka eto dia efa Anao

Feo Iray, fo mifandray
No entinay hiderana Anao
Izahay ho hiray, ho mandrakizay
Ka hatrary ankoatra ary
Manana Anao hiaro ny dia

Ka ho rava ny efitra
Nampisaraka hatrizay
Ka miombona indray ho iray izahay
Ho ao Aminao, ho mandrakizay

Feo Iray, fo mifandray
No entinay hiderana Anao
Izahay ho hiray, ho mandrakizay
Ka hatrary ankoatra ary
Manana Anao hiaro ny dia`
    },
    {
        id: 11,
        titre: "Asandratro",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "C / Am",
        paroles: `Anio aho hihira ho Anao
Anio aho hanandratra feo vaovao
Mba ho ren'izao tontolo izao
Ny hery sy hatsaranao
Ka ho asandratro ny tanako
Izay ahy koa ho atolotro
Mba ho ren'izao tontolo izao
Fa Masina tokoa Ianao

Asandratro hatrany ny hira
Fiderana ny Anaranao
Ka ho hiraiko hatrany, hatrany
Fa Masina sy matoky Ianao

Hidera Anao ny foko sy ny saiko
Ny maha izy ahy rehetra
Hanandratra Anao amin'ny Avo
Hasandratro ho Anao
Izay rehetra mba ahy
Ny voninahitra dia ho Anao Ray`
    },
    {
        id: 12,
        titre: "Mila Anao",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        tonalite: "B♭ / Gm",
        paroles: `Sarotra, f'hijanona hijoro na dia tena reraka ary
Sarotra, f'hijanona hitsiky na dia efa hita fa marary
Sarotra, ny miaina anaty aizina f'izay no eto an-tany
Nefa tsy hampaninona ahy satria Ianao eo anampy ahy ihany

Mety ho teritery ny lalana makany f'izaho handroso sy ho eo foana
Mety ho kivy sy ketraka, matoky satria manana Anao
Misy fotoana ny lalana hikintaontaona
Fa eo mihintsy no maha mpanomponao ahy
Reraka matetika aho, fa misy Anao hijoro, ho sahy

(Ny finoako Anao) io no mbola mampahery ahy
(Ny anilanao) no tiako hitoerako indray
Fa raha misy Anao dia tsy hanan-tahotra aho
Tsy handeha irery izany, ary koa tsy hanahy
Fa tantananao aho isaky ny mamindra, oh Raiko tia ahy

F'efa fantatra fa (mila Anao) ny fiainako
Izay rehetra atao dia (Mila Anao) ry mpamonjiko
Satria misy Anao dia tsy hanan-tahotra
Tsy handeha irery izany ary koa tsy hanahy
Fa tantananao isaky ny mamindra, oh Raiko tia ahy`
    },
];
  
