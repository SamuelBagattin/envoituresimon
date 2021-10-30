const moment =  require("moment/moment");

const axios = require('axios');
const fs = require('fs')
const cheerio = require('cheerio');

const sessionToken  = fs.readFileSync("../secrets/token.txt",{encoding:'utf8', flag:'r'})
const regexFindHtml = new RegExp(fs.readFileSync("regex.txt",{encoding:'utf8', flag:'r'}).toString(), 'gm');

const get_name_of_day  = (daynumber) => {
    switch (daynumber) {
        case 1: return 'lundi'
        case 2: return 'mardi'
        case 3: return 'mercredi'
        case 4: return 'jeudi'
        case 5: return 'vendredi'
        case 6: return 'samedi'
        case 7: return 'dimanche'
        default: throw "ERROR DAY NOT FOUND"
    }
}

const get_dispos = async (formatedDate) => {
    var config = {
        method: 'get',
        url: `https://driving.envoituresimone.com/lesson/nouvelle?utf8=%E2%9C%93&new_lesson%5Bfilters_completed%5D=true&new_lesson%5Bteacher%5D=&new_lesson%5Blat%5D=44.8350088&new_lesson%5Blng%5D=-0.5872689999999999&new_lesson%5Baddress_input%5D=33000%20Bordeaux&new_lesson%5Bdate_not_formatted%5D=lun.%2027%20septembre%202021&new_lesson%5Bdate%5D=${formatedDate}&new_lesson%5Bdurations%5D%5B%5D=&new_lesson%5Bdurations%5D%5B%5D=3600&new_lesson%5Bdurations%5D%5B%5D=7200&select_all=on&new_lesson%5Blocations%5D%5B%5D=&new_lesson%5Blocations%5D%5B%5D=8724458916&new_lesson%5Blocations%5D%5B%5D=4585692731&new_lesson%5Blocations%5D%5B%5D=6284745916&new_lesson%5Blocations%5D%5B%5D=6167958299&new_lesson%5Blocations%5D%5B%5D=6289715914&new_lesson%5Blocations%5D%5B%5D=5621297896&new_lesson%5Blocations%5D%5B%5D=8457195269&new_lesson%5Blocations%5D%5B%5D=2717686599&new_lesson%5Blocations%5D%5B%5D=1957164825&new_lesson%5Blocations%5D%5B%5D=1125998765&new_lesson%5Blocations%5D%5B%5D=5661257896&new_lesson%5Blocations%5D%5B%5D=5829817368&new_lesson%5Blocations%5D%5B%5D=4587692711&new_lesson%5Blocations%5D%5B%5D=2957163825&new_lesson%5Blocations%5D%5B%5D=5829317868&new_lesson%5Blocations%5D%5B%5D=8726951916&new_lesson%5Blocations%5D%5B%5D=1325498768&new_lesson%5Blocations%5D%5B%5D=5829517569&new_lesson%5Blocations%5D%5B%5D=1325998763&new_lesson%5Blocations%5D%5B%5D=8727653916&new_lesson%5Blocations%5D%5B%5D=3126496578&select_all=on&new_lesson%5Bdays%5D%5B%5D=&new_lesson%5Bdays%5D%5B%5D=lundi&new_lesson%5Bdays%5D%5B%5D=mardi&new_lesson%5Bdays%5D%5B%5D=mercredi&new_lesson%5Bdays%5D%5B%5D=jeudi&new_lesson%5Bdays%5D%5B%5D=vendredi&new_lesson%5Bdays%5D%5B%5D=samedi&new_lesson%5Bdays%5D%5B%5D=dimanche`,
        headers: {
            'authority': 'driving.envoituresimone.com',
            'sec-ch-ua': '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
            'accept': '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
            'x-csrf-token': 'AWn1mJOR8ogJn2bVQCB0GUn0iBzzXDiNefPAJqlZWWLoZISNaCbtMNxbjZewNHhNu6ZR4IPLa0DG7PnXo1uJfQ==',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://driving.envoituresimone.com/lesson/nouvelle',
            'accept-language': 'en-US,en;q=0.9',
            'Cookie': `_simone_session=${sessionToken.toString()}; use_criteo=false`
        }
    };

    const res = await axios(config)
    if(res.data.includes("Prochain résultat")) return [];
    const matches = [...res.data.matchAll(regexFindHtml)]
    fs.writeFileSync('data.html', matches[0][1])
    const $ = cheerio.load("<html lang=\"fr\"><head><title></title></head><body><div id='results-container'></div></body></html>")
    eval(res.data)
    const dispos = []
    for (const element of $(".col-xs-12#scrollmenu-container .row").toArray()) {
        const el = $(element)
        const loc = el.find('h5').text().trim()
        const timees = []
        el.find('[data-starts-at]').toArray().forEach(e => {
            const texxxt = $(e).text().trim()
            if(
                //texxxt.startsWith("12h30") ||
                (texxxt.startsWith("18") && moment(formatedDate).isoWeekday() > 4) ||
                texxxt.startsWith("19") ||
                texxxt.startsWith("20") ||
                texxxt.startsWith("21") ||
                moment(formatedDate).isoWeekday() > 5
            ){
                timees.push(texxxt)
            }
        })

        if(loc != "" && timees.length != 0){
            dispos.push({
                location: loc,
                time:  timees,
            })
        }

    }
    return dispos
}

const main = async () => {
    const fin = [];
    for (const n of [...Array(120).keys()]) {
        const dddate = moment().add(n, 'days').format('YYYY-MM-DD')
        const dispos = await get_dispos(dddate)
        if(dispos.length != 0 ){
            fin.push({
                date: dddate,
                dispos: dispos,
                day: get_name_of_day(moment(dddate).isoWeekday())

            })
        }
        console.log(n)
    }

    try {
        const axiosResponse = await axios.post(`https://discord.com/api/webhooks/889240678473822279/9Q9pAi1Lr6CouLtPCS-vxjqNnXgw8bdxNi6bAIXCyVKKRESa7uIM6GFUZXL1WV2uXo8G`, {
            "embeds": [
                {
                    "title": `${fin.length} jours disponibles`,
                    "color": 15258703,
                    "fields": fin.map(e => {
                        return {
                            name: `${e.date} - ${e.day}`,
                            value: e.dispos.map(d => `${d.location.split('\n')[0]} - ${d.time.map(v => v.split("\n")[0]).join('/')}`).join('\n')
                        };
                    })
                }
            ]
        })
    } catch (e) {
        console.warn(e)
    }
    return

}
main().then()